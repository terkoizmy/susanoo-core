"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera, Environment, Grid } from "@react-three/drei"
import type * as THREE from "three"
import { cn } from "@/lib/utils"
import type { FleetUnit } from "@/pages/dashboard-page"

interface FPVViewerProps {
    unit: FleetUnit | null
    mode: "focused" | "grid"
    fleet?: FleetUnit[]
}

function FPVScene({ unit }: { unit: FleetUnit }) {
    const cameraRef = useRef<THREE.PerspectiveCamera>(null)

    useFrame((state) => {
        if (cameraRef.current) {
            cameraRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
            cameraRef.current.position.y = unit.type === "drone" ? 3 : 0.5
        }
    })

    return (
        <>
            <PerspectiveCamera ref={cameraRef} makeDefault position={[0, unit.type === "drone" ? 3 : 0.5, 0]} fov={90} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={0.6} />

            {/* Ground/Pipeline simulation */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#0f172a" />
            </mesh>

            {/* Pipeline in view */}
            <mesh position={[0, 0, -5]}>
                <cylinderGeometry args={[0.5, 0.5, 20, 16]} rotation={[0, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Detection markers */}
            {[
                [-3, 0, -4],
                [2, 0, -6],
                [5, 0, -3],
            ].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]}>
                    <boxGeometry args={[0.3, 0.3, 0.3]} />
                    <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
                </mesh>
            ))}

            <Grid
                position={[0, -0.49, 0]}
                args={[100, 100]}
                cellSize={2}
                cellThickness={0.5}
                cellColor="#1e293b"
                sectionSize={10}
                sectionThickness={1}
                sectionColor="#334155"
                fadeDistance={50}
                infiniteGrid
            />

            <Environment preset="night" />
        </>
    )
}

function HUDOverlay({ unit }: { unit: FleetUnit }) {
    return (
        <div className="absolute inset-0 pointer-events-none p-4">
            {/* Top left - Unit info */}
            <div className="absolute top-4 left-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 bg-card/80 backdrop-blur px-2 py-1 rounded">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span className="font-mono text-xs text-primary">{unit.id}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">LIVE</span>
                </div>
                <div className="bg-card/80 backdrop-blur px-2 py-1 rounded">
                    <span className="font-mono text-[10px] text-muted-foreground">AI DETECTION: ACTIVE</span>
                </div>
            </div>

            {/* Top right - Stats */}
            <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                <div className="bg-card/80 backdrop-blur px-2 py-1 rounded flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">BAT</span>
                    <span className={cn("font-mono text-xs", unit.battery > 50 ? "text-success" : "text-warning")}>
                        {unit.battery}%
                    </span>
                </div>
                <div className="bg-card/80 backdrop-blur px-2 py-1 rounded flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">SIG</span>
                    <span className="font-mono text-xs text-info">{unit.signal}%</span>
                </div>
            </div>

            {/* Bottom - Speed and heading */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                <div className="bg-card/80 backdrop-blur px-3 py-1.5 rounded flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">SPD</span>
                    <span className="font-mono text-lg font-bold text-foreground">{unit.telemetry.speed.toFixed(1)}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">M/S</span>
                </div>
                <div className="bg-card/80 backdrop-blur px-3 py-1.5 rounded flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">HDG</span>
                    <span className="font-mono text-lg font-bold text-foreground">247</span>
                    <span className="font-mono text-[10px] text-muted-foreground">°</span>
                </div>
                {unit.type === "drone" && (
                    <div className="bg-card/80 backdrop-blur px-3 py-1.5 rounded flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">ALT</span>
                        <span className="font-mono text-lg font-bold text-foreground">{unit.telemetry.altitude}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">M</span>
                    </div>
                )}
            </div>

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <svg width="60" height="60" viewBox="0 0 60 60" className="text-primary/50">
                    <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
                    <line x1="30" y1="5" x2="30" y2="15" stroke="currentColor" strokeWidth="1" />
                    <line x1="30" y1="45" x2="30" y2="55" stroke="currentColor" strokeWidth="1" />
                    <line x1="5" y1="30" x2="15" y2="30" stroke="currentColor" strokeWidth="1" />
                    <line x1="45" y1="30" x2="55" y2="30" stroke="currentColor" strokeWidth="1" />
                </svg>
            </div>

            {/* Corner brackets */}
            <svg className="absolute inset-0 w-full h-full text-primary/30" preserveAspectRatio="none">
                <path d="M 20,5 L 5,5 L 5,20" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M 5,80% L 5,95% L 20,95%" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M 95%,5 L 95%,5 L 95%,20" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M 95%,80% L 95%,95% L 80%,95%" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
        </div>
    )
}

function SingleFPV({ unit, compact = false }: { unit: FleetUnit; compact?: boolean }) {
    return (
        <div className={cn("relative rounded border border-border bg-card overflow-hidden", compact ? "h-full" : "h-full")}>
            {compact && (
                <div className="absolute top-2 left-2 z-10 bg-card/80 backdrop-blur px-2 py-0.5 rounded">
                    <span className="font-mono text-[10px] text-primary">{unit.id}</span>
                </div>
            )}
            <Canvas>
                <FPVScene unit={unit} />
            </Canvas>
            {!compact && <HUDOverlay unit={unit} />}
        </div>
    )
}

export function FPVViewer({ unit, mode, fleet }: FPVViewerProps) {
    if (!unit) {
        return (
            <div className="h-full rounded border border-border bg-card flex items-center justify-center">
                <span className="font-mono text-xs text-muted-foreground">SELECT A UNIT FOR FPV</span>
            </div>
        )
    }

    if (mode === "focused") {
        return <SingleFPV unit={unit} />
    }

    const activeUnits = fleet?.slice(0, 4) || [unit]

    return (
        <div className="h-full grid grid-cols-2 grid-rows-2 gap-2">
            {activeUnits.map((u) => (
                <SingleFPV key={u.id} unit={u} compact />
            ))}
            {activeUnits.length < 4 &&
                Array.from({ length: 4 - activeUnits.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="rounded border border-border bg-card/50 flex items-center justify-center">
                        <span className="font-mono text-[10px] text-muted-foreground">NO FEED</span>
                    </div>
                ))}
        </div>
    )
}
