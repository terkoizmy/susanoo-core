"use client"

import { useState, useEffect } from "react"
import { Activity, Wifi, Zap, Grid3X3, Maximize2, Settings, Bell, Home, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { FleetUnit } from "@/pages/dashboard-page"
import { useTelemetryStore } from "@/store/use-telemetry"
import { cn } from "@/lib/utils"

interface FleetTopBarProps {
    fleet: FleetUnit[]
    viewMode: "focused" | "grid"
    onViewModeChange: (mode: "focused" | "grid") => void
}

export function FleetTopBar({ fleet, viewMode, onViewModeChange }: FleetTopBarProps) {
    const [time, setTime] = useState(new Date())
    const connectionStatus = useTelemetryStore((s) => s.connectionStatus)

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const activeUnits = fleet.filter((u) => u.status === "active").length
    const totalUnits = fleet.length
    const avgBattery = fleet.length > 0 ? Math.round(fleet.reduce((sum, u) => sum + u.battery, 0) / fleet.length) : 0
    const avgSignal = fleet.length > 0 ? Math.round(fleet.reduce((sum, u) => sum + u.signal, 0) / fleet.length) : 0

    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case "connected":
                return "text-success"
            case "connecting":
                return "text-warning"
            case "disconnected":
            case "error":
                return "text-danger"
        }
    }

    const getConnectionStatusText = () => {
        switch (connectionStatus) {
            case "connected":
                return "LIVE"
            case "connecting":
                return "CONNECTING"
            case "disconnected":
                return "OFFLINE"
            case "error":
                return "ERROR"
        }
    }

    return (
        <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
                        <Zap className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-mono text-sm font-semibold tracking-tight text-foreground">AETHERIS</span>
                </Link>

                <div className="h-4 w-px bg-border" />

                {/* Connection Status */}
                <div className="flex items-center gap-2">
                    <Circle className={cn("h-2 w-2 fill-current", getConnectionStatusColor(), connectionStatus === "connecting" && "animate-pulse")} />
                    <span className={cn("font-mono text-[10px] font-semibold tracking-wider", getConnectionStatusColor())}>
                        {getConnectionStatusText()}
                    </span>
                </div>

                <div className="h-4 w-px bg-border" />

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                        <span className="font-mono text-xs text-muted-foreground">FLEET</span>
                        <Badge variant="secondary" className="font-mono text-xs px-1.5 py-0">
                            {activeUnits}/{totalUnits}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-warning" />
                        <span className="font-mono text-xs text-muted-foreground">PWR</span>
                        <span className="font-mono text-xs text-foreground">{avgBattery}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Wifi className="h-3.5 w-3.5 text-info" />
                        <span className="font-mono text-xs text-muted-foreground">SIG</span>
                        <span className="font-mono text-xs text-foreground">{avgSignal}%</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded border border-border p-0.5">
                    <Button
                        variant={viewMode === "focused" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => onViewModeChange("focused")}
                    >
                        <Maximize2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => onViewModeChange("grid")}
                    >
                        <Grid3X3 className="h-3.5 w-3.5" />
                    </Button>
                </div>

                <div className="h-4 w-px bg-border" />

                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {time.toLocaleTimeString("en-US", { hour12: false })}
                </span>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link href="/">
                            <Home className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
