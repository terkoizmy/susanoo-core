"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import mqtt, { MqttClient, IClientOptions } from "mqtt";
import { MQTT_TOPICS } from "@/types/aetheris";

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseMqttOptions {
    brokerUrl?: string;
    topics?: string[];
    onMessage?: (topic: string, payload: string) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
}

interface UseMqttReturn {
    client: MqttClient | null;
    status: ConnectionStatus;
    publish: (topic: string, message: string | object) => void;
    subscribe: (topic: string) => void;
    unsubscribe: (topic: string) => void;
}

const DEFAULT_BROKER_URL = "ws://localhost:9001";

const DEFAULT_TOPICS = [
    MQTT_TOPICS.TELEMETRY_ALL,
    MQTT_TOPICS.HEARTBEAT_ALL,
    MQTT_TOPICS.ALERTS,
];

export function useMqtt(options: UseMqttOptions = {}): UseMqttReturn {
    const {
        brokerUrl = DEFAULT_BROKER_URL,
        topics = DEFAULT_TOPICS,
        onMessage,
        onConnect,
        onDisconnect,
        onError,
    } = options;

    const clientRef = useRef<MqttClient | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>("disconnected");
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 10;

    // Connect to MQTT broker
    useEffect(() => {
        if (clientRef.current) return;

        setStatus("connecting");

        const clientOptions: IClientOptions = {
            clientId: `aetheris-dashboard-${Math.random().toString(16).slice(2, 10)}`,
            clean: true,
            reconnectPeriod: 3000,
            connectTimeout: 10000,
        };

        const client = mqtt.connect(brokerUrl, clientOptions);
        clientRef.current = client;

        client.on("connect", () => {
            console.log("[MQTT] Connected to broker");
            setStatus("connected");
            reconnectAttempts.current = 0;

            // Subscribe to topics
            topics.forEach((topic) => {
                client.subscribe(topic, { qos: 1 }, (err) => {
                    if (err) {
                        console.error(`[MQTT] Failed to subscribe to ${topic}:`, err);
                    } else {
                        console.log(`[MQTT] Subscribed to ${topic}`);
                    }
                });
            });

            onConnect?.();
        });

        client.on("message", (topic, payload) => {
            const message = payload.toString();
            onMessage?.(topic, message);
        });

        client.on("error", (err) => {
            console.error("[MQTT] Error:", err);
            setStatus("error");
            onError?.(err);
        });

        client.on("close", () => {
            console.log("[MQTT] Connection closed");
            setStatus("disconnected");
            onDisconnect?.();
        });

        client.on("reconnect", () => {
            reconnectAttempts.current += 1;
            console.log(`[MQTT] Reconnecting... (attempt ${reconnectAttempts.current})`);
            setStatus("connecting");

            if (reconnectAttempts.current >= maxReconnectAttempts) {
                console.error("[MQTT] Max reconnect attempts reached");
                client.end();
            }
        });

        client.on("offline", () => {
            console.log("[MQTT] Client offline");
            setStatus("disconnected");
        });

        // Cleanup on unmount
        return () => {
            if (clientRef.current) {
                console.log("[MQTT] Disconnecting...");
                clientRef.current.end();
                clientRef.current = null;
            }
        };
    }, [brokerUrl]);

    // Publish message
    const publish = useCallback((topic: string, message: string | object) => {
        if (!clientRef.current || status !== "connected") {
            console.warn("[MQTT] Cannot publish: not connected");
            return;
        }

        const payload = typeof message === "string" ? message : JSON.stringify(message);
        clientRef.current.publish(topic, payload, { qos: 1 }, (err) => {
            if (err) {
                console.error(`[MQTT] Failed to publish to ${topic}:`, err);
            }
        });
    }, [status]);

    // Subscribe to topic
    const subscribe = useCallback((topic: string) => {
        if (!clientRef.current || status !== "connected") {
            console.warn("[MQTT] Cannot subscribe: not connected");
            return;
        }

        clientRef.current.subscribe(topic, { qos: 1 }, (err) => {
            if (err) {
                console.error(`[MQTT] Failed to subscribe to ${topic}:`, err);
            } else {
                console.log(`[MQTT] Subscribed to ${topic}`);
            }
        });
    }, [status]);

    // Unsubscribe from topic
    const unsubscribe = useCallback((topic: string) => {
        if (!clientRef.current) return;

        clientRef.current.unsubscribe(topic, (err) => {
            if (err) {
                console.error(`[MQTT] Failed to unsubscribe from ${topic}:`, err);
            } else {
                console.log(`[MQTT] Unsubscribed from ${topic}`);
            }
        });
    }, []);

    return {
        client: clientRef.current,
        status,
        publish,
        subscribe,
        unsubscribe,
    };
}
