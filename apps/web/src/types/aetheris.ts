/**
 * AETHERIS Shared Type Definitions
 *
 * TypeScript interfaces matching the Rust data models in aetheris-shared.
 * Used for type-safe MQTT communication between the Rust engine and Next.js dashboard.
 */

// ============================================================================
// POSITION & SPATIAL TYPES
// ============================================================================

/** 3D position coordinates for robot localization */
export interface Position {
    x: number;
    y: number;
    z: number;
}

/** 3D velocity vector */
export interface Velocity {
    vx: number;
    vy: number;
    vz: number;
}

// ============================================================================
// ROBOT TYPES & STATE
// ============================================================================

/** Types of autonomous robots in the AETHERIS fleet */
export type RobotType = "rover" | "drone" | "crawler";

/** Operational status of a robot */
export type RobotStatus = "active" | "idle" | "maintenance" | "error" | "offline";

/** Health status indicators */
export type HealthStatus = "optimal" | "warning" | "critical";

/** Types of sensor scans */
export type ScanType = "full" | "leak_detection" | "thermal" | "ultrasonic" | "visual";

/** Current task being executed by a robot */
export type CurrentTask =
    | { type: "none" }
    | { type: "patrolling"; data: { route_id: string } }
    | { type: "moving_to"; data: { target: Position } }
    | { type: "scanning"; data: { scan_type: ScanType } }
    | { type: "returning_to_base" }
    | { type: "investigating"; data: { anomaly_id: string } };

/** Complete state of a robot unit */
export interface RobotState {
    /** Unique identifier (e.g., "RV-001", "DR-002", "CR-001") */
    id: string;
    /** Human-readable name */
    name: string;
    /** Type of robot */
    robot_type: RobotType;
    /** Current 3D position */
    position: Position;
    /** Current velocity vector */
    velocity: Velocity;
    /** Battery level (0.0 - 100.0) */
    battery: number;
    /** Signal strength (0.0 - 100.0) */
    signal: number;
    /** Overall health status */
    health: HealthStatus;
    /** Operational status */
    status: RobotStatus;
    /** Current executing task */
    current_task: CurrentTask;
    /** Unix timestamp of last update (milliseconds) */
    timestamp: number;
}

// ============================================================================
// PIPELINE ENVIRONMENT
// ============================================================================

/** Environmental sensor readings from pipeline infrastructure */
export interface PipeEnvironment {
    /** Unique identifier for the pipeline section */
    section_id: string;
    /** Internal pressure in bar */
    pressure: number;
    /** Temperature in Celsius */
    temperature: number;
    /** Hydrogen concentration (ppm) */
    h2_concentration: number;
    /** Wall thickness in millimeters */
    wall_thickness: number;
    /** Flow rate in m³/h */
    flow_rate: number;
    /** Humidity percentage */
    humidity: number;
    /** Reading position */
    position: Position;
    /** Unix timestamp (milliseconds) */
    timestamp: number;
}

// ============================================================================
// ANOMALY DETECTION
// ============================================================================

/** Types of anomalies that can be detected */
export type AnomalyType =
    | "leak"
    | "corrosion"
    | "crack"
    | "pressure_drop"
    | "temperature_anomaly"
    | "wall_thinning"
    | "structural_damage"
    | "unknown";

/** Severity levels for detected anomalies */
export type SeverityLevel = "info" | "low" | "medium" | "high" | "critical";

/** Report of a detected anomaly */
export interface AnomalyReport {
    /** Unique anomaly identifier */
    id: string;
    /** Type of anomaly detected */
    anomaly_type: AnomalyType;
    /** Severity assessment */
    severity: SeverityLevel;
    /** Location of the anomaly */
    position: Position;
    /** ID of the pipeline section */
    section_id: string;
    /** Robot that detected the anomaly */
    detected_by: string;
    /** AI confidence score (0.0 - 1.0) */
    confidence: number;
    /** Human-readable description */
    description: string;
    /** Unix timestamp (milliseconds) */
    timestamp: number;
    /** Whether the anomaly has been acknowledged */
    acknowledged: boolean;
}

// ============================================================================
// COMMANDS
// ============================================================================

/** Types of faults that can be injected for testing */
export type FaultType =
    | "low_battery"
    | "sensor_failure"
    | "comm_dropout"
    | "motor_failure"
    | "gps_drift";

/** Robot configuration parameters */
export interface RobotConfig {
    max_speed?: number;
    scan_interval?: number;
    heartbeat_interval?: number;
    low_battery_threshold?: number;
}

/** Commands that can be sent to robots */
export type Command =
    | { command: "move_to"; params: { target: Position; speed?: number } }
    | { command: "stop" }
    | { command: "perform_scan"; params: { scan_type: ScanType } }
    | { command: "start_patrol"; params: { route_id: string } }
    | { command: "return_to_base" }
    | { command: "investigate"; params: { anomaly_id: string } }
    | { command: "emergency_stop" }
    | { command: "inject_fault"; params: { fault_type: FaultType } }
    | { command: "configure"; params: { config: RobotConfig } };

