import { create } from "zustand";
import type {
    RobotState,
    AnomalyReport,
    Heartbeat,
    PipeEnvironment,
    MqttMessage,
} from "@/types/aetheris";

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface TelemetryState {
    // Connection status
    connectionStatus: ConnectionStatus;
    setConnectionStatus: (status: ConnectionStatus) => void;

    // Robot fleet - using object instead of Map for SSR compatibility
    robots: Record<string, RobotState>;
    updateRobot: (state: RobotState) => void;
    removeRobot: (id: string) => void;

    // Alerts
    alerts: AnomalyReport[];
    addAlert: (alert: AnomalyReport) => void;
    dismissAlert: (id: string) => void;
    acknowledgeAlert: (id: string) => void;

    // Environment data
    environment: Record<string, PipeEnvironment>;
    updateEnvironment: (env: PipeEnvironment) => void;

    // Heartbeats (for tracking connectivity)
    lastHeartbeat: Record<string, number>;
    updateHeartbeat: (robotId: string, timestamp: number) => void;

    // Selected unit for dashboard
    selectedRobotId: string | null;
    setSelectedRobotId: (id: string | null) => void;

    // Process incoming MQTT message
    processMessage: (topic: string, payload: string) => void;
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
    // Connection status
    connectionStatus: "disconnected",
    setConnectionStatus: (status) => set({ connectionStatus: status }),

    // Robot fleet - using plain object for SSR compatibility
    robots: {},
    updateRobot: (state) =>
        set((prev) => ({
            robots: { ...prev.robots, [state.id]: state },
        })),
    removeRobot: (id) =>
        set((prev) => {
            const { [id]: _, ...rest } = prev.robots;
            return { robots: rest };
        }),

    // Alerts
    alerts: [],
    addAlert: (alert) =>
        set((prev) => ({
            alerts: [alert, ...prev.alerts].slice(0, 50), // Keep last 50 alerts
        })),
    dismissAlert: (id) =>
        set((prev) => ({
            alerts: prev.alerts.filter((a) => a.id !== id),
        })),
    acknowledgeAlert: (id) =>
        set((prev) => ({
            alerts: prev.alerts.map((a) =>
                a.id === id ? { ...a, acknowledged: true } : a
            ),
        })),

    // Environment data
    environment: {},
    updateEnvironment: (env) =>
        set((prev) => ({
            environment: { ...prev.environment, [env.section_id]: env },
        })),

    // Heartbeats
    lastHeartbeat: {},
    updateHeartbeat: (robotId, timestamp) =>
        set((prev) => ({
            lastHeartbeat: { ...prev.lastHeartbeat, [robotId]: timestamp },
        })),

    // Selected unit
    selectedRobotId: null,
    setSelectedRobotId: (id) => set({ selectedRobotId: id }),

    // Process incoming MQTT message
    processMessage: (topic, payload) => {
        try {
            const data = JSON.parse(payload);

            // Handle telemetry: aetheris/telemetry/{robot_id}
            if (topic.startsWith("aetheris/telemetry/")) {
                const msg = data as MqttMessage<RobotState>;
                get().updateRobot(msg.payload);
            }
            // Handle heartbeat: aetheris/heartbeat/{robot_id}
            else if (topic.startsWith("aetheris/heartbeat/")) {
                const heartbeat = data as Heartbeat;
                get().updateHeartbeat(heartbeat.robot_id, heartbeat.timestamp);
            }
            // Handle alerts: aetheris/alerts
            else if (topic === "aetheris/alerts") {
                const msg = data as MqttMessage<AnomalyReport>;
                get().addAlert(msg.payload);
            }
            // Handle environment: aetheris/environment/{section_id}
            else if (topic.startsWith("aetheris/environment/")) {
                const msg = data as MqttMessage<PipeEnvironment>;
                get().updateEnvironment(msg.payload);
            }
        } catch (err) {
            console.error("[Telemetry] Failed to parse message:", err);
        }
    },
}));

// Selector hooks - these return stable references
export const useRobots = () => useTelemetryStore((s) => s.robots);
export const useRobot = (id: string) => useTelemetryStore((s) => s.robots[id]);
export const useAlerts = () => useTelemetryStore((s) => s.alerts);
export const useConnectionStatus = () => useTelemetryStore((s) => s.connectionStatus);
export const useSelectedRobotId = () => useTelemetryStore((s) => s.selectedRobotId);
