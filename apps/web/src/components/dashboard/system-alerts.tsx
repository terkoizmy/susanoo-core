"use client"

import { AlertTriangle, Info, XCircle, X, Bell, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTelemetryStore } from "@/store/use-telemetry"
import type { AnomalyReport, SeverityLevel } from "@/types/aetheris"

// Fallback alerts when no live data
const fallbackAlerts: AnomalyReport[] = [
    {
        id: "fallback-1",
        anomaly_type: "leak",
        severity: "high",
        position: { x: 120.5, y: 0, z: 0 },
        section_id: "PIPE-H7",
        detected_by: "RV-001",
        confidence: 0.94,
        description: "Pressure anomaly detected at Section H-7. AI confidence: 94%",
        timestamp: Date.now() - 120000,
        acknowledged: false,
    },
    {
        id: "fallback-2",
        anomaly_type: "corrosion",
        severity: "medium",
        position: { x: 50.0, y: 0, z: 10.0 },
        section_id: "PIPE-A3",
        detected_by: "CR-001",
        confidence: 0.87,
        description: "Surface corrosion detected. Wall thickness at 92%.",
        timestamp: Date.now() - 300000,
        acknowledged: false,
    },
    {
        id: "fallback-3",
        anomaly_type: "temperature_anomaly",
        severity: "info",
        position: { x: 200.0, y: 0, z: 0 },
        section_id: "PIPE-B1",
        detected_by: "DR-001",
        confidence: 0.78,
        description: "Scheduled maintenance window in 2 hours.",
        timestamp: Date.now() - 600000,
        acknowledged: false,
    },
]

export function SystemAlerts() {
    const liveAlerts = useTelemetryStore((s) => s.alerts)
    const dismissAlert = useTelemetryStore((s) => s.dismissAlert)
    const connectionStatus = useTelemetryStore((s) => s.connectionStatus)

    // Use live alerts if connected, otherwise show fallback
    const alerts = connectionStatus === "connected" && liveAlerts.length > 0 ? liveAlerts : fallbackAlerts

    const getAlertIcon = (severity: SeverityLevel) => {
        switch (severity) {
            case "critical":
            case "high":
                return XCircle
            case "medium":
            case "low":
                return AlertTriangle
            case "info":
            default:
                return Info
        }
    }

    const getAlertColor = (severity: SeverityLevel) => {
        switch (severity) {
            case "critical":
            case "high":
                return "text-danger border-danger/30 bg-danger/10"
            case "medium":
            case "low":
                return "text-warning border-warning/30 bg-warning/10"
            case "info":
            default:
                return "text-info border-info/30 bg-info/10"
        }
    }

    const formatTime = (timestamp: number) => {
        const diff = Math.floor((Date.now() - timestamp) / 1000)
        if (diff < 60) return `${diff}s ago`
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        return `${Math.floor(diff / 3600)}h ago`
    }

    const getSourceLabel = (alert: AnomalyReport) => {
        if (alert.detected_by.startsWith("RV-")) return "ROVER"
        if (alert.detected_by.startsWith("DR-")) return "DRONE"
        if (alert.detected_by.startsWith("CR-")) return "CRAWLER"
        return "AI-NPU"
    }

    return (
        <div className="w-80 flex-shrink-0 rounded border border-border bg-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <div className="flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono text-xs font-semibold text-muted-foreground tracking-wider">SYSTEM ALERTS</span>
                </div>
                <div className="flex items-center gap-2">
                    {connectionStatus === "connected" ? (
                        <Wifi className="h-3 w-3 text-success" />
                    ) : (
                        <WifiOff className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="font-mono text-[10px] text-muted-foreground">{alerts.length} ACTIVE</span>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                    {alerts.length === 0 ? (
                        <div className="flex items-center justify-center py-6">
                            <span className="font-mono text-xs text-muted-foreground">NO ACTIVE ALERTS</span>
                        </div>
                    ) : (
                        alerts.map((alert) => {
                            const Icon = getAlertIcon(alert.severity)
                            return (
                                <div key={alert.id} className={cn("p-2.5 rounded border transition-all", getAlertColor(alert.severity))}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                            <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-mono text-xs font-semibold capitalize">
                                                        {alert.anomaly_type.replace("_", " ")}
                                                    </span>
                                                    {alert.confidence && (
                                                        <span className="font-mono text-[9px] opacity-70">
                                                            {Math.round(alert.confidence * 100)}%
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="font-mono text-[10px] opacity-80 leading-relaxed">{alert.description}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="font-mono text-[9px] opacity-60">{getSourceLabel(alert)}</span>
                                                    <span className="font-mono text-[9px] opacity-60">•</span>
                                                    <span className="font-mono text-[9px] opacity-60">{alert.section_id}</span>
                                                    <span className="font-mono text-[9px] opacity-60">•</span>
                                                    <span className="font-mono text-[9px] opacity-60">{formatTime(alert.timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 opacity-60 hover:opacity-100"
                                            onClick={() => dismissAlert(alert.id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
