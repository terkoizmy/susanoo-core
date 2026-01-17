"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Gauge, Thermometer, Zap, MoveRight, Mountain, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FleetUnit } from "@/pages/dashboard-page"

interface UnitPanelProps {
    unit: FleetUnit | null
}

export function UnitPanel({ unit }: UnitPanelProps) {
    const [telemetry, setTelemetry] = useState(unit?.telemetry)

    useEffect(() => {
        if (!unit) return
        setTelemetry(unit.telemetry)

        const interval = setInterval(() => {
            setTelemetry((prev) => {
                if (!prev) return prev
                return {
                    pressure: prev.pressure + (Math.random() - 0.5) * 0.1,
                    speed: Math.max(0, prev.speed + (Math.random() - 0.5) * 0.3),
                    temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
                    altitude: prev.altitude ? prev.altitude + (Math.random() - 0.5) * 2 : undefined,
                }
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [unit])

    if (!unit) {
        return (
            <div className="flex-1 rounded border border-border bg-card flex items-center justify-center">
                <span className="font-mono text-xs text-muted-foreground">SELECT A UNIT</span>
            </div>
        )
    }

    const MetricCard = ({
        icon: Icon,
        label,
        value,
        unit: unitLabel,
        color,
    }: {
        icon: React.ElementType
        label: string
        value: number
        unit: string
        color: string
    }) => (
        <div className="flex flex-col gap-1 p-3 rounded bg-secondary/50 border border-border">
            <div className="flex items-center gap-2">
                <Icon className={cn("h-3.5 w-3.5", color)} />
                <span className="font-mono text-[10px] text-muted-foreground tracking-wider">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="font-mono text-xl font-bold text-foreground tabular-nums">{value.toFixed(1)}</span>
                <span className="font-mono text-xs text-muted-foreground">{unitLabel}</span>
            </div>
        </div>
    )

    return (
        <div className="flex-1 rounded border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-foreground">{unit.id}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{unit.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-[10px] text-muted-foreground">LIVE TELEMETRY</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                </div>
            </div>

            <div className="p-3 grid grid-cols-4 gap-2">
                <MetricCard icon={Gauge} label="PRESSURE" value={telemetry?.pressure || 0} unit="BAR" color="text-info" />
                <MetricCard icon={MoveRight} label="SPEED" value={telemetry?.speed || 0} unit="M/S" color="text-primary" />
                <MetricCard
                    icon={Thermometer}
                    label="TEMPERATURE"
                    value={telemetry?.temperature || 0}
                    unit="°C"
                    color="text-warning"
                />
                {unit.type === "drone" && telemetry?.altitude !== undefined ? (
                    <MetricCard icon={Mountain} label="ALTITUDE" value={telemetry.altitude} unit="M" color="text-accent" />
                ) : (
                    <MetricCard icon={Zap} label="POWER DRAW" value={12.4 + Math.random() * 2} unit="W" color="text-success" />
                )}
            </div>
        </div>
    )
}
