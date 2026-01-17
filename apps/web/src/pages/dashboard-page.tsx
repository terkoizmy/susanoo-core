"use client"

import { useState } from "react"
import { FleetSidebar } from "@/components/dashboard/fleet-sidebar"
import { FleetMap } from "@/components/dashboard/fleet-map"
import { UnitPanel } from "@/components/dashboard/unit-panel"
import { FPVViewer } from "@/components/dashboard/fpv-viewer"
import { SystemAlerts } from "@/components/dashboard/system-alerts"
import { FleetTopBar } from "@/components/dashboard/fleet-top-bar"

export type UnitType = "rover" | "drone"

export interface FleetUnit {
  id: string
  name: string
  type: UnitType
  battery: number
  signal: number
  health: "optimal" | "warning" | "critical"
  position: [number, number, number]
  telemetry: {
    pressure: number
    speed: number
    temperature: number
    altitude?: number
  }
  status: "active" | "idle" | "maintenance"
}

const initialFleet: FleetUnit[] = [
  {
    id: "RV-001",
    name: "Rover Alpha",
    type: "rover",
    battery: 87,
    signal: 95,
    health: "optimal",
    position: [-2, 0, 1],
    telemetry: { pressure: 4.2, speed: 1.2, temperature: 28 },
    status: "active",
  },
  {
    id: "RV-002",
    name: "Rover Beta",
    type: "rover",
    battery: 62,
    signal: 78,
    health: "warning",
    position: [2, 0, -1],
    telemetry: { pressure: 4.1, speed: 0.8, temperature: 31 },
    status: "active",
  },
  {
    id: "RV-003",
    name: "Rover Gamma",
    type: "rover",
    battery: 23,
    signal: 45,
    health: "critical",
    position: [0, 0, 3],
    telemetry: { pressure: 3.8, speed: 0, temperature: 42 },
    status: "maintenance",
  },
  {
    id: "DR-001",
    name: "Drone Hawk",
    type: "drone",
    battery: 94,
    signal: 99,
    health: "optimal",
    position: [1, 3, 0],
    telemetry: { pressure: 1.0, speed: 8.5, temperature: 22, altitude: 45 },
    status: "active",
  },
  {
    id: "DR-002",
    name: "Drone Falcon",
    type: "drone",
    battery: 71,
    signal: 88,
    health: "optimal",
    position: [-1, 2.5, -2],
    telemetry: { pressure: 1.0, speed: 6.2, temperature: 24, altitude: 38 },
    status: "active",
  },
  {
    id: "DR-003",
    name: "Drone Eagle",
    type: "drone",
    battery: 45,
    signal: 67,
    health: "warning",
    position: [3, 2, 2],
    telemetry: { pressure: 1.0, speed: 4.1, temperature: 26, altitude: 52 },
    status: "idle",
  },
]

export function Dashboard() {
  const [selectedUnit, setSelectedUnit] = useState<FleetUnit | null>(initialFleet[0])
  const [viewMode, setViewMode] = useState<"focused" | "grid">("focused")
  const [fleet] = useState<FleetUnit[]>(initialFleet)

  return (
    <div className="flex h-screen flex-col bg-background font-sans">
      <FleetTopBar fleet={fleet} viewMode={viewMode} onViewModeChange={setViewMode} />
      <div className="flex flex-1 overflow-hidden">
        <FleetSidebar fleet={fleet} selectedUnit={selectedUnit} onSelectUnit={setSelectedUnit} />
        <main className="flex flex-1 flex-col gap-2 p-2">
          <div className="flex flex-1 gap-2 overflow-hidden">
            <div className="flex-1 min-w-0">
              {viewMode === "focused" ? (
                <FPVViewer unit={selectedUnit} mode="focused" />
              ) : (
                <FPVViewer unit={selectedUnit} mode="grid" fleet={fleet.filter((u) => u.status === "active")} />
              )}
            </div>
            <div className="w-80 flex-shrink-0">
              <FleetMap fleet={fleet} selectedUnit={selectedUnit} onSelectUnit={setSelectedUnit} />
            </div>
          </div>
          <div className="flex gap-2 h-48">
            <UnitPanel unit={selectedUnit} />
            <SystemAlerts />
          </div>
        </main>
      </div>
    </div>
  )
}
