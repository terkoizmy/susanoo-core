"use client"

import { useState } from "react"
import {
    Flame,
    Droplets,
    ThermometerSun,
    Gauge,
    AlertTriangle,
    Zap,
    WifiOff,
    Battery,
    Bug,
    Play,
    RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMqttContext } from "@/providers/mqtt-provider"
import type { Command, AnomalyType, FaultType, Position } from "@/types/aetheris"

interface ScenarioButton {
    id: string
    label: string
    icon: React.ElementType
    color: string
    description: string
    action: () => void
}

export function ScenarioController() {
    const { sendCommand, broadcastCommand, status } = useMqttContext()
    const [activeScenario, setActiveScenario] = useState<string | null>(null)
    const [lastTriggered, setLastTriggered] = useState<string | null>(null)

    const triggerScenario = (id: string, action: () => void) => {
        setActiveScenario(id)
        setLastTriggered(id)
        action()
        // Reset active state after animation
        setTimeout(() => setActiveScenario(null), 1000)
    }

    // Pipe Damage Scenarios
    const pipeScenarios: ScenarioButton[] = [
        {
            id: "leak",
            label: "Trigger Leak",
            icon: Droplets,
            color: "text-blue-400 hover:bg-blue-500/20 border-blue-500/30",
            description: "Simulate H2 leak at random section",
            action: () => {
                // Broadcast emergency to all robots
                broadcastCommand({ command: "emergency_stop" })
            },
        },
        {
            id: "pressure_drop",
            label: "Pressure Drop",
            icon: Gauge,
            color: "text-orange-400 hover:bg-orange-500/20 border-orange-500/30",
            description: "Simulate sudden pressure decrease",
            action: () => {
                // Send investigate command to rover
                sendCommand("RV-001", {
                    command: "investigate",
                    params: { anomaly_id: "ANM-PRESSURE-001" },
                })
            },
        },
        {
            id: "temperature",
            label: "Temp Spike",
            icon: ThermometerSun,
            color: "text-red-400 hover:bg-red-500/20 border-red-500/30",
            description: "Simulate temperature anomaly",
            action: () => {
                sendCommand("DR-001", {
                    command: "perform_scan",
                    params: { scan_type: "thermal" },
                })
            },
        },
        {
            id: "corrosion",
            label: "Wall Damage",
            icon: Flame,
            color: "text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30",
            description: "Simulate internal corrosion detected",
            action: () => {
                sendCommand("CR-001", {
                    command: "perform_scan",
                    params: { scan_type: "ultrasonic" },
                })
            },
        },
    ]

    // Robot Fault Scenarios
    const robotFaults: ScenarioButton[] = [
        {
            id: "low_battery",
            label: "Low Battery",
            icon: Battery,
            color: "text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/30",
            description: "Simulate critical battery on RV-001",
            action: () => {
                sendCommand("RV-001", {
                    command: "inject_fault",
                    params: { fault_type: "low_battery" },
                })
            },
        },
        {
            id: "sensor_fail",
            label: "Sensor Fail",
            icon: AlertTriangle,
            color: "text-red-400 hover:bg-red-500/20 border-red-500/30",
            description: "Simulate sensor malfunction",
            action: () => {
                sendCommand("CR-001", {
                    command: "inject_fault",
                    params: { fault_type: "sensor_failure" },
                })
            },
        },
        {
            id: "comm_dropout",
            label: "Comm Loss",
            icon: WifiOff,
            color: "text-purple-400 hover:bg-purple-500/20 border-purple-500/30",
            description: "Simulate communication dropout",
            action: () => {
                sendCommand("DR-001", {
                    command: "inject_fault",
                    params: { fault_type: "comm_dropout" },
                })
            },
        },
        {
            id: "motor_fail",
            label: "Motor Fail",
            icon: Zap,
            color: "text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/30",
            description: "Simulate motor failure on crawler",
            action: () => {
                sendCommand("CR-002", {
                    command: "inject_fault",
                    params: { fault_type: "motor_failure" },
                })
            },
        },
    ]

    const resetAll = () => {
        setLastTriggered(null)
        // Send all robots back to patrol
        broadcastCommand({
            command: "start_patrol",
            params: { route_id: "DEFAULT" },
        })
    }

    const isConnected = status === "connected"

    return (
        <div className="rounded border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-danger/5">
                <div className="flex items-center gap-2">
                    <Bug className="h-3.5 w-3.5 text-danger" />
                    <span className="font-mono text-xs font-semibold text-danger tracking-wider">CHAOS CONTROLLER</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={resetAll}
                    disabled={!isConnected}
                >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    RESET
                </Button>
            </div>

            <div className="p-3 space-y-4">
                {/* Pipe Damage Section */}
                <div>
                    <span className="font-mono text-[10px] text-muted-foreground tracking-wider block mb-2">PIPE SCENARIOS</span>
                    <div className="grid grid-cols-2 gap-2">
                        {pipeScenarios.map((scenario) => (
                            <Button
                                key={scenario.id}
                                variant="outline"
                                size="sm"
                                disabled={!isConnected}
                                className={cn(
                                    "h-auto py-2 px-3 flex flex-col items-start gap-1 transition-all",
                                    scenario.color,
                                    activeScenario === scenario.id && "scale-95 ring-2 ring-current"
                                )}
                                onClick={() => triggerScenario(scenario.id, scenario.action)}
                            >
                                <div className="flex items-center gap-2">
                                    <scenario.icon className="h-4 w-4" />
                                    <span className="font-mono text-xs font-medium">{scenario.label}</span>
                                </div>
                                <span className="font-mono text-[9px] opacity-70 text-left">
                                    {scenario.description}
                                </span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Robot Faults Section */}
                <div>
                    <span className="font-mono text-[10px] text-muted-foreground tracking-wider block mb-2">ROBOT FAULTS</span>
                    <div className="grid grid-cols-2 gap-2">
                        {robotFaults.map((scenario) => (
                            <Button
                                key={scenario.id}
                                variant="outline"
                                size="sm"
                                disabled={!isConnected}
                                className={cn(
                                    "h-auto py-2 px-3 flex flex-col items-start gap-1 transition-all",
                                    scenario.color,
                                    activeScenario === scenario.id && "scale-95 ring-2 ring-current"
                                )}
                                onClick={() => triggerScenario(scenario.id, scenario.action)}
                            >
                                <div className="flex items-center gap-2">
                                    <scenario.icon className="h-4 w-4" />
                                    <span className="font-mono text-xs font-medium">{scenario.label}</span>
                                </div>
                                <span className="font-mono text-[9px] opacity-70 text-left">
                                    {scenario.description}
                                </span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 font-mono text-xs"
                        disabled={!isConnected}
                        onClick={() => broadcastCommand({ command: "emergency_stop" })}
                    >
                        <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                        EMERGENCY STOP
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 font-mono text-xs"
                        disabled={!isConnected}
                        onClick={() => broadcastCommand({ command: "return_to_base" })}
                    >
                        <Play className="h-3.5 w-3.5 mr-1.5" />
                        RTB ALL
                    </Button>
                </div>

                {/* Status */}
                {!isConnected && (
                    <div className="text-center py-2 bg-warning/10 rounded border border-warning/30">
                        <span className="font-mono text-[10px] text-warning">MQTT DISCONNECTED - Controls disabled</span>
                    </div>
                )}
            </div>
        </div>
    )
}
