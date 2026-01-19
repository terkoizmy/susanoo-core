//! AETHERIS Engine - Robotics Simulation and MQTT Communication Hub
//!
//! This module provides:
//! - Async MQTT client for robot coordination
//! - Heartbeat mechanism for connectivity monitoring
//! - Multi-robot telemetry broadcasting
//! - Command dispatch and response handling

use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;

use anyhow::{Context, Result};
use rumqttc::{AsyncClient, Event, EventLoop, MqttOptions, Packet, QoS};
use serde_json;
use tokio::sync::{RwLock, mpsc};
use tokio::time::{Instant, interval};
use tracing::{debug, error, info, warn};

use aetheris_shared::{
    AnomalyReport, AnomalyType, Command, CommandResponse, CurrentTask, FaultType, HealthStatus,
    Heartbeat, MqttMessage, PipeEnvironment, Position, RobotState, RobotStatus, RobotType,
    SeverityLevel, Velocity, topics,
};

// ============================================================================
// CONFIGURATION
// ============================================================================

/// MQTT client configuration
#[derive(Debug, Clone)]
pub struct MqttConfig {
    pub broker_host: String,
    pub broker_port: u16,
    pub client_id: String,
    pub keep_alive_secs: u64,
    pub clean_session: bool,
}

impl Default for MqttConfig {
    fn default() -> Self {
        Self {
            broker_host: "localhost".into(),
            broker_port: 1883,
            client_id: format!("aetheris-engine-{}", uuid::Uuid::new_v4()),
            keep_alive_secs: 30,
            clean_session: true,
        }
    }
}

// ============================================================================
// ROBOT FLEET MANAGER
// ============================================================================

/// Manages the state of all robots in the fleet
#[derive(Debug, Default)]
pub struct FleetManager {
    /// Map of robot ID to current state
    robots: HashMap<String, RobotState>,
    /// Last heartbeat received from each robot
    last_heartbeat: HashMap<String, Instant>,
    /// Heartbeat timeout duration
    heartbeat_timeout: Duration,
}

impl FleetManager {
    pub fn new(heartbeat_timeout: Duration) -> Self {
        Self {
            robots: HashMap::new(),
            last_heartbeat: HashMap::new(),
            heartbeat_timeout,
        }
    }

    /// Register a new robot or update existing
    pub fn update_robot(&mut self, state: RobotState) {
        let robot_id = state.id.clone();
        self.robots.insert(robot_id.clone(), state);
        self.last_heartbeat.insert(robot_id, Instant::now());
    }

    /// Record heartbeat from a robot
    pub fn record_heartbeat(&mut self, robot_id: &str) {
        self.last_heartbeat
            .insert(robot_id.to_string(), Instant::now());
    }

    /// Get all robots that have timed out
    pub fn get_timed_out_robots(&self) -> Vec<String> {
        let now = Instant::now();
        self.last_heartbeat
            .iter()
            .filter(|(_, last_seen)| now.duration_since(**last_seen) > self.heartbeat_timeout)
            .map(|(id, _)| id.clone())
            .collect()
    }

    /// Mark a robot as offline
    pub fn mark_offline(&mut self, robot_id: &str) {
        if let Some(robot) = self.robots.get_mut(robot_id) {
            robot.status = RobotStatus::Offline;
            robot.health = HealthStatus::Critical;
        }
    }

    /// Get all connected robots
    pub fn get_all_robots(&self) -> Vec<&RobotState> {
        self.robots.values().collect()
    }

    /// Get a specific robot by ID
    pub fn get_robot(&self, id: &str) -> Option<&RobotState> {
        self.robots.get(id)
    }
}

// ============================================================================
// MQTT MESSAGE HANDLER
// ============================================================================

/// Internal message types for the engine
#[derive(Debug)]
pub enum EngineMessage {
    TelemetryReceived(RobotState),
    HeartbeatReceived(Heartbeat),
    AlertReceived(AnomalyReport),
    EnvironmentReceived(PipeEnvironment),
    CommandResponseReceived(CommandResponse),
    CommandReceived(Command, String), // (command, source)
}

