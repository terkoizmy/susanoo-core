"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Grid, Environment, Float } from "@react-three/drei"
import * as THREE from "three"
import type { FleetUnit } from "@/pages/dashboard-page"

interface FleetMapProps {
    fleet: FleetUnit[]
    selectedUnit: FleetUnit | null
    onSelectUnit: (unit: FleetUnit) => void
}

function Pipeline() {
    const points = [
        new THREE.Vector3(-4, 0, 0),
        new THREE.Vector3(-2, 0, 0),
        new THREE.Vector3(-1, 0, 1),
        new THREE.Vector3(1, 0, 1),
        new THREE.Vector3(2, 0, 0),
        new THREE.Vector3(4, 0, 0),
    ]

    const curve = new THREE.CatmullRomCurve3(points)
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.15, 16, false)

    return (
        <group>
            <mesh geometry={tubeGeometry}>
                <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-4, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[4, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.6, 16]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.1} />
            </mesh>
        </group>
    )
}

function UnitMarker({
    unit,
    isSelected,
    onClick,
}: {
    unit: FleetUnit
    isSelected: boolean
    onClick: () => void
}) {
    const meshRef = useRef<THREE.Mesh>(null)
    const ringRef = useRef<THREE.Mesh>(null)

    const getHealthColor = (health: FleetUnit["health"]) => {
        switch (health) {
            case "optimal":
                return "#10b981"
            case "warning":
                return "#f59e0b"
            case "critical":
                return "#ef4444"
        }
    }

    useFrame((state) => {
        if (ringRef.current && isSelected) {
            ringRef.current.rotation.z = state.clock.elapsedTime * 2
        }
        if (meshRef.current) {
            meshRef.current.scale.setScalar(isSelected ? 1.2 : 1)
        }
    })

    const color = getHealthColor(unit.health)

    return (
        <Float speed={2} rotationIntensity={0} floatIntensity={unit.type === "drone" ? 0.3 : 0}>
            <group position={unit.position} onClick={onClick}>
                <mesh ref={meshRef}>
                    {unit.type === "rover" && <boxGeometry args={[0.3, 0.2, 0.4]} />}
                    {unit.type === "drone" && <octahedronGeometry args={[0.2]} />}
                    {unit.type === "crawler" && <capsuleGeometry args={[0.1, 0.2, 4, 8]} />}
                    <meshStandardMaterial
                        color={isSelected ? color : "#475569"}
                        emissive={color}
                        emissiveIntensity={isSelected ? 0.5 : 0.2}
                        metalness={0.8}
                        roughness={0.2}
                    />
                </mesh>

                {isSelected && (
                    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.4, 0.5, 32]} />
                        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
                    </mesh>
                )}

                <pointLight color={color} intensity={isSelected ? 1 : 0.3} distance={2} />
            </group>
        </Float>
    )
}

function Scene({
    fleet,
    selectedUnit,
    onSelectUnit,
}: {
    fleet: FleetUnit[]
    selectedUnit: FleetUnit | null
    onSelectUnit: (unit: FleetUnit) => void
}) {
    return (
        <>
            {/* Enhanced Lighting Setup */}
            <ambientLight intensity={0.6} color="#e0f2fe" />
            <hemisphereLight
                args={["#87ceeb", "#1e3a5f", 0.8]}
                position={[0, 20, 0]}
            />

            {/* Main directional light (sun-like) */}
            <directionalLight
                position={[10, 15, 8]}
                intensity={1.2}
                color="#ffffff"
                castShadow
            />

            {/* Fill lights for even illumination */}
            <directionalLight
                position={[-8, 10, -5]}
                intensity={0.6}
                color="#94a3b8"
            />
            <directionalLight
                position={[0, 5, -10]}
                intensity={0.4}
                color="#7dd3fc"
            />

            {/* Accent spot light for dramatic effect */}
            <spotLight
                position={[0, 12, 0]}
                angle={0.6}
                penumbra={0.5}
                intensity={1.5}
                color="#38bdf8"
                distance={25}
            />

            {/* Rim lights for depth */}
            <pointLight position={[-6, 3, 4]} intensity={0.5} color="#22d3ee" distance={12} />
            <pointLight position={[6, 3, -4]} intensity={0.5} color="#a78bfa" distance={12} />

            <Pipeline />

            {fleet.map((unit) => (
                <UnitMarker
                    key={unit.id}
                    unit={unit}
                    isSelected={selectedUnit?.id === unit.id}
                    onClick={() => onSelectUnit(unit)}
                />
            ))}

            <Grid
                position={[0, -0.5, 0]}
                args={[20, 20]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#334155"
                sectionSize={5}
                sectionThickness={1}
                sectionColor="#475569"
                fadeDistance={30}
                fadeStrength={1}
                infiniteGrid
            />

            <Environment preset="city" background={false} />
            <OrbitControls
                enablePan
                enableZoom
                enableRotate
                minPolarAngle={0.2}
                maxPolarAngle={Math.PI / 2.2}
                minDistance={3}
                maxDistance={15}
            />
        </>
    )
}

export function FleetMap({ fleet, selectedUnit, onSelectUnit }: FleetMapProps) {
    return (
        <div className="h-full rounded border border-border bg-card overflow-hidden relative">
            <div className="absolute top-2 left-2 z-10">
                <span className="font-mono text-[10px] text-muted-foreground tracking-wider bg-card/80 px-2 py-1 rounded">
                    TACTICAL MAP
                </span>
            </div>
            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                <Scene fleet={fleet} selectedUnit={selectedUnit} onSelectUnit={onSelectUnit} />
            </Canvas>
        </div>
    )
}
