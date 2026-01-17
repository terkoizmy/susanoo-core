//! AETHERIS Shared Data Models
//!
//! Core data structures for the AETHERIS Digital Twin and Autonomous Inspection System.
//! These types are shared between the Engine, Brain, and Dashboard components.

use serde::{Deserialize, Serialize};
use std::time::SystemTime;

// ============================================================================
// POSITION & SPATIAL TYPES
// ============================================================================

/// 3D position coordinates for robot localization
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Position {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl Position {
    pub fn new(x: f64, y: f64, z: f64) -> Self {
        Self { x, y, z }
    }

    pub fn origin() -> Self {
        Self::new(0.0, 0.0, 0.0)
    }

    /// Calculate Euclidean distance to another position
    pub fn distance_to(&self, other: &Position) -> f64 {
        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2) + (self.z - other.z).powi(2))
            .sqrt()
    }
}

impl Default for Position {
    fn default() -> Self {
        Self::origin()
    }
}

/// 3D velocity vector
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize, Default)]
pub struct Velocity {
    pub vx: f64,
    pub vy: f64,
    pub vz: f64,
}

impl Velocity {
    pub fn new(vx: f64, vy: f64, vz: f64) -> Self {
        Self { vx, vy, vz }
    }

    /// Calculate speed magnitude
    pub fn magnitude(&self) -> f64 {
        (self.vx.powi(2) + self.vy.powi(2) + self.vz.powi(2)).sqrt()
    }

    pub fn zero() -> Self {
        Self::new(0.0, 0.0, 0.0)
    }
}

// ============================================================================
// ROBOT TYPES & STATE
// ============================================================================

/// Types of autonomous robots in the AETHERIS fleet
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RobotType {
    /// Ground-based patrol rover for external pipeline inspection
    Rover,
    /// Aerial drone for overhead surveillance and rapid response
    Drone,
    /// Internal crawler for in-pipe inspection (corrosion, cracks, wall thickness)
    Crawler,
}

impl RobotType {
    pub fn as_str(&self) -> &'static str {
        match self {
            RobotType::Rover => "rover",
            RobotType::Drone => "drone",
            RobotType::Crawler => "crawler",
        }
    }
}

/// Operational status of a robot
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RobotStatus {
    /// Robot is actively executing a task
    Active,
    /// Robot is idle and awaiting commands
    Idle,
    /// Robot is in maintenance mode (charging, repairs)
    Maintenance,
    /// Robot has encountered an error
    Error,
    /// Robot is offline/disconnected
    Offline,
}

/// Current task being executed by a robot
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type", content = "data")]
pub enum CurrentTask {
    /// No active task
    None,
    /// Patrolling a designated route
    Patrolling { route_id: String },
    /// Moving to a specific position
    MovingTo { target: Position },
    /// Performing a sensor scan at current location
    Scanning { scan_type: ScanType },
    /// Returning to charging station
    ReturningToBase,
    /// Investigating a detected anomaly
    Investigating { anomaly_id: String },
}

/// Types of sensor scans
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ScanType {
    /// Full multi-sensor sweep
    Full,
    /// Hydrogen leak detection only
    LeakDetection,
    /// Thermal imaging scan
    Thermal,
    /// Ultrasonic wall thickness measurement
    Ultrasonic,
    /// Visual/camera inspection
    Visual,
}

/// Health status indicators for robot subsystems
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum HealthStatus {
    /// All systems nominal
    Optimal,
    /// Minor issues detected, operation continues
    Warning,
    /// Critical issues, immediate attention required
    Critical,
}

/// Complete state of a robot unit
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RobotState {
    /// Unique identifier (e.g., "RV-001", "DR-002", "CR-001")
    pub id: String,
    /// Human-readable name (e.g., "Rover Alpha", "Crawler Beta")
    pub name: String,
    /// Type of robot
    pub robot_type: RobotType,
    /// Current 3D position
    pub position: Position,
    /// Current velocity vector
    pub velocity: Velocity,
    /// Battery level (0.0 - 100.0)
    pub battery: f64,
    /// Signal strength (0.0 - 100.0)
    pub signal: f64,
    /// Overall health status
    pub health: HealthStatus,
    /// Operational status
    pub status: RobotStatus,
    /// Current executing task
    pub current_task: CurrentTask,
    /// Unix timestamp of last update (milliseconds)
    pub timestamp: u64,
}

