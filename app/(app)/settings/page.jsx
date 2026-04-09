"use client";

import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon, Building, User, Mail, Save, Users,
  CreditCard, BarChart3, Zap, Crown, ArrowUpRight, Trash2, Shield, Globe
} from "lucide-react";
import { getWorkspaceProfile, updateWorkspaceProfile, getUserProfile, updateUserProfile, getWorkspaceMembers } from "@/app/actions/settings";
import { getCurrentPlan, getPlans, getUsageStats, createCheckoutSession, removeMember } from "@/app/actions/billing";
import { toast } from "sonner";

const TABS = [
  { key: "general", label: "General", icon: Building },
  { key: "billing", label: "Billing & Plan", icon: CreditCard },
  { key: "members", label: "Team Members", icon: Users },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingWorkspace, setSavingWorkspace] = useState(false);

  const [userData, setUserData] = useState({ id: "", email: "", full_name: "" });
  const [workspaceData, setWorkspaceData] = useState({ name: "", created_at: "" });
  const [members, setMembers] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [usr, ws, mems, plan, allPlans, usageData] = await Promise.all([
          getUserProfile(),
          getWorkspaceProfile(),
          getWorkspaceMembers(),
          getCurrentPlan(),
          getPlans(),
          getUsageStats()
        ]);
        setUserData(usr);
        setWorkspaceData(ws);
        setMembers(mems);
        setCurrentPlan(plan);
        setPlans(allPlans);
        setUsage(usageData);
      } catch (err) {
        toast.error("Failed to load settings data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleUserSave(e) {
    e.preventDefault();
    setSavingUser(true);
    try {
      await updateUserProfile({ full_name: userData.full_name });
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSavingUser(false);
    }
  }

  async function handleWorkspaceSave(e) {
    e.preventDefault();
    setSavingWorkspace(true);
    try {
      await updateWorkspaceProfile(workspaceData.name);
      toast.success("Workspace updated successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to update workspace.");
    } finally {
      setSavingWorkspace(false);
    }
  }

  async function handleUpgrade(planKey) {
    try {
      const result = await createCheckoutSession(planKey);
      if (result.requiresSetup) {
        toast.info(result.message);
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      toast.error(err.message || "Checkout failed.");
    }
  }

  async function handleRemoveMember(userId) {
    if (!confirm("Remove this member from the workspace?")) return;
    try {
      await removeMember(userId);
      setMembers(prev => prev.filter(m => m.user_id !== userId));
      toast.success("Member removed.");
    } catch (err) {
      toast.error(err.message || "Failed to remove member.");
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-amber"></div>
        <p className="text-brand-muted/70 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-8 px-8 pb-12 overflow-y-auto w-full max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-brand-light flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-brand-amber" />
          Settings
        </h1>
        <p className="text-brand-muted mt-1 text-sm">
          Manage your workspace, billing, and team.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-8 bg-brand-surface/50 rounded-lg p-1 border border-white/5 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-brand-amber/15 text-brand-amber"
                : "text-brand-muted hover:text-brand-light hover:bg-white/5"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* GENERAL TAB */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-8">
            {/* Workspace Profile */}
            <div className="bg-brand-surface border border-white/5 rounded-xl overflow-hidden glass-panel">
              <div className="p-6 border-b border-white/5 space-y-1">
                <h2 className="text-lg font-medium text-brand-light flex items-center gap-2">
                  <Building className="h-5 w-5 text-brand-amber/80" />
                  Workspace Profile
                </h2>
                <p className="text-sm text-brand-muted">Update your workspace details.</p>
              </div>
              <form className="p-6 space-y-4" onSubmit={handleWorkspaceSave}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-light/90">Workspace Name</label>
                  <input
                    type="text"
                    value={workspaceData.name}
                    onChange={(e) => setWorkspaceData({ ...workspaceData, name: e.target.value })}
                    className="w-full bg-brand-surface/50 border border-white/10 rounded-md px-3 py-2 text-sm text-brand-light focus:outline-none focus:border-brand-amber/50 focus:ring-1 focus:ring-brand-amber/50 transition-all"
                    placeholder="Acme Corp"
                    required
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingWorkspace || !workspaceData.name.trim()}
                    className="bg-brand-amber text-brand-dark px-4 py-2 rounded-md hover:bg-brand-amber/90 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingWorkspace ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-dark border-t-transparent" />
                    ) : <Save className="h-4 w-4" />}
                    Save Workspace
                  </button>
                </div>
              </form>
            </div>

            {/* Personal Profile */}
            <div className="bg-brand-surface border border-white/5 rounded-xl overflow-hidden glass-panel">
              <div className="p-6 border-b border-white/5 space-y-1">
                <h2 className="text-lg font-medium text-brand-light flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-amber/80" />
                  Personal Profile
                </h2>
                <p className="text-sm text-brand-muted">Update your login profile and name.</p>
              </div>
              <form className="p-6 space-y-4" onSubmit={handleUserSave}>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-light/90">Email Address (Read-only)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-brand-muted" />
                    </div>
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                      className="w-full bg-brand-surface/30 border border-white/5 rounded-md pl-10 px-3 py-2 text-sm text-brand-muted cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-light/90">Full Name</label>
                  <input
                    type="text"
                    value={userData.full_name}
                    onChange={(e) => setUserData({ ...userData, full_name: e.target.value })}
                    className="w-full bg-brand-surface/50 border border-white/10 rounded-md px-3 py-2 text-sm text-brand-light focus:outline-none focus:border-brand-amber/50 focus:ring-1 focus:ring-brand-amber/50 transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingUser}
                    className="border border-white/10 hover:bg-white/5 text-brand-light px-4 py-2 rounded-md transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    {savingUser ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-5 space-y-6">
            {/* Workspace switching notice */}
            <div className="bg-brand-surface/50 border border-white/5 rounded-xl p-6 glass-panel">
              <h3 className="text-brand-light font-medium flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-brand-amber" />
                Workspace Switching
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Multi-workspace switching is planned for a future release. Currently, all team members share this single workspace context.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BILLING TAB */}
      {activeTab === "billing" && (
        <div className="space-y-8">
          {/* Current Plan + Usage Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Current Plan */}
            <div className="md:col-span-5 bg-brand-surface border border-white/5 rounded-xl p-6 glass-panel relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-amber/5 rounded-full -translate-y-8 translate-x-8" />
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-brand-amber" />
                <h3 className="text-brand-light font-medium">Current Plan</h3>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-brand-light">{currentPlan?.price}</span>
                <span className="text-sm text-brand-muted">{currentPlan?.period}</span>
              </div>
              <p className="text-brand-amber font-medium text-sm mb-4">{currentPlan?.name}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  currentPlan?.billing_status === 'active'
                    ? 'bg-green-500/15 text-green-400'
                    : 'bg-red-500/15 text-red-400'
                }`}>
                  {currentPlan?.billing_status === 'active' ? '● Active' : '● Inactive'}
                </span>
                {currentPlan?.current_period_end && (
                  <span className="text-brand-muted">
                    Renews {new Date(currentPlan.current_period_end).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Usage Stats */}
            <div className="md:col-span-7 bg-brand-surface border border-white/5 rounded-xl p-6 glass-panel">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="h-5 w-5 text-brand-amber" />
                <h3 className="text-brand-light font-medium">Usage Overview</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Contacts", value: usage?.contacts ?? 0, limit: currentPlan?.contactLimit },
                  { label: "Sequences", value: usage?.sequences ?? 0, limit: currentPlan?.sequenceLimit },
                  { label: "Threads", value: usage?.threads ?? 0, limit: null },
                  { label: "AI Generations", value: usage?.aiGenerations ?? 0, limit: null },
                ].map((stat, i) => (
                  <div key={i} className="bg-brand-background/50 rounded-lg p-3 border border-white/5">
                    <p className="text-[11px] text-brand-muted font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-brand-light">{stat.value.toLocaleString()}</p>
                    {stat.limit && stat.limit !== Infinity && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-brand-muted mb-1">
                          <span>{stat.value} used</span>
                          <span>{stat.limit} limit</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-amber rounded-full transition-all"
                            style={{ width: `${Math.min(100, (stat.value / stat.limit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Plan Comparison */}
          <div>
            <h3 className="text-brand-light font-medium mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-amber" />
              Available Plans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map(plan => {
                const isCurrent = currentPlan?.key === plan.key;
                return (
                  <div
                    key={plan.key}
                    className={`rounded-xl p-6 border transition-all ${
                      isCurrent
                        ? "bg-brand-amber/10 border-brand-amber/30"
                        : "bg-brand-surface border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-brand-light font-semibold">{plan.name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-brand-amber/20 text-brand-amber px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold text-brand-light">{plan.price}</span>
                      <span className="text-xs text-brand-muted">{plan.period}</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f, i) => (
                        <li key={i} className="text-xs text-brand-muted flex items-start gap-2">
                          <span className="text-brand-amber mt-0.5">&#10003;</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <button disabled className="w-full py-2 rounded-md text-sm font-medium bg-white/5 text-brand-muted cursor-not-allowed">
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.key)}
                        className="w-full py-2 rounded-md text-sm font-medium bg-brand-amber text-brand-dark hover:bg-brand-amber/90 transition-colors flex items-center justify-center gap-1.5"
                      >
                        Upgrade <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stripe Status */}
          <div className="bg-brand-surface/30 border border-dashed border-white/10 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-brand-muted mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-brand-light mb-1">Payment Processing</h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {currentPlan?.stripe_customer_id
                    ? "Your billing is managed via Stripe. Click Upgrade to change your plan."
                    : "Stripe payment processing will be activated when the billing integration is configured by the administrator. Plan upgrades will redirect to a secure Stripe Checkout session."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEMBERS TAB */}
      {activeTab === "members" && (
        <div className="space-y-6">
          <div className="bg-brand-surface border border-white/5 rounded-xl overflow-hidden glass-panel">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-brand-light flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-amber/80" />
                  Workspace Members
                </h2>
                <p className="text-sm text-brand-muted mt-1">{members.length} member{members.length !== 1 ? "s" : ""} in this workspace.</p>
              </div>
              <button
                disabled
                title="Member invitations arriving in a future update"
                className="bg-brand-amber/20 text-brand-amber/60 px-3 py-1.5 rounded-md text-sm font-medium cursor-not-allowed flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                Invite (Coming Soon)
              </button>
            </div>
            <div className="divide-y divide-white/5">
              {members.length === 0 ? (
                <div className="p-8 text-center text-brand-muted text-sm">No members found in this workspace.</div>
              ) : (
                members.map((m, idx) => {
                  const isCurrentUser = userData.id === m.user_id;
                  return (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-brand-amber/15 text-brand-amber flex items-center justify-center font-bold text-sm">
                          {m.role?.[0]?.toUpperCase() || "M"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-light">
                            {isCurrentUser ? `${userData.full_name || userData.email} (You)` : `Member`}
                          </p>
                          <p className="text-xs text-brand-muted">
                            {isCurrentUser ? userData.email : `ID: ${m.user_id.slice(0, 8)}...`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs capitalize bg-white/5 text-brand-muted px-2.5 py-1 rounded-full font-medium">
                          {m.role}
                        </span>
                        {!isCurrentUser && m.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveMember(m.user_id)}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-brand-muted hover:text-red-400 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Member invitation notice */}
          <div className="bg-brand-surface/30 border border-dashed border-white/10 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-brand-muted mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-brand-light mb-1">Team Invitations</h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Email-based team invitations will be available in a future update. Currently, workspace membership is managed during signup.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
