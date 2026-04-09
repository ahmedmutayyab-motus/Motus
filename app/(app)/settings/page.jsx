"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Building, User, Mail, Save, Users } from "lucide-react";
import { getWorkspaceProfile, updateWorkspaceProfile, getUserProfile, updateUserProfile, getWorkspaceMembers } from "@/app/actions/settings";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  
  const [userData, setUserData] = useState({ id: "", email: "", full_name: "" });
  const [workspaceData, setWorkspaceData] = useState({ name: "", created_at: "" });
  const [members, setMembers] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [usr, ws, mems] = await Promise.all([
          getUserProfile(),
          getWorkspaceProfile(),
          getWorkspaceMembers()
        ]);
        setUserData(usr);
        setWorkspaceData(ws);
        setMembers(mems);
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-amber"></div>
        <p className="text-brand-muted/70 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-8 px-8 pb-12 overflow-y-auto w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-brand-light flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-brand-amber" />
          Settings
        </h1>
        <p className="text-brand-muted mt-2 text-sm">
          Manage your workspace and personal profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Workspace Settings */}
        <div className="md:col-span-7 space-y-8">
          
          <div className="bg-brand-surface border border-white/5 rounded-xl overflow-hidden glass-panel">
            <div className="p-6 border-b border-white/5 space-y-1">
              <h2 className="text-lg font-medium text-brand-light flex items-center gap-2">
                <Building className="h-5 w-5 text-brand-amber/80" />
                Workspace Profile
              </h2>
              <p className="text-sm text-brand-muted">Update your workspace details and branding.</p>
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

        {/* Sidebar Info */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-brand-surface/50 border border-white/5 rounded-xl p-6 glass-panel relative overflow-hidden">
            <h3 className="text-brand-light font-medium flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-brand-amber" />
              Workspace Members
            </h3>
            <div className="space-y-3">
              {members.length === 0 ? (
                <p className="text-sm text-brand-muted">No members found.</p>
              ) : (
                members.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-brand-amber/20 text-brand-amber flex items-center justify-center font-bold text-xs">
                        {m.role?.[0]?.toUpperCase() || "M"}
                      </div>
                      <span className="text-brand-light font-medium tracking-wide">
                        {userData.id === m.user_id ? "You (Admin)" : "Member"}
                      </span>
                    </div>
                    <span className="text-brand-muted text-xs capitalize bg-white/5 px-2 py-0.5 rounded-full">
                      {m.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-brand-surface/30 border border-dashed border-white/10 rounded-xl p-6 relative overflow-hidden">
            <h3 className="text-brand-light/90 font-medium text-sm mb-2">Billing & Subscription</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Plan and payment management will be available in Phase 7. You are currently on an evaluation tier.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