impl RobotState {
    pub fn new(id: impl Into<String>, name: impl Into<String>, robot_type: RobotType) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            robot_type,
            position: Position::origin(),
            velocity: Velocity::zero(),
            battery: 100.0,
            signal: 100.0,
            health: HealthStatus::Optimal,
            status: RobotStatus::Idle,
            current_task: CurrentTask::None,
            timestamp: current_timestamp_ms(),
        }
    }
}

// ============================================================================
// PIPELINE ENVIRONMENT
// ============================================================================

/// Environmental sensor readings from pipeline infrastructure
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PipeEnvironment {
    /// Unique identifier for the pipeline section
    pub section_id: String,
    /// Internal pressure in bar
    pub pressure: f64,
    /// Temperature in Celsius
    pub temperature: f64,
    /// Hydrogen concentration (ppm - parts per million)
    pub h2_concentration: f64,
    /// Wall thickness in millimeters (measured by ultrasonic)
    pub wall_thickness: f64,
    /// Flow rate in cubic meters per hour (m³/h)
    pub flow_rate: f64,
    /// Humidity percentage (0.0 - 100.0)
    pub humidity: f64,
    /// Reading position along the pipeline
    pub position: Position,
    /// Unix timestamp of reading (milliseconds)
    pub timestamp: u64,
}

impl PipeEnvironment {
    /// Check if readings indicate a potentially hazardous condition
    pub fn is_hazardous(&self) -> bool {
        // H2 LEL (Lower Explosive Limit) is ~40,000 ppm (4%)
        // We alert at 10% of LEL = 4,000 ppm for safety margin
        self.h2_concentration > 4000.0 || self.pressure > 100.0 || self.temperature > 80.0
    }
}

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

/// Types of anomalies that can be detected
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AnomalyType {
    /// Gas leak detected
    Leak,
    /// Surface or internal corrosion
    Corrosion,
    /// Structural crack or fracture
    Crack,
    /// Abnormal pressure drop between sections
    PressureDrop,
    /// Abnormal temperature reading
    TemperatureAnomaly,
    /// Wall thickness below threshold
    WallThinning,
    /// General structural damage
    StructuralDamage,
    /// Unknown anomaly requiring investigation
    Unknown,
}

/// Severity levels for detected anomalies
#[derive(Debug, Clone, Copy, PartialEq, Eq, Ord, PartialOrd, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SeverityLevel {
    /// Informational, no action required
    Info,
    /// Low severity, schedule maintenance
    Low,
    /// Medium severity, prioritize inspection
    Medium,
    /// High severity, immediate attention needed
    High,
    /// Critical, emergency response required
    Critical,
}

/// Report of a detected anomaly
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct AnomalyReport {
    /// Unique anomaly identifier
    pub id: String,
    /// Type of anomaly detected
    pub anomaly_type: AnomalyType,
    /// Severity assessment
    pub severity: SeverityLevel,
    /// Location of the anomaly
    pub position: Position,
    /// ID of the pipeline section
    pub section_id: String,
    /// Robot that detected the anomaly
    pub detected_by: String,
    /// AI confidence score (0.0 - 1.0)
    pub confidence: f64,
    /// Human-readable description
    pub description: String,
    /// Unix timestamp of detection (milliseconds)
    pub timestamp: u64,
    /// Whether the anomaly has been acknowledged
    pub acknowledged: bool,
}

impl AnomalyReport {
    pub fn new(
        anomaly_type: AnomalyType,
        severity: SeverityLevel,
        position: Position,
        section_id: impl Into<String>,
        detected_by: impl Into<String>,
        confidence: f64,
        description: impl Into<String>,
    ) -> Self {
        Self {
            id: generate_anomaly_id(),
            anomaly_type,
            severity,
            position,
            section_id: section_id.into(),
            detected_by: detected_by.into(),
            confidence,
            description: description.into(),
            timestamp: current_timestamp_ms(),
            acknowledged: false,
        }
    }
}