/// Generate random coordinate for simulated positions
fn rand_coord() -> f64 {
    (rand::random::<f64>() - 0.5) * 200.0 // Range: -100 to 100
}

// ============================================================================
// AETHERIS MQTT CLIENT
// ============================================================================

/// Main MQTT communication hub for the AETHERIS system
pub struct AetherisMqtt {
    client: AsyncClient,
    config: MqttConfig,
    fleet: Arc<RwLock<FleetManager>>,
    message_tx: mpsc::Sender<EngineMessage>,
    sequence: Arc<std::sync::atomic::AtomicU64>,
}

impl AetherisMqtt {
    /// Create a new MQTT client with default configuration
    pub async fn new(
        config: MqttConfig,
        message_tx: mpsc::Sender<EngineMessage>,
    ) -> Result<(Self, EventLoop)> {
        let mut mqtt_opts =
            MqttOptions::new(&config.client_id, &config.broker_host, config.broker_port);
        mqtt_opts.set_keep_alive(Duration::from_secs(config.keep_alive_secs));
        mqtt_opts.set_clean_session(config.clean_session);

        let (client, eventloop) = AsyncClient::new(mqtt_opts, 100);

        let mqtt = Self {
            client,
            config,
            fleet: Arc::new(RwLock::new(FleetManager::new(Duration::from_secs(15)))),
            message_tx,
            sequence: Arc::new(std::sync::atomic::AtomicU64::new(0)),
        };

        Ok((mqtt, eventloop))
    }

    /// Subscribe to all relevant AETHERIS topics
    pub async fn subscribe_all(&self) -> Result<()> {
        info!("Subscribing to AETHERIS MQTT topics...");

        // Subscribe to telemetry from all robots
        self.client
            .subscribe(topics::TELEMETRY_ALL, QoS::AtLeastOnce)
            .await
            .context("Failed to subscribe to telemetry")?;

        // Subscribe to heartbeats
        self.client
            .subscribe(topics::HEARTBEAT_ALL, QoS::AtLeastOnce)
            .await
            .context("Failed to subscribe to heartbeats")?;

        // Subscribe to alerts
        self.client
            .subscribe(topics::ALERTS, QoS::AtLeastOnce)
            .await
            .context("Failed to subscribe to alerts")?;

        // Subscribe to environment readings
        self.client
            .subscribe(topics::ENVIRONMENT_ALL, QoS::AtLeastOnce)
            .await
            .context("Failed to subscribe to environment")?;

        // Subscribe to command responses (for dashboard)
        self.client
            .subscribe("aetheris/responses/+", QoS::AtLeastOnce)
            .await
            .context("Failed to subscribe to responses")?;

        // Subscribe to commands (to handle chaos scenarios)
        self.client
            .subscribe(topics::COMMANDS_ALL, QoS::AtLeastOnce)
            .await
            .context("Failed to subscribe to commands")?;

        info!("Successfully subscribed to all AETHERIS topics");
        Ok(())
    }

    /// Send a command to a specific robot
    pub async fn send_command(&self, robot_id: &str, command: Command) -> Result<()> {
        let topic = topics::commands(robot_id);
        let seq = self.next_sequence();
        let msg = MqttMessage::new(command, "engine", seq);
        let payload = serde_json::to_string(&msg)?;

        self.client
            .publish(&topic, QoS::AtLeastOnce, false, payload)
            .await
            .context("Failed to publish command")?;

        info!(robot_id = %robot_id, "Command sent");
        Ok(())
    }

    /// Broadcast a command to all robots
    pub async fn broadcast_command(&self, command: Command) -> Result<()> {
        let seq = self.next_sequence();
        let msg = MqttMessage::new(command, "engine", seq);
        let payload = serde_json::to_string(&msg)?;

        self.client
            .publish(topics::COMMANDS_BROADCAST, QoS::AtLeastOnce, false, payload)
            .await
            .context("Failed to broadcast command")?;

        info!("Command broadcast to all robots");
        Ok(())
    }

