"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, MeshTransmissionMaterial } from "@react-three/drei"
import type * as THREE from "three"

function RobotCore() {
    const groupRef = useRef<THREE.Group>(null)
    const ringRef1 = useRef<THREE.Mesh>(null)
    const ringRef2 = useRef<THREE.Mesh>(null)
    const ringRef3 = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (groupRef.current) {
            groupRef.current.rotation.y = t * 0.1
        }
        if (ringRef1.current) {
            ringRef1.current.rotation.x = t * 0.5
            ringRef1.current.rotation.z = t * 0.3
        }
        if (ringRef2.current) {
            ringRef2.current.rotation.x = -t * 0.4
            ringRef2.current.rotation.y = t * 0.2
        }
        if (ringRef3.current) {
            ringRef3.current.rotation.z = t * 0.6
            ringRef3.current.rotation.x = t * 0.1
        }
    })

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group ref={groupRef}>
                <mesh>
                    <icosahedronGeometry args={[1.2, 1]} />
                    <MeshTransmissionMaterial
                        backside
                        samples={16}
                        resolution={512}
                        transmission={0.95}
                        roughness={0.1}
                        thickness={0.5}
                        ior={1.5}
                        chromaticAberration={0.1}
                        anisotropy={0.3}
                        distortion={0.2}
                        distortionScale={0.5}
                        color="#10b981"
                    />
                </mesh>

                <mesh>
                    <icosahedronGeometry args={[0.6, 2]} />
                    <meshStandardMaterial
                        color="#10b981"
                        emissive="#10b981"
                        emissiveIntensity={0.5}
                        metalness={0.9}
                        roughness={0.1}
                    />
                </mesh>

                <mesh ref={ringRef1}>
                    <torusGeometry args={[1.8, 0.02, 16, 100]} />
                    <meshStandardMaterial
                        color="#06b6d4"
                        emissive="#06b6d4"
                        emissiveIntensity={0.8}
                        metalness={1}
                        roughness={0}
                    />
                </mesh>

                <mesh ref={ringRef2}>
                    <torusGeometry args={[2.2, 0.015, 16, 100]} />
                    <meshStandardMaterial
                        color="#10b981"
                        emissive="#10b981"
                        emissiveIntensity={0.6}
                        metalness={1}
                        roughness={0}
                    />
                </mesh>

                <mesh ref={ringRef3}>
                    <torusGeometry args={[2.6, 0.01, 16, 100]} />
                    <meshStandardMaterial
                        color="#22d3ee"
                        emissive="#22d3ee"
                        emissiveIntensity={0.4}
                        metalness={1}
                        roughness={0}
                    />
                </mesh>

                {[...Array(8)].map((_, i) => {
                    const angle = (i / 8) * Math.PI * 2
                    return (
                        <mesh key={i} position={[Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0]}>
                            <sphereGeometry args={[0.08, 16, 16]} />
                            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} />
                        </mesh>
                    )
                })}
            </group>
        </Float>
    )
}

export function HeroRobot() {
    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#10b981" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
                <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} color="#ffffff" />
                <RobotCore />
                <Environment preset="night" />
            </Canvas>
        </div>
    )
}