// ============================================================================
// COMMANDS
// ============================================================================

/// Commands that can be sent to robots
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "command", content = "params")]
pub enum Command {
    /// Move to a specific position
    MoveTo {
        target: Position,
        speed: Option<f64>,
    },
    /// Stop all movement immediately
    Stop,
    /// Perform a sensor scan
    PerformScan { scan_type: ScanType },
    /// Start patrol route
    StartPatrol { route_id: String },
    /// Return to charging station
    ReturnToBase,
    /// Investigate a specific anomaly
    Investigate { anomaly_id: String },
    /// Emergency stop - highest priority
    EmergencyStop,
    /// Inject a simulated fault (for testing)
    InjectFault { fault_type: FaultType },
    /// Update robot configuration
    Configure { config: RobotConfig },
}

/// Types of faults that can be injected for testing
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FaultType {
    /// Simulate low battery
    LowBattery,
    /// Simulate sensor failure
    SensorFailure,
    /// Simulate communication dropout
    CommDropout,
    /// Simulate motor failure
    MotorFailure,
    /// Simulate GPS drift
    GpsDrift,
}

/// Robot configuration parameters
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
pub struct RobotConfig {
    /// Maximum speed in m/s
    pub max_speed: Option<f64>,
    /// Scan interval in seconds
    pub scan_interval: Option<u32>,
    /// Heartbeat interval in seconds
    pub heartbeat_interval: Option<u32>,
    /// Low battery threshold percentage
    pub low_battery_threshold: Option<f64>,
}

// ============================================================================
// MQTT MESSAGES
// ============================================================================

/// Wrapper for all MQTT messages with metadata
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MqttMessage<T> {
    /// Message payload
    pub payload: T,
    /// Source robot/component ID
    pub source: String,
    /// Unix timestamp (milliseconds)
    pub timestamp: u64,
    /// Message sequence number
    pub seq: u64,
}

impl<T> MqttMessage<T> {
    pub fn new(payload: T, source: impl Into<String>, seq: u64) -> Self {
        Self {
            payload,
            source: source.into(),
            timestamp: current_timestamp_ms(),
            seq,
        }
    }
}

/// Heartbeat message for connectivity monitoring
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Heartbeat {
    /// Robot ID
    pub robot_id: String,
    /// Robot type
    pub robot_type: RobotType,
    /// Current status
    pub status: RobotStatus,
    /// Battery level
    pub battery: f64,
    /// Signal strength
    pub signal: f64,
    /// Uptime in seconds
    pub uptime: u64,
    /// Unix timestamp (milliseconds)
    pub timestamp: u64,
}

impl Heartbeat {
    pub fn new(
        robot_id: impl Into<String>,
        robot_type: RobotType,
        status: RobotStatus,
        battery: f64,
        signal: f64,
        uptime: u64,
    ) -> Self {
        Self {
            robot_id: robot_id.into(),
            robot_type,
            status,
            battery,
            signal,
            uptime,
            timestamp: current_timestamp_ms(),
        }
    }
}

/// Command response from robot
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct CommandResponse {
    /// ID of the command being responded to
    pub command_id: String,
    /// Robot ID
    pub robot_id: String,
    /// Whether command was accepted
    pub success: bool,
    /// Error message if failed
    pub error: Option<String>,
    /// Unix timestamp (milliseconds)
    pub timestamp: u64,
}

// ============================================================================
// MQTT TOPICS
// ============================================================================

/// MQTT topic definitions for the AETHERIS system
pub mod topics {
    /// Base topic prefix
    pub const PREFIX: &str = "aetheris";

    /// Robot telemetry: aetheris/telemetry/{robot_id}
    pub fn telemetry(robot_id: &str) -> String {
        format!("{}/telemetry/{}", PREFIX, robot_id)
    }

    /// Telemetry wildcard subscription: aetheris/telemetry/+
    pub const TELEMETRY_ALL: &str = "aetheris/telemetry/+";

