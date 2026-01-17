"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf, Zap, Shield, Globe } from "lucide-react"
import Link from "next/link"

const reasons = [
    {
        icon: Leaf,
        title: "Sustainable Future",
        description: "Green hydrogen is key to decarbonizing heavy industry and transportation.",
    },
    {
        icon: Zap,
        title: "Scaling Challenge",
        description: "Infrastructure must grow 100x by 2050 to meet global energy demands.",
    },
    {
        icon: Shield,
        title: "Safety Critical",
        description: "Hydrogen requires specialized monitoring due to its unique properties.",
    },
    {
        icon: Globe,
        title: "Global Impact",
        description: "Every leak prevented accelerates the clean energy transition.",
    },
]

export function VisionSection() {
    return (
        <section id="vision" className="py-32 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-sm text-primary font-medium uppercase tracking-widest">Our Vision</span>
                        <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground text-balance">
                            Why Green Hydrogen Needs Aetheris
                        </h2>
                        <p className="mt-6 text-muted-foreground leading-relaxed text-pretty">
                            The hydrogen economy represents a $2.5 trillion opportunity by 2050. But scaling safely requires a new
                            approach to infrastructure monitoring. Traditional inspection methods cannot keep pace with the growth
                            needed to achieve net-zero targets.
                        </p>
                        <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
                            Aetheris combines autonomous robotics, edge AI, and digital twin technology to enable continuous,
                            intelligent monitoring at scale. We are building the nervous system for the hydrogen economy.
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="mt-10 flex flex-col sm:flex-row gap-4"
                        >
                            <Link href="/dashboard">
                                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                                    Explore the Platform
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="border-border/50 hover:bg-secondary bg-transparent">
                                Request a Demo
                            </Button>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {reasons.map((reason, index) => (
                            <motion.div
                                key={reason.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                className="p-6 bg-card/30 border border-border/50 rounded-xl hover:border-primary/30 transition-colors duration-300"
                            >
                                <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mb-4">
                                    <reason.icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-sm font-semibold text-foreground mb-2">{reason.title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{reason.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
