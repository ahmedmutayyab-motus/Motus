import { Check } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      desc: "Perfect for single founders testing the waters.",
      price: "$49",
      features: ["500 active contacts", "3 sequences", "Basic inbox", "Email support"],
      cta: "Start Free Trial",
      highlight: false
    },
    {
      name: "Pro",
      desc: "For small teams needing momentum.",
      price: "$149",
      features: ["Unlimited contacts", "Unlimited sequences", "Unified inbox", "Basic AI Writer", "Priority support"],
      cta: "Get Pro",
      highlight: true
    },
    {
      name: "Scale",
      desc: "For agencies driving complex outbound.",
      price: "$399",
      features: ["Multiple workspaces", "Advanced AI generation", "Custom API", "Dedicated Success Manager"],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <div className="py-24 px-6 relative bg-brand-background">
      <div className="container mx-auto max-w-6xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Simple, transparent pricing.</h1>
        <p className="text-xl text-brand-muted max-w-2xl mx-auto mb-16">
          Invest in momentum. Predictable pricing built for teams of all sizes.
        </p>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative glass-panel rounded-2xl p-8 flex flex-col ${plan.highlight ? 'border-brand-primary border-2 shadow-brand-primary/20 shadow-2xl scale-105 z-10' : ''}`}>
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-primary px-3 py-1 rounded-full text-xs font-semibold text-white tracking-wide uppercase">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-brand-muted text-sm mb-6 h-10">{plan.desc}</p>
              <div className="text-4xl font-bold text-white mb-8">
                {plan.price}<span className="text-base text-brand-muted font-normal">/mo</span>
              </div>
              
              <ul className="mb-8 space-y-4 flex-1">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center text-sm text-brand-foreground">
                    <Check className="h-5 w-5 text-brand-primary mr-3 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-4 rounded-md font-medium transition-all ${plan.highlight ? 'bg-brand-primary text-white hover:bg-brand-primaryHover shadow-lg' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
