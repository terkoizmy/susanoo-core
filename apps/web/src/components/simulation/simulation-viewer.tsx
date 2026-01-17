"use client"

import { Suspense, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Grid, Environment, Text, Float } from "@react-three/drei"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Maximize2, RotateCcw, ZoomIn, ZoomOut, Play, Pause, Layers } from "lucide-react"
import type * as THREE from "three"

function Pipeline({ position, length, color }: { position: [number, number, number]; length: number; color: string }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.15, 0.15, length, 32]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Connector rings */}
      {Array.from({ length: Math.floor(length / 2) + 1 }).map((_, i) => (
        <mesh key={i} position={[-length / 2 + i * 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.03, 16, 32]} />
          <meshStandardMaterial color="#444" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

function FlowParticles({
  start,
  end,
  color,
}: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 50

  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    const t = i / particleCount
    positions[i * 3] = start[0] + (end[0] - start[0]) * t
    positions[i * 3 + 1] = start[1] + (end[1] - start[1]) * t
    positions[i * 3 + 2] = start[2] + (end[2] - start[2]) * t
  }

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      const time = state.clock.elapsedTime

      for (let i = 0; i < particleCount; i++) {
        const t = (i / particleCount + time * 0.2) % 1
        positions[i * 3] = start[0] + (end[0] - start[0]) * t
        positions[i * 3 + 1] = start[1] + (end[1] - start[1]) * t + Math.sin(t * Math.PI * 2) * 0.02
        positions[i * 3 + 2] = start[2] + (end[2] - start[2]) * t
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color={color} transparent opacity={0.8} />
    </points>
  )
}

function Valve({ position, isOpen = true }: { position: [number, number, number]; isOpen?: boolean }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial color={isOpen ? "#22d3ee" : "#ef4444"} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
        <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 16, 32]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

function PressureGauge({ position, value }: { position: [number, number, number]; value: number }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.18, 32]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <Float speed={0.5} rotationIntensity={0} floatIntensity={0.1}>
        <Text
          position={[0, 0.06, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.08}
          color="#22d3ee"
          // font="/fonts/Geist-Bold.ttf"
        >
          {value.toFixed(1)} bar
        </Text>
      </Float>
    </group>
  )
}

function StorageTank({ position, fillLevel = 0.7 }: { position: [number, number, number]; fillLevel?: number }) {
  return (
    <group position={position}>
      {/* Tank body */}
      <mesh>
        <cylinderGeometry args={[0.8, 0.8, 2, 32]} />
        <meshStandardMaterial color="#2a2a4a" metalness={0.7} roughness={0.3} transparent opacity={0.9} />
      </mesh>
      {/* Fill level indicator */}
      <mesh position={[0, -1 + fillLevel, 0]}>
        <cylinderGeometry args={[0.75, 0.75, fillLevel * 2, 32]} />
        <meshStandardMaterial color="#22d3ee" transparent opacity={0.4} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2a2a4a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Bottom cap */}
      <mesh position={[0, -1.1, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2a2a4a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Label */}
      <Text position={[0, 0, 0.85]} fontSize={0.15} color="#ffffff" >
        H2
      </Text>
    </group>
  )
}

function PipelineSystem() {
  return (
    <group>
      {/* Main pipeline sections */}
      <Pipeline position={[-4, 0, 0]} length={4} color="#3b82f6" />
      <Pipeline position={[0, 0, 0]} length={4} color="#22d3ee" />
      <Pipeline position={[4, 0, 0]} length={4} color="#22d3ee" />

      {/* Vertical sections */}
      <group rotation={[0, 0, 0]}>
        <Pipeline position={[-6, 1, 0]} length={2} color="#3b82f6" />
        <Pipeline position={[6, 1, 0]} length={2} color="#22d3ee" />
      </group>

      {/* Flow particles */}
      <FlowParticles start={[-6, 0, 0]} end={[6, 0, 0]} color="#22d3ee" />

      {/* Valves */}
      <Valve position={[-2, 0, 0]} isOpen={true} />
      <Valve position={[2, 0, 0]} isOpen={true} />

      {/* Pressure gauges */}
      <PressureGauge position={[-4, 0.4, 0]} value={48.5} />
      <PressureGauge position={[0, 0.4, 0]} value={47.2} />
      <PressureGauge position={[4, 0.4, 0]} value={46.8} />

      {/* Storage tanks */}
      <StorageTank position={[-6, 2.5, 0]} fillLevel={0.85} />
      <StorageTank position={[6, 2.5, 0]} fillLevel={0.45} />
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#22d3ee" />

      <PipelineSystem />

      <Grid
        position={[0, -0.5, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1e293b"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#334155"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
      />

      <Environment preset="night" />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={25}
        target={[0, 1, 0]}
      />
    </>
  )
}

export function SimulationViewer() {
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <Card className="flex h-full flex-col border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-semibold">3D Pipeline Simulation</CardTitle>
          <Badge variant="outline" className="border-primary text-primary">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Live
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Layers className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="relative h-full w-full rounded-b-lg overflow-hidden bg-background">
          <Canvas camera={{ position: [8, 6, 8], fov: 50 }} shadows className="!h-full">
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>

          {/* Overlay HUD */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              Section: Main Line
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs">
              Km: 0.0 - 12.5
            </Badge>
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <Badge variant="outline" className="border-success text-success font-mono text-xs">
              Integrity: 98.7%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
