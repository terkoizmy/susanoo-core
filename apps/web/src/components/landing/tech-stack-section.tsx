"use client"

import { motion } from "framer-motion"

const technologies = [
    {
        name: "Rust",
        description: "Core robotics firmware",
        icon: (
            <svg viewBox="0 0 32 32" className="w-10 h-10" fill="currentColor">
                <path d="M16 1.5c-8.008 0-14.5 6.492-14.5 14.5s6.492 14.5 14.5 14.5 14.5-6.492 14.5-14.5-6.492-14.5-14.5-14.5zm0 1.5c7.18 0 13 5.82 13 13s-5.82 13-13 13-13-5.82-13-13 5.82-13 13-13zm-1.5 5v2h3v-2zm-5 3v2h2v3h-2v2h4v-5h3v5h4v-2h-2v-3h2v-2zm1 10v2h11v-2z" />
            </svg>
        ),
    },
    {
        name: "Next.js",
        description: "Dashboard & visualization",
        icon: (
            <svg viewBox="0 0 32 32" className="w-10 h-10" fill="currentColor">
                <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.12 20.36l-8.78-11.87v8.37h-1.5V9.14h.12l9.18 12.4c-.3.28-.64.54-1.02.82zM21.5 21V11h1.5v10z" />
            </svg>
        ),
    },
    {
        name: "TensorRT",
        description: "NPU inference engine",
        icon: (
            <svg viewBox="0 0 32 32" className="w-10 h-10" fill="currentColor">
                <path d="M16 4L4 10v12l12 6 12-6V10L16 4zm0 2.18l9.5 4.75v9.5L16 25.18l-9.5-4.75v-9.5L16 6.18z" />
                <path d="M16 10l-6 3v6l6 3 6-3v-6l-6-3zm0 2l4 2-4 2-4-2 4-2z" />
            </svg>
        ),
    },
    {
        name: "ROS 2",
        description: "Robot operating system",
        icon: (
            <svg viewBox="0 0 32 32" className="w-10 h-10" fill="currentColor">
                <circle cx="16" cy="16" r="3" />
                <circle cx="16" cy="8" r="2" />
                <circle cx="16" cy="24" r="2" />
                <circle cx="9" cy="12" r="2" />
                <circle cx="23" cy="12" r="2" />
                <circle cx="9" cy="20" r="2" />
                <circle cx="23" cy="20" r="2" />
                <path d="M16 11v2m0 6v2m-5-9l1.5 1m7-1l-1.5 1m-7 5l1.5-1m7 1l-1.5-1" stroke="currentColor" strokeWidth="1" />
            </svg>
        ),
    },
    {
        name: "Three.js",
        description: "3D digital twin rendering",
        icon: (
            <svg viewBox="0 0 32 32" className="w-10 h-10" fill="currentColor">
                <path d="M6 6h20v20H6z" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M6 6l10 10m10-10l-10 10m0 0l-10 10m10-10l10 10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        name: "PostgreSQL",
        description: "Time-series telemetry",
        icon: (
            <svg viewBox="0 0 32 32" className="w-10 h-10" fill="currentColor">
                <ellipse cx="16" cy="9" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M6 9v14c0 2.21 4.477 4 10 4s10-1.79 10-4V9" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M6 16c0 2.21 4.477 4 10 4s10-1.79 10-4" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
        ),
    },
]

export function TechStackSection() {
    return (
        <section id="tech" className="py-32 relative">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-sm text-primary font-medium uppercase tracking-widest">Technology</span>
                    <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground text-balance">
                        Built on Proven Foundations
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-pretty">
                        Enterprise-grade technologies chosen for reliability, performance, and safety.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                >
                    {technologies.map((tech, index) => (
                        <motion.div
                            key={tech.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="group flex flex-col items-center p-6 bg-card/30 border border-border/50 rounded-xl hover:border-primary/30 hover:bg-card/50 transition-all duration-300"
                        >
                            <div className="text-muted-foreground group-hover:text-primary transition-colors duration-300">
                                {tech.icon}
                            </div>
                            <span className="mt-4 text-sm font-medium text-foreground">{tech.name}</span>
                            <span className="mt-1 text-xs text-muted-foreground text-center">{tech.description}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
