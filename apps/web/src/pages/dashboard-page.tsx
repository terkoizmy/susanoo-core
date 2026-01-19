"use client"

import { useEffect, useState, useMemo } from "react"
import { FleetSidebar } from "@/components/dashboard/fleet-sidebar"
import { FleetMap } from "@/components/dashboard/fleet-map"
import { UnitPanel } from "@/components/dashboard/unit-panel"
import { FPVViewer } from "@/components/dashboard/fpv-viewer"
import { SystemAlerts } from "@/components/dashboard/system-alerts"
import { ScenarioController } from "@/components/dashboard/scenario-controller"
import { FleetTopBar } from "@/components/dashboard/fleet-top-bar"
import { MqttProvider } from "@/providers/mqtt-provider"
import { useTelemetryStore } from "@/store/use-telemetry"
import type { RobotState, RobotType, HealthStatus, RobotStatus } from "@/types/aetheris"

// Re-export types for backwards compatibility with existing components
export type { RobotType, HealthStatus as Health }
export type UnitType = "rover" | "drone" | "crawler"

// FleetUnit interface for backwards compatibility with existing components
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

// Convert RobotState to FleetUnit for backwards compatibility
function robotStateToFleetUnit(robot: RobotState): FleetUnit {
  const velocity = robot.velocity
  const speed = Math.sqrt(velocity.vx ** 2 + velocity.vy ** 2 + velocity.vz ** 2)

  return {
    id: robot.id,
    name: robot.name,
    type: robot.robot_type as UnitType,
    battery: robot.battery,
    signal: robot.signal,
    health: robot.health as "optimal" | "warning" | "critical",
    position: [robot.position.x, robot.position.y, robot.position.z],
    telemetry: {
      pressure: 4.2 + Math.random() * 0.5, // Simulated pressure
      speed: speed,
      temperature: 25 + Math.random() * 10,
      altitude: robot.robot_type === "drone" ? robot.position.y * 10 : undefined,
    },
    status: robot.status === "error" || robot.status === "offline" ? "maintenance" : robot.status as "active" | "idle" | "maintenance",
  }
}

function DashboardContent() {
  // Use stable selectors from the store
  const robotsRecord = useTelemetryStore((s) => s.robots)
  const selectedRobotId = useTelemetryStore((s) => s.selectedRobotId)
  const setSelectedRobotId = useTelemetryStore((s) => s.setSelectedRobotId)

  const [viewMode, setViewMode] = useState<"focused" | "grid">("focused")

  // Memoize the conversion from record to array
  const fleet: FleetUnit[] = useMemo(() => {
    return Object.values(robotsRecord).map(robotStateToFleetUnit)
  }, [robotsRecord])

  // Get selected unit
  const selectedUnit = useMemo(() => {
    return fleet.find((u) => u.id === selectedRobotId) || fleet[0] || null
  }, [fleet, selectedRobotId])

  // Auto-select first robot when fleet updates
  useEffect(() => {
    if (!selectedRobotId && fleet.length > 0) {
      setSelectedRobotId(fleet[0].id)
    }
  }, [fleet.length, selectedRobotId, setSelectedRobotId])

  const handleSelectUnit = (unit: FleetUnit) => {
    setSelectedRobotId(unit.id)
  }

  return (
    <div className="flex h-screen flex-col bg-background font-sans">
      <FleetTopBar fleet={fleet} viewMode={viewMode} onViewModeChange={setViewMode} />
      <div className="flex flex-1 overflow-hidden">
        <FleetSidebar fleet={fleet} selectedUnit={selectedUnit} onSelectUnit={handleSelectUnit} />
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
              <FleetMap fleet={fleet} selectedUnit={selectedUnit} onSelectUnit={handleSelectUnit} />
            </div>
          </div>
          <div className="flex gap-2 h-64">
            <UnitPanel unit={selectedUnit} />
            <SystemAlerts />
            <ScenarioController />
          </div>
        </main>
      </div>
    </div>
  )
}

export function Dashboard() {
  return (
    <MqttProvider>
      <DashboardContent />
    </MqttProvider>
  )
}
