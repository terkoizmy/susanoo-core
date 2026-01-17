"use client"

import { Bot, Plane, Battery, Wifi, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { FleetUnit } from "@/pages/dashboard-page"

interface FleetSidebarProps {
    fleet: FleetUnit[]
    selectedUnit: FleetUnit | null
    onSelectUnit: (unit: FleetUnit) => void
}

export function FleetSidebar({ fleet, selectedUnit, onSelectUnit }: FleetSidebarProps) {
    const rovers = fleet.filter((u) => u.type === "rover")
    const drones = fleet.filter((u) => u.type === "drone")

    const getHealthColor = (health: FleetUnit["health"]) => {
        switch (health) {
            case "optimal":
                return "text-success"
            case "warning":
                return "text-warning"
            case "critical":
                return "text-danger"
        }
    }

    const getBatteryColor = (battery: number) => {
        if (battery > 60) return "text-success"
        if (battery > 30) return "text-warning"
        return "text-danger"
    }

    const getSignalColor = (signal: number) => {
        if (signal > 70) return "text-success"
        if (signal > 40) return "text-warning"
        return "text-danger"
    }

    const UnitItem = ({ unit }: { unit: FleetUnit }) => (
        <button
            onClick={() => onSelectUnit(unit)}
            className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded transition-all text-left",
                "hover:bg-secondary/50",
                selectedUnit?.id === unit.id ? "bg-secondary border border-primary/30" : "border border-transparent",
            )}
        >
            <div className="relative">
                {unit.type === "rover" ? (
                    <Bot className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <Plane className="h-5 w-5 text-muted-foreground" />
                )}
                <Circle className={cn("absolute -top-0.5 -right-0.5 h-2 w-2 fill-current", getHealthColor(unit.health))} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-foreground truncate">{unit.id}</span>
                    <span
                        className={cn(
                            "font-mono text-[10px] px-1.5 py-0.5 rounded",
                            unit.status === "active"
                                ? "bg-success/20 text-success"
                                : unit.status === "idle"
                                    ? "bg-warning/20 text-warning"
                                    : "bg-danger/20 text-danger",
                        )}
                    >
                        {unit.status.toUpperCase()}
                    </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground truncate block">{unit.name}</span>
            </div>

            <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                    <Battery className={cn("h-3 w-3", getBatteryColor(unit.battery))} />
                    <span className={cn("font-mono text-[10px]", getBatteryColor(unit.battery))}>{unit.battery}%</span>
                </div>
                <div className="flex items-center gap-1">
                    <Wifi className={cn("h-3 w-3", getSignalColor(unit.signal))} />
                    <span className={cn("font-mono text-[10px]", getSignalColor(unit.signal))}>{unit.signal}%</span>
                </div>
            </div>
        </button>
    )

    return (
        <aside className="w-64 flex-shrink-0 border-r border-border bg-sidebar flex flex-col">
            <div className="p-3 border-b border-border">
                <h2 className="font-mono text-xs font-semibold text-muted-foreground tracking-wider">FLEET CONTROL</h2>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                            <span className="font-mono text-[10px] font-semibold text-muted-foreground tracking-wider">
                                GROUND UNITS
                            </span>
                            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{rovers.length}</span>
                        </div>
                        <div className="space-y-1">
                            {rovers.map((unit) => (
                                <UnitItem key={unit.id} unit={unit} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                            <Plane className="h-3.5 w-3.5 text-accent" />
                            <span className="font-mono text-[10px] font-semibold text-muted-foreground tracking-wider">
                                AERIAL UNITS
                            </span>
                            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{drones.length}</span>
                        </div>
                        <div className="space-y-1">
                            {drones.map((unit) => (
                                <UnitItem key={unit.id} unit={unit} />
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </aside>
    )
}
