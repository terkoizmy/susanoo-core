"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export function Footer() {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border-t border-border/50 bg-card/30"
        >
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid md:grid-cols-4 gap-12">
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
                                <div className="relative w-full h-full bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-center">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="w-6 h-6 text-primary"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    >
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                        <path d="M2 17l10 5 10-5" />
                                        <path d="M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-xl font-semibold tracking-tight text-foreground">Aetheris</span>
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground max-w-sm">
                            AI-powered robotics for the safe and sustainable scaling of green hydrogen infrastructure worldwide.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="#features"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="#tech" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Technology
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Documentation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#vision" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Press
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">2026 Aetheris Technologies. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </motion.footer>
    )
}
