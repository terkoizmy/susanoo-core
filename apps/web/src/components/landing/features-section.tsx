"use client"

import { motion } from "framer-motion"
import { Navigation, Brain, Box } from "lucide-react"

const features = [
    {
        icon: Navigation,
        title: "Autonomous Navigation",
        description:
            "Self-guided robotic systems navigate complex pipeline networks using SLAM and sensor fusion for complete infrastructure coverage.",
        highlights: ["LiDAR + IMU Fusion", "Path Planning AI", "Obstacle Avoidance"],
    },
    {
        icon: Brain,
        title: "AI Anomaly Detection",
        description:
            "NPU-optimized neural networks process sensor data at the edge for real-time leak detection, corrosion analysis, and predictive maintenance.",
        highlights: ["NPU Accelerated", "99.7% Accuracy", "<50ms Latency"],
    },
    {
        icon: Box,
        title: "Real-time Digital Twin",
        description:
            "Live 3D simulation mirrors physical infrastructure state, enabling remote monitoring, scenario testing, and data-driven decision making.",
        highlights: ["WebGL Rendering", "Live Telemetry Sync", "Historical Playback"],
    },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
}

export function FeaturesSection() {
    return (
        <section id="features" className="py-32 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="text-sm text-primary font-medium uppercase tracking-widest">Capabilities</span>
                    <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground text-balance">
                        Intelligent Infrastructure Protection
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-pretty">
                        Advanced robotics and AI working together to ensure the safety and efficiency of hydrogen pipeline networks.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-3 gap-6"
                >
                    {features.map((feature) => (
                        <motion.div key={feature.title} variants={itemVariants} className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative h-full p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-primary/30 transition-colors duration-300">
                                <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="w-7 h-7 text-primary" />
                                </div>

                                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>

                                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{feature.description}</p>

                                <div className="flex flex-wrap gap-2">
                                    {feature.highlights.map((highlight) => (
                                        <span
                                            key={highlight}
                                            className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full"
                                        >
                                            {highlight}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