    /// Publish robot telemetry (used by simulated robots)
    pub async fn publish_telemetry(&self, state: &RobotState) -> Result<()> {
        let topic = topics::telemetry(&state.id);
        let seq = self.next_sequence();
        let msg = MqttMessage::new(state.clone(), &state.id, seq);
        let payload = serde_json::to_string(&msg)?;

        self.client
            .publish(&topic, QoS::AtLeastOnce, false, payload)
            .await
            .context("Failed to publish telemetry")?;

        debug!(robot_id = %state.id, "Telemetry published");
        Ok(())
    }

    /// Publish a heartbeat for a robot
    pub async fn publish_heartbeat(&self, heartbeat: &Heartbeat) -> Result<()> {
        let topic = topics::heartbeat(&heartbeat.robot_id);
        let payload = serde_json::to_string(heartbeat)?;

        self.client
            .publish(&topic, QoS::AtLeastOnce, false, payload)
            .await
            .context("Failed to publish heartbeat")?;

        debug!(robot_id = %heartbeat.robot_id, "Heartbeat published");
        Ok(())
    }

    /// Publish an anomaly alert
    pub async fn publish_alert(&self, report: &AnomalyReport) -> Result<()> {
        let seq = self.next_sequence();
        let msg = MqttMessage::new(report.clone(), &report.detected_by, seq);
        let payload = serde_json::to_string(&msg)?;

        self.client
            .publish(topics::ALERTS, QoS::AtLeastOnce, false, payload)
            .await
            .context("Failed to publish alert")?;

        warn!(
            anomaly_id = %report.id,
            severity = ?report.severity,
            "Anomaly alert published"
        );
        Ok(())
    }

    /// Publish environment sensor data
    pub async fn publish_environment(&self, env: &PipeEnvironment) -> Result<()> {
        let topic = topics::environment(&env.section_id);
        let seq = self.next_sequence();
        let msg = MqttMessage::new(env.clone(), &env.section_id, seq);
        let payload = serde_json::to_string(&msg)?;

        self.client
            .publish(&topic, QoS::AtLeastOnce, false, payload)
            .await
            .context("Failed to publish environment data")?;

        debug!(section_id = %env.section_id, "Environment data published");
        Ok(())
    }

    /// Get the fleet manager for reading robot states
    pub fn fleet(&self) -> Arc<RwLock<FleetManager>> {
        self.fleet.clone()
    }

    /// Generate next sequence number
    fn next_sequence(&self) -> u64 {
        self.sequence
            .fetch_add(1, std::sync::atomic::Ordering::SeqCst)
    }

    /// Process incoming MQTT messages
    pub async fn handle_incoming(&self, topic: &str, payload: &[u8]) -> Result<()> {
        let payload_str = std::str::from_utf8(payload)?;

        // Route based on topic pattern
        if topic.starts_with("aetheris/telemetry/") {
            let msg: MqttMessage<RobotState> = serde_json::from_str(payload_str)?;
            self.fleet.write().await.update_robot(msg.payload.clone());
            let _ = self
                .message_tx
                .send(EngineMessage::TelemetryReceived(msg.payload))
                .await;
        } else if topic.starts_with("aetheris/heartbeat/") {
            let heartbeat: Heartbeat = serde_json::from_str(payload_str)?;
            self.fleet
                .write()
                .await
                .record_heartbeat(&heartbeat.robot_id);
            let _ = self
                .message_tx
                .send(EngineMessage::HeartbeatReceived(heartbeat))
                .await;
        } else if topic == topics::ALERTS {
            let msg: MqttMessage<AnomalyReport> = serde_json::from_str(payload_str)?;
            let _ = self
                .message_tx
                .send(EngineMessage::AlertReceived(msg.payload))
                .await;
        } else if topic.starts_with("aetheris/environment/") {
            let msg: MqttMessage<PipeEnvironment> = serde_json::from_str(payload_str)?;
            let _ = self
                .message_tx
                .send(EngineMessage::EnvironmentReceived(msg.payload))
                .await;
        } else if topic.starts_with("aetheris/responses/") {
            let response: CommandResponse = serde_json::from_str(payload_str)?;
            let _ = self
                .message_tx
                .send(EngineMessage::CommandResponseReceived(response))
                .await;
        } else if topic.starts_with("aetheris/commands/") {
            // Handle incoming commands from dashboard (chaos scenarios)
            if let Ok(msg) = serde_json::from_str::<MqttMessage<Command>>(payload_str) {
                // Generate alert for chaos scenarios
                if let Err(e) = self
                    .generate_alert_for_command(&msg.payload, &msg.source)
                    .await
                {
                    error!("Failed to generate alert for command: {}", e);
                }
                let _ = self
                    .message_tx
                    .send(EngineMessage::CommandReceived(msg.payload, msg.source))
                    .await;
            }
        }

        Ok(())
    }