    /// Robot heartbeat: aetheris/heartbeat/{robot_id}
    pub fn heartbeat(robot_id: &str) -> String {
        format!("{}/heartbeat/{}", PREFIX, robot_id)
    }

    /// Heartbeat wildcard: aetheris/heartbeat/+
    pub const HEARTBEAT_ALL: &str = "aetheris/heartbeat/+";

    /// Commands to specific robot: aetheris/commands/{robot_id}
    pub fn commands(robot_id: &str) -> String {
        format!("{}/commands/{}", PREFIX, robot_id)
    }

    /// Broadcast commands to all robots: aetheris/commands/broadcast
    pub const COMMANDS_BROADCAST: &str = "aetheris/commands/broadcast";

    /// Command wildcard: aetheris/commands/#
    pub const COMMANDS_ALL: &str = "aetheris/commands/#";

    /// Anomaly alerts: aetheris/alerts
    pub const ALERTS: &str = "aetheris/alerts";

    /// Environment readings: aetheris/environment/{section_id}
    pub fn environment(section_id: &str) -> String {
        format!("{}/environment/{}", PREFIX, section_id)
    }

    /// Environment wildcard: aetheris/environment/+
    pub const ENVIRONMENT_ALL: &str = "aetheris/environment/+";

    /// Command responses: aetheris/responses/{robot_id}
    pub fn responses(robot_id: &str) -> String {
        format!("{}/responses/{}", PREFIX, robot_id)
    }

    /// System status: aetheris/system/status
    pub const SYSTEM_STATUS: &str = "aetheris/system/status";
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/// Get current Unix timestamp in milliseconds
pub fn current_timestamp_ms() -> u64 {
    SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

/// Generate a unique anomaly ID
fn generate_anomaly_id() -> String {
    use std::sync::atomic::{AtomicU64, Ordering};
    static COUNTER: AtomicU64 = AtomicU64::new(0);
    let count = COUNTER.fetch_add(1, Ordering::SeqCst);
    let ts = current_timestamp_ms();
    format!("ANM-{:X}-{:04X}", ts, count)
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_position_distance() {
        let p1 = Position::new(0.0, 0.0, 0.0);
        let p2 = Position::new(3.0, 4.0, 0.0);
        assert!((p1.distance_to(&p2) - 5.0).abs() < 0.0001);
    }

    #[test]
    fn test_robot_state_serialization() {
        let robot = RobotState::new("RV-001", "Rover Alpha", RobotType::Rover);
        let json = serde_json::to_string(&robot).unwrap();
        let deserialized: RobotState = serde_json::from_str(&json).unwrap();
        assert_eq!(robot.id, deserialized.id);
        assert_eq!(robot.robot_type, deserialized.robot_type);
    }

    #[test]
    fn test_command_serialization() {
        let cmd = Command::MoveTo {
            target: Position::new(10.0, 20.0, 0.0),
            speed: Some(2.5),
        };
        let json = serde_json::to_string(&cmd).unwrap();
        assert!(json.contains("move_to"));
        assert!(json.contains("target"));
    }

    #[test]
    fn test_anomaly_report_creation() {
        let report = AnomalyReport::new(
            AnomalyType::Leak,
            SeverityLevel::High,
            Position::new(5.0, 0.0, 10.0),
            "PIPE-001",
            "RV-001",
            0.94,
            "Hydrogen leak detected at joint H-7",
        );
        assert!(report.id.starts_with("ANM-"));
        assert_eq!(report.severity, SeverityLevel::High);
    }

    #[test]
    fn test_pipe_environment_hazard() {
        let safe = PipeEnvironment {
            section_id: "PIPE-001".into(),
            pressure: 50.0,
            temperature: 25.0,
            h2_concentration: 100.0,
            wall_thickness: 10.0,
            flow_rate: 500.0,
            humidity: 45.0,
            position: Position::origin(),
            timestamp: current_timestamp_ms(),
        };
        assert!(!safe.is_hazardous());

        let hazardous = PipeEnvironment {
            h2_concentration: 5000.0, // Above 4000 ppm threshold
            ..safe.clone()
        };
        assert!(hazardous.is_hazardous());
    }
}
