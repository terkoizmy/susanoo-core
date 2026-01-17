"use client"

import { useState } from "react"
import { AlertTriangle, Info, XCircle, X, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SystemAlert {
    id: string
    type: "critical" | "warning" | "info"
    title: string
    message: string
    timestamp: Date
    source: string
}

const initialAlerts: SystemAlert[] = [
    {
        id: "1",
        type: "critical",
        title: "Pressure Anomaly Detected",
        message: "Section H-7 showing abnormal pressure fluctuations. AI confidence: 94%",
        timestamp: new Date(Date.now() - 120000),
        source: "AI-NPU",
    },
    {
        id: "2",
        type: "warning",
        title: "Unit RV-003 Low Battery",
        message: "Battery at 23%. Return to charging station recommended.",
        timestamp: new Date(Date.now() - 300000),
        source: "FLEET-MGR",
    },
    {
        id: "3",
        type: "info",
        title: "Scheduled Maintenance",
        message: "Pipeline Section A-1 maintenance window in 2 hours.",
        timestamp: new Date(Date.now() - 600000),
        source: "SCHEDULER",
    },
]

export function SystemAlerts() {
    const [alerts, setAlerts] = useState<SystemAlert[]>(initialAlerts)

    const dismissAlert = (id: string) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id))
    }

    const getAlertIcon = (type: SystemAlert["type"]) => {
        switch (type) {
            case "critical":
                return XCircle
            case "warning":
                return AlertTriangle
            case "info":
                return Info
        }
    }

    const getAlertColor = (type: SystemAlert["type"]) => {
        switch (type) {
            case "critical":
                return "text-danger border-danger/30 bg-danger/10"
            case "warning":
                return "text-warning border-warning/30 bg-warning/10"
            case "info":
                return "text-info border-info/30 bg-info/10"
        }
    }

    const formatTime = (date: Date) => {
        const diff = Math.floor((Date.now() - date.getTime()) / 1000)
        if (diff < 60) return `${diff}s ago`
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        return `${Math.floor(diff / 3600)}h ago`
    }

    return (
        <div className="w-80 flex-shrink-0 rounded border border-border bg-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <div className="flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono text-xs font-semibold text-muted-foreground tracking-wider">SYSTEM ALERTS</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{alerts.length} ACTIVE</span>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                    {alerts.length === 0 ? (
                        <div className="flex items-center justify-center py-6">
                            <span className="font-mono text-xs text-muted-foreground">NO ACTIVE ALERTS</span>
                        </div>
                    ) : (
                        alerts.map((alert) => {
                            const Icon = getAlertIcon(alert.type)
                            return (
                                <div key={alert.id} className={cn("p-2.5 rounded border transition-all", getAlertColor(alert.type))}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                            <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="font-mono text-xs font-semibold">{alert.title}</span>
                                                </div>
                                                <p className="font-mono text-[10px] opacity-80 leading-relaxed">{alert.message}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="font-mono text-[9px] opacity-60">{alert.source}</span>
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