    /// Generate an alert based on a command
    pub async fn generate_alert_for_command(&self, command: &Command, source: &str) -> Result<()> {
        let alert = match command {
            Command::EmergencyStop => Some(AnomalyReport::new(
                AnomalyType::Leak,
                SeverityLevel::Critical,
                Position::new(rand_coord(), 0.0, rand_coord()),
                format!("PIPE-H{}", rand::random::<u8>() % 10),
                source,
                0.96,
                "EMERGENCY: Hydrogen leak detected! All units halted.",
            )),
            Command::Investigate { anomaly_id } => Some(AnomalyReport::new(
                AnomalyType::PressureDrop,
                SeverityLevel::High,
                Position::new(rand_coord(), 0.0, rand_coord()),
                format!("PIPE-A{}", rand::random::<u8>() % 10),
                source,
                0.89,
                format!("Pressure anomaly {} under investigation", anomaly_id),
            )),
            Command::PerformScan { scan_type } => {
                let (anomaly_type, severity, desc) = match scan_type {
                    aetheris_shared::ScanType::Thermal => (
                        AnomalyType::TemperatureAnomaly,
                        SeverityLevel::Medium,
                        "Temperature spike detected during thermal scan",
                    ),
                    aetheris_shared::ScanType::Ultrasonic => (
                        AnomalyType::WallThinning,
                        SeverityLevel::High,
                        "Wall thickness below threshold detected",
                    ),
                    aetheris_shared::ScanType::LeakDetection => (
                        AnomalyType::Leak,
                        SeverityLevel::High,
                        "Potential leak signature detected",
                    ),
                    _ => (
                        AnomalyType::Unknown,
                        SeverityLevel::Info,
                        "Scan completed - no anomalies",
                    ),
                };
                Some(AnomalyReport::new(
                    anomaly_type,
                    severity,
                    Position::new(rand_coord(), 0.0, rand_coord()),
                    format!("PIPE-S{}", rand::random::<u8>() % 10),
                    source,
                    0.85 + (rand::random::<f64>() * 0.1),
                    desc,
                ))
            }
            Command::InjectFault { fault_type } => {
                let (anomaly_type, severity, desc) = match fault_type {
                    FaultType::LowBattery => (
                        AnomalyType::Unknown,
                        SeverityLevel::Medium,
                        format!("Robot {} reporting critical battery level", source),
                    ),
                    FaultType::SensorFailure => (
                        AnomalyType::Unknown,
                        SeverityLevel::High,
                        format!("Sensor malfunction detected on {}", source),
                    ),
                    FaultType::CommDropout => (
                        AnomalyType::Unknown,
                        SeverityLevel::Critical,
                        format!("Communication lost with {}", source),
                    ),
                    FaultType::MotorFailure => (
                        AnomalyType::StructuralDamage,
                        SeverityLevel::High,
                        format!("Motor failure reported by {}", source),
                    ),
                    FaultType::GpsDrift => (
                        AnomalyType::Unknown,
                        SeverityLevel::Low,
                        format!("GPS accuracy degraded on {}", source),
                    ),
                };
                Some(AnomalyReport::new(
                    anomaly_type,
                    severity,
                    Position::new(rand_coord(), 0.0, rand_coord()),
                    "SYSTEM",
                    source,
                    0.99,
                    desc,
                ))
            }
            _ => None,
        };

        if let Some(report) = alert {
            self.publish_alert(&report).await?;
        }

        Ok(())
    }
}

// ============================================================================
// SIMULATION: MOCK ROBOT FLEET
// ============================================================================

