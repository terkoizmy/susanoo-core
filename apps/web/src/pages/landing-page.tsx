"use client"

import { GlassNav } from "@/components/landing/glass-nav"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { TechStackSection } from "@/components/landing/tech-stack-section"
import { VisionSection } from "@/components/landing/vision-section"
import { Footer } from "@/components/landing/footer"

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            <GlassNav />
            <main>
                <HeroSection />
                <FeaturesSection />
                <TechStackSection />
                <VisionSection />
            </main>
            <Footer />
        </div>
    )
}
