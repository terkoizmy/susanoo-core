"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"
import { HeroRobot } from "./hero-robot"

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    })

    const y = useTransform(scrollYProgress, [0, 1], [0, 150])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
        >
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_70%)]" />
            </div>

            <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div style={{ y, opacity }} className="text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6"
                        >
                            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            <span className="text-sm text-primary font-medium">Now in Early Access</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-balance"
                        >
                            <span className="text-foreground">The Future of</span>
                            <br />
                            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                Hydrogen Safety
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 text-pretty"
                        >
                            Autonomous robotics powered by edge AI for real-time inspection, anomaly detection, and digital twin
                            simulation of green hydrogen infrastructure.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
                        >
                            <Link href="/dashboard">
                                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                                    Launch Dashboard
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="gap-2 border-border/50 hover:bg-secondary bg-transparent">
                                <Play className="w-4 h-4" />
                                Watch Demo
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="mt-12 flex items-center gap-8 justify-center lg:justify-start"
                        >
                            <div className="text-center">
                                <div className="text-2xl font-bold text-foreground">99.7%</div>
                                <div className="text-xs text-muted-foreground">Detection Accuracy</div>
                            </div>
                            <div className="w-px h-10 bg-border" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-foreground">{"<"}50ms</div>
                                <div className="text-xs text-muted-foreground">Response Time</div>
                            </div>
                            <div className="w-px h-10 bg-border" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-foreground">24/7</div>
                                <div className="text-xs text-muted-foreground">Autonomous Ops</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative h-[500px] lg:h-[600px]"
                    >
                        <HeroRobot />
                    </motion.div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                        className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-2"
                    >
                        <div className="w-1 h-2 bg-muted-foreground rounded-full" />
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}