/// Creates a set of simulated robots for testing
pub fn create_mock_fleet() -> Vec<RobotState> {
    vec![
        RobotState {
            id: "RV-001".into(),
            name: "Rover Alpha".into(),
            robot_type: RobotType::Rover,
            position: Position::new(-2.0, 0.0, 1.0),
            velocity: Velocity::new(1.2, 0.0, 0.0),
            battery: 87.0,
            signal: 95.0,
            health: HealthStatus::Optimal,
            status: RobotStatus::Active,
            current_task: CurrentTask::Patrolling {
                route_id: "ROUTE-A1".into(),
            },
            timestamp: aetheris_shared::current_timestamp_ms(),
        },
        RobotState {
            id: "RV-002".into(),
            name: "Rover Beta".into(),
            robot_type: RobotType::Rover,
            position: Position::new(2.0, 0.0, -1.0),
            velocity: Velocity::new(0.8, 0.0, 0.0),
            battery: 62.0,
            signal: 78.0,
            health: HealthStatus::Warning,
            status: RobotStatus::Active,
            current_task: CurrentTask::Scanning {
                scan_type: aetheris_shared::ScanType::LeakDetection,
            },
            timestamp: aetheris_shared::current_timestamp_ms(),
        },
        RobotState {
            id: "DR-001".into(),
            name: "Drone Hawk".into(),
            robot_type: RobotType::Drone,
            position: Position::new(1.0, 3.0, 0.0),
            velocity: Velocity::new(8.5, 0.0, 0.0),
            battery: 94.0,
            signal: 99.0,
            health: HealthStatus::Optimal,
            status: RobotStatus::Active,
            current_task: CurrentTask::Patrolling {
                route_id: "ROUTE-AIR-1".into(),
            },
            timestamp: aetheris_shared::current_timestamp_ms(),
        },
        RobotState {
            id: "CR-001".into(),
            name: "Crawler Alpha".into(),
            robot_type: RobotType::Crawler,
            position: Position::new(0.0, -0.5, 5.0), // Inside pipeline
            velocity: Velocity::new(0.3, 0.0, 0.0),
            battery: 71.0,
            signal: 65.0, // Lower signal inside pipe
            health: HealthStatus::Optimal,
            status: RobotStatus::Active,
            current_task: CurrentTask::Scanning {
                scan_type: aetheris_shared::ScanType::Ultrasonic,
            },
            timestamp: aetheris_shared::current_timestamp_ms(),
        },
        RobotState {
            id: "CR-002".into(),
            name: "Crawler Beta".into(),
            robot_type: RobotType::Crawler,
            position: Position::new(3.0, -0.5, 8.0),
            velocity: Velocity::zero(),
            battery: 23.0,
            signal: 45.0,
            health: HealthStatus::Critical,
            status: RobotStatus::Maintenance,
            current_task: CurrentTask::ReturningToBase,
            timestamp: aetheris_shared::current_timestamp_ms(),
        },
    ]
}

// ============================================================================
// HEARTBEAT MONITOR TASK
// ============================================================================

