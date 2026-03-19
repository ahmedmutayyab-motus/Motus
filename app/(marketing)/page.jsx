import Link from "next/link";
import { MoveRight, Zap, Target, Layers, ArrowUpRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30 pointer-events-none" />
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 text-sm text-brand-primary mb-8">
            <span className="flex h-2 w-2 rounded-full bg-brand-primary mr-2"></span>
            Motus Phase 1 Foundation
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Unify your outbound workflow.
          </h1>
          <p className="text-xl md:text-2xl text-brand-muted max-w-3xl mx-auto mb-10 font-light leading-relaxed">
            The AI-native outbound operating system for founders, small sales teams, and agencies. 
            Momentum, control, and precision in one system.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="group inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-md bg-brand-foreground px-8 text-sm font-medium text-brand-background shadow transition-colors hover:bg-white/90">
              Start your free trial
              <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/pricing" className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-md border border-white/10 bg-transparent px-8 text-sm font-medium text-brand-foreground shadow-sm transition-colors hover:bg-white/5">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Overview Section */}
      <section id="features" className="py-24 px-6 relative bg-obsidian-900 border-t border-white/5">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 md:text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">Why unify your stack?</h2>
            <p className="text-lg text-brand-muted md:max-w-2xl mx-auto">
              Stop stitching together disconnected tools. Bring everything from contacts to sequences into a highly opinionated workflow designed for conversion.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Precision Targeting", desc: "Build tailored lists and identify the exact moments to reach out." },
              { icon: Zap, title: "Intelligent Workflows", desc: "Construct sequences that adapt based on prospect signals." },
              { icon: Layers, title: "Centralized Context", desc: "Every touchpoint, response, and action visible in one unified command center." }
            ].map((Feature, i) => (
              <div key={i} className="glass-panel p-8 rounded-2xl flex flex-col group hover:border-brand-primary/30 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-6">
                  <Feature.icon className="h-6 w-6 text-brand-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-brand-foreground">{Feature.title}</h3>
                <p className="text-brand-muted leading-relaxed flex-1">{Feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-32 px-6 relative border-t border-white/5 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to gain momentum?</h2>
          <p className="text-xl text-brand-muted mb-10">Join the teams streamlining their entire outbound OS.</p>
          <Link href="/signup" className="group inline-flex h-14 items-center justify-center rounded-md bg-brand-primary px-10 text-base font-semibold text-white shadow-xl hover:shadow-brand-primary/20 transition-all hover:-translate-y-0.5">
            Create your account
            <ArrowUpRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
