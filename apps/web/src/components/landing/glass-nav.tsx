"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const navItems = [
    { label: "Features", href: "#features" },
    { label: "Technology", href: "#tech" },
    { label: "Vision", href: "#vision" },
]

export function GlassNav() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/60 backdrop-blur-xl border-b border-border/50" : "bg-transparent"
                }`}
        >
            <nav className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
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

                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            Documentation
                        </Button>
                        <Link href="/dashboard">
                            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                                Launch Dashboard
                            </Button>
                        </Link>
                    </div>

                    <button
                        className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4"
                    >
                        <div className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                                    Launch Dashboard
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </nav>
        </motion.header>
    )
}