/// Spawns a background task to monitor robot heartbeats
pub async fn spawn_heartbeat_monitor(fleet: Arc<RwLock<FleetManager>>) {
    tokio::spawn(async move {
        let mut check_interval = interval(Duration::from_secs(5));

        loop {
            check_interval.tick().await;

            let mut fleet_guard = fleet.write().await;
            let timed_out = fleet_guard.get_timed_out_robots();

            for robot_id in timed_out {
                warn!(robot_id = %robot_id, "Robot heartbeat timeout - marking offline");
                fleet_guard.mark_offline(&robot_id);
            }
        }
    });
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive("aetheris_engine=debug".parse()?)
                .add_directive("rumqttc=warn".parse()?),
        )
        .init();

    info!("🚀 AETHERIS Engine starting...");

    // Create message channel
    let (message_tx, mut message_rx) = mpsc::channel::<EngineMessage>(100);

    // Initialize MQTT client
    let config = MqttConfig::default();
    info!(
        "Connecting to MQTT broker at {}:{}",
        config.broker_host, config.broker_port
    );

    let (mqtt, mut eventloop) = AetherisMqtt::new(config.clone(), message_tx)
        .await
        .context("Failed to create MQTT client")?;

    // Subscribe to topics
    mqtt.subscribe_all().await?;

    // Start heartbeat monitor
    spawn_heartbeat_monitor(mqtt.fleet()).await;

    // Initialize mock fleet for simulation
    let mock_robots = create_mock_fleet();
    info!("Initialized {} simulated robots", mock_robots.len());

    // Clone for the simulation task
    let mqtt_sim = Arc::new(mqtt);
    let mqtt_handler = mqtt_sim.clone();

    // Spawn telemetry simulation task
    let simulation_robots = mock_robots.clone();
    tokio::spawn(async move {
        let mut telemetry_interval = interval(Duration::from_secs(1));
        let mut heartbeat_interval = interval(Duration::from_secs(5));
        let mut uptime: u64 = 0;

        loop {
            tokio::select! {
                _ = telemetry_interval.tick() => {
                    // Publish telemetry for all robots
                    for robot in &simulation_robots {
                        let mut robot_state = robot.clone();
                        // Simulate movement
                        robot_state.position.x += robot_state.velocity.vx * 0.1;
                        robot_state.timestamp = aetheris_shared::current_timestamp_ms();

                        if let Err(e) = mqtt_sim.publish_telemetry(&robot_state).await {
                            error!("Failed to publish telemetry: {}", e);
                        }
                    }
                }
                _ = heartbeat_interval.tick() => {
                    uptime += 5;
                    // Publish heartbeats
                    for robot in &simulation_robots {
                        let heartbeat = Heartbeat::new(
                            &robot.id,
                            robot.robot_type,
                            robot.status,
                            robot.battery,
                            robot.signal,
                            uptime,
                        );
                        if let Err(e) = mqtt_sim.publish_heartbeat(&heartbeat).await {
                            error!("Failed to publish heartbeat: {}", e);
                        }
                    }
                }
            }
        }
    });

    // Spawn message processor task
    tokio::spawn(async move {
        while let Some(msg) = message_rx.recv().await {
            match msg {
                EngineMessage::TelemetryReceived(state) => {
                    debug!(robot_id = %state.id, "Telemetry received");
                }
                EngineMessage::HeartbeatReceived(hb) => {
                    debug!(robot_id = %hb.robot_id, uptime = hb.uptime, "Heartbeat received");
                }
                EngineMessage::AlertReceived(alert) => {
                    warn!(
                        alert_id = %alert.id,
                        severity = ?alert.severity,
                        "Alert received: {}",
                        alert.description
                    );
                }
                EngineMessage::EnvironmentReceived(env) => {
                    debug!(section_id = %env.section_id, pressure = env.pressure, "Environment data received");
                }
                EngineMessage::CommandResponseReceived(resp) => {
                    info!(
                        command_id = %resp.command_id,
                        robot_id = %resp.robot_id,
                        success = resp.success,
                        "Command response received"
                    );
                }
                EngineMessage::CommandReceived(cmd, source) => {
                    info!(
                        source = %source,
                        "Command received from dashboard: {:?}",
                        cmd
                    );
                }
            }
        }
    });

    // Main event loop - process MQTT events
    info!("✅ AETHERIS Engine running. Press Ctrl+C to stop.");

    loop {
        match eventloop.poll().await {
            Ok(Event::Incoming(Packet::Publish(publish))) => {
                if let Err(e) = mqtt_handler
                    .handle_incoming(&publish.topic, &publish.payload)
                    .await
                {
                    error!("Failed to handle message on {}: {}", publish.topic, e);
                }
            }
            Ok(Event::Incoming(Packet::SubAck(_))) => {
                debug!("Subscription acknowledged");
            }
            Ok(Event::Incoming(Packet::ConnAck(_))) => {
                info!("Connected to MQTT broker");
            }
            Ok(_) => {}
            Err(e) => {
                error!("MQTT connection error: {}. Retrying...", e);
                tokio::time::sleep(Duration::from_secs(5)).await;
            }
        }
    }
}
