"use client";

import { useEffect, createContext, useContext, useCallback, type ReactNode } from "react";
import { useMqtt, type ConnectionStatus } from "@/hooks/use-mqtt";
import { useTelemetryStore } from "@/store/use-telemetry";
import { MQTT_TOPICS, type Command, type MqttMessage } from "@/types/aetheris";

interface MqttContextValue {
    status: ConnectionStatus;
    sendCommand: (robotId: string, command: Command) => void;
    broadcastCommand: (command: Command) => void;
}

const MqttContext = createContext<MqttContextValue | null>(null);

interface MqttProviderProps {
    children: ReactNode;
}

export function MqttProvider({ children }: MqttProviderProps) {
    const { processMessage, setConnectionStatus } = useTelemetryStore();

    const handleMessage = useCallback(
        (topic: string, payload: string) => {
            processMessage(topic, payload);
        },
        [processMessage]
    );

    const handleConnect = useCallback(() => {
        setConnectionStatus("connected");
    }, [setConnectionStatus]);

    const handleDisconnect = useCallback(() => {
        setConnectionStatus("disconnected");
    }, [setConnectionStatus]);

    const handleError = useCallback(() => {
        setConnectionStatus("error");
    }, [setConnectionStatus]);

    const { status, publish } = useMqtt({
        onMessage: handleMessage,
        onConnect: handleConnect,
        onDisconnect: handleDisconnect,
        onError: handleError,
    });

    // Sync status to store
    useEffect(() => {
        setConnectionStatus(status);
    }, [status, setConnectionStatus]);

    // Send command to specific robot
    const sendCommand = useCallback(
        (robotId: string, command: Command) => {
            const topic = MQTT_TOPICS.commands(robotId);
            const msg: MqttMessage<Command> = {
                payload: command,
                source: "dashboard",
                timestamp: Date.now(),
                seq: Math.floor(Math.random() * 1000000),
            };
            publish(topic, msg);
            console.log(`[MQTT] Command sent to ${robotId}:`, command);
        },
        [publish]
    );

    // Broadcast command to all robots
    const broadcastCommand = useCallback(
        (command: Command) => {
            const msg: MqttMessage<Command> = {
                payload: command,
                source: "dashboard",
                timestamp: Date.now(),
                seq: Math.floor(Math.random() * 1000000),
            };
            publish(MQTT_TOPICS.COMMANDS_BROADCAST, msg);
            console.log("[MQTT] Command broadcast:", command);
        },
        [publish]
    );

    return (
        <MqttContext.Provider value={{ status, sendCommand, broadcastCommand }}>
            {children}
        </MqttContext.Provider>
    );
}

export function useMqttContext() {
    const context = useContext(MqttContext);
    if (!context) {
        throw new Error("useMqttContext must be used within MqttProvider");
    }
    return context;
}