// ============================================================================
// MQTT MESSAGES
// ============================================================================

/** Wrapper for all MQTT messages with metadata */
export interface MqttMessage<T> {
    /** Message payload */
    payload: T;
    /** Source robot/component ID */
    source: string;
    /** Unix timestamp (milliseconds) */
    timestamp: number;
    /** Message sequence number */
    seq: number;
}

/** Heartbeat message for connectivity monitoring */
export interface Heartbeat {
    /** Robot ID */
    robot_id: string;
    /** Robot type */
    robot_type: RobotType;
    /** Current status */
    status: RobotStatus;
    /** Battery level */
    battery: number;
    /** Signal strength */
    signal: number;
    /** Uptime in seconds */
    uptime: number;
    /** Unix timestamp (milliseconds) */
    timestamp: number;
}

/** Command response from robot */
export interface CommandResponse {
    /** ID of the command being responded to */
    command_id: string;
    /** Robot ID */
    robot_id: string;
    /** Whether command was accepted */
    success: boolean;
    /** Error message if failed */
    error?: string;
    /** Unix timestamp (milliseconds) */
    timestamp: number;
}

// ============================================================================
// MQTT TOPICS
// ============================================================================

/** MQTT topic definitions for the AETHERIS system */
export const MQTT_TOPICS = {
    /** Base topic prefix */
    PREFIX: "aetheris",

    /** Robot telemetry: aetheris/telemetry/{robot_id} */
    telemetry: (robotId: string) => `aetheris/telemetry/${robotId}`,

    /** Telemetry wildcard subscription */
    TELEMETRY_ALL: "aetheris/telemetry/+",

    /** Robot heartbeat: aetheris/heartbeat/{robot_id} */
    heartbeat: (robotId: string) => `aetheris/heartbeat/${robotId}`,

    /** Heartbeat wildcard */
    HEARTBEAT_ALL: "aetheris/heartbeat/+",

    /** Commands to specific robot */
    commands: (robotId: string) => `aetheris/commands/${robotId}`,

    /** Broadcast commands */
    COMMANDS_BROADCAST: "aetheris/commands/broadcast",

    /** Command wildcard */
    COMMANDS_ALL: "aetheris/commands/#",

    /** Anomaly alerts */
    ALERTS: "aetheris/alerts",

    /** Environment readings */
    environment: (sectionId: string) => `aetheris/environment/${sectionId}`,

    /** Environment wildcard */
    ENVIRONMENT_ALL: "aetheris/environment/+",

    /** Command responses */
    responses: (robotId: string) => `aetheris/responses/${robotId}`,

    /** System status */
    SYSTEM_STATUS: "aetheris/system/status",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Create a default Position */
export function createPosition(x = 0, y = 0, z = 0): Position {
    return { x, y, z };
}

/** Create a default Velocity */
export function createVelocity(vx = 0, vy = 0, vz = 0): Velocity {
    return { vx, vy, vz };
}

/** Calculate distance between two positions */
export function distanceBetween(a: Position, b: Position): number {
    return Math.sqrt(
        Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2)
    );
}

/** Calculate velocity magnitude (speed) */
export function velocityMagnitude(v: Velocity): number {
    return Math.sqrt(v.vx * v.vx + v.vy * v.vy + v.vz * v.vz);
}

/** Check if environment readings indicate hazardous conditions */
export function isHazardousEnvironment(env: PipeEnvironment): boolean {
    // H2 LEL is ~40,000 ppm, alert at 10% = 4,000 ppm
    return env.h2_concentration > 4000 || env.pressure > 100 || env.temperature > 80;
}

/** Get display color for health status */
export function getHealthColor(health: HealthStatus): string {
    switch (health) {
        case "optimal":
            return "text-success";
        case "warning":
            return "text-warning";
        case "critical":
            return "text-danger";
    }
}

/** Get display color for severity level */
export function getSeverityColor(severity: SeverityLevel): string {
    switch (severity) {
        case "info":
            return "text-info";
        case "low":
            return "text-success";
        case "medium":
            return "text-warning";
        case "high":
            return "text-danger";
        case "critical":
            return "text-danger";
    }
}

/** Get robot type icon name for lucide-react */
export function getRobotTypeIcon(type: RobotType): string {
    switch (type) {
        case "rover":
            return "Bot";
        case "drone":
            return "Plane";
        case "crawler":
            return "Bug"; // Represents internal crawler
    }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/** Type guard for RobotState */
export function isRobotState(obj: unknown): obj is RobotState {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "id" in obj &&
        "robot_type" in obj &&
        "position" in obj
    );
}

/** Type guard for AnomalyReport */
export function isAnomalyReport(obj: unknown): obj is AnomalyReport {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "anomaly_type" in obj &&
        "severity" in obj &&
        "detected_by" in obj
    );
}

/** Type guard for Heartbeat */
export function isHeartbeat(obj: unknown): obj is Heartbeat {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "robot_id" in obj &&
        "uptime" in obj
    );
}
