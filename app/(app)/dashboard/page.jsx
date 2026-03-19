"use client";

import { useEffect, useState } from "react";
import { Activity, Users, Send, Reply, Loader2 } from "lucide-react";
import { getContacts } from "@/app/actions/contacts";
import Link from "next/link";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    total: 0,
    newThisWeek: 0,
    loading: true
  });

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await getContacts("", "all");
        // Calculate basic metrics from real data
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const newContactsCount = data.filter(c => new Date(c.created_at) > oneWeekAgo).length;

        setMetrics({
          total: data.length,
          newThisWeek: newContactsCount,
          loading: false
        });
      } catch (error) {
        setMetrics(prev => ({ ...prev, loading: false }));
      }
    }
    fetchMetrics();
  }, []);

  const stats = [
    { label: "Total Contacts", value: metrics.loading ? "..." : metrics.total, icon: Users, change: `${metrics.newThisWeek} new this week` },
    { label: "Active Sequences", value: "0", icon: Activity, change: "Phase 5 metric" },
    { label: "Emails Sent", value: "0", icon: Send, change: "Phase 5 metric" },
    { label: "Replies", value: "0", icon: Reply, change: "Phase 5 metric" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <Link href="/contacts" className="bg-brand-primary hover:bg-brand-primaryHover text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow flex items-center">
          Go to Contacts
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-xl relative overflow-hidden group hover:border-brand-primary/20 transition-all cursor-default">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-brand-muted">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-brand-primary/70" />
            </div>
            <div className="text-3xl font-bold text-white mb-2 flex items-center">
               {metrics.loading && i === 0 ? <Loader2 className="h-6 w-6 animate-spin text-brand-muted" /> : stat.value}
            </div>
            <div className="text-xs text-brand-muted">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl flex flex-col items-center justify-center border border-white/5 text-center px-10 min-h-[300px]">
          {metrics.total === 0 && !metrics.loading ? (
            <>
              <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-brand-primary" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Build your outreach engine</h2>
              <p className="text-brand-muted mb-6">Import your first CSV list or add contacts manually to give your workspace momentum.</p>
              <Link href="/contacts" className="px-6 py-2 bg-brand-primary text-white rounded-md font-medium shadow-lg hover:-translate-y-0.5 transition-transform">
                Get Started
              </Link>
            </>
          ) : (
             <>
               <Activity className="h-10 w-10 text-brand-muted mb-4 opacity-50" />
               <p className="text-brand-muted font-medium mb-1">Sequence Activity Planner</p>
               <p className="text-sm text-brand-muted/70 max-w-sm">Charts and delivery statistics will populate here automatically once Phase 3 sequence engines are online.</p>
             </>
          )}
        </div>
        
        <div className="glass-panel p-6 rounded-xl flex flex-col border border-white/5 h-full">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {metrics.total > 0 && !metrics.loading ? (
               <>
                 <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4 border border-brand-primary/20">
                   <Users className="h-6 w-6 text-brand-primary" />
                 </div>
                 <p className="text-white font-medium mb-1">Momentum Building</p>
                 <p className="text-xs text-brand-muted">You added {metrics.newThisWeek} contacts this week. Keep iterating your list.</p>
               </>
            ) : (
               <>
                 <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                   <Reply className="h-6 w-6 text-brand-muted" />
                 </div>
                 <p className="text-brand-muted font-medium mb-1">No recent activity</p>
               </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
