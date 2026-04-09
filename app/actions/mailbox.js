"use server";

import { getWorkspaceContext } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

const PROVIDER_LABELS = {
  gmail: "Gmail",
  outlook: "Outlook",
  imap: "IMAP",
  smtp: "SMTP",
  other: "Other"
};

export async function getMailboxConnections() {
  const { supabase, workspaceId } = await getWorkspaceContext();

  const { data, error } = await supabase
    .from("mailbox_connections")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(c => ({
    ...c,
    provider_label: PROVIDER_LABELS[c.provider_type] || c.provider_type
  }));
}

export async function addMailboxConnection({ provider_type, label, from_email }) {
  const { supabase, workspaceId } = await getWorkspaceContext();

  if (!from_email || !label) throw new Error("Email and label are required.");

  const validProviders = ["gmail", "outlook", "imap", "smtp", "other"];
  if (!validProviders.includes(provider_type)) {
    throw new Error("Invalid provider type.");
  }

  // For Gmail/Outlook, real OAuth is not wired yet —
  // connection is created as 'pending' to reflect honest state.
  const initialStatus = (provider_type === "gmail" || provider_type === "outlook")
    ? "pending"
    : "disconnected";

  const { data, error } = await supabase
    .from("mailbox_connections")
    .insert({
      workspace_id: workspaceId,
      provider_type,
      label,
      from_email,
      status: initialStatus,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("A mailbox with this email already exists.");
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  return {
    ...data,
    provider_label: PROVIDER_LABELS[provider_type] || provider_type
  };
}

export async function removeMailboxConnection(connectionId) {
  const { supabase, workspaceId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("mailbox_connections")
    .delete()
    .eq("id", connectionId)
    .eq("workspace_id", workspaceId);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { success: true };
}

export async function getMailboxSyncStatus() {
  const { supabase, workspaceId } = await getWorkspaceContext();

  const { data: connections } = await supabase
    .from("mailbox_connections")
    .select("id, label, from_email, provider_type, status, last_sync_at, last_sync_status")
    .eq("workspace_id", workspaceId);

  const connected = (connections || []).filter(c => c.status === "connected").length;
  const total = (connections || []).length;

  return {
    totalConnections: total,
    connectedCount: connected,
    pendingCount: (connections || []).filter(c => c.status === "pending").length,
    syncReady: connected > 0,
    connections: connections || [],
  };
}

export async function getOutboundStats() {
  const { supabase, workspaceId } = await getWorkspaceContext();

  const [drafts, queued, sent] = await Promise.all([
    supabase.from("outbound_messages").select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId).eq("status", "draft"),
    supabase.from("outbound_messages").select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId).eq("status", "queued"),
    supabase.from("outbound_messages").select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId).eq("status", "sent"),
  ]);

  return {
    drafts: drafts.count || 0,
    queued: queued.count || 0,
    sent: sent.count || 0,
  };
}
