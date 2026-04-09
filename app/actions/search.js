"use server";

import { getWorkspaceContext } from "@/lib/workspace";

export async function getGlobalSearch(query) {
  if (!query || query.trim().length === 0) return [];

  const { supabase, workspaceId } = await getWorkspaceContext();
  const sq = `%${query}%`;

  // Search Contacts
  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, first_name, last_name, email, company, full_name")
    .eq("workspace_id", workspaceId)
    .or(`first_name.ilike.${sq},last_name.ilike.${sq},email.ilike.${sq},company.ilike.${sq}`)
    .limit(5);

  // Search Sequences
  const { data: sequences } = await supabase
    .from("sequences")
    .select("id, name, status")
    .eq("workspace_id", workspaceId)
    .ilike("name", sq)
    .limit(5);

  // Search Inbox Threads
  const { data: threads } = await supabase
    .from("inbox_threads")
    .select("id, subject, state")
    .eq("workspace_id", workspaceId)
    .ilike("subject", sq)
    .limit(5);

  const results = [];

  if (contacts && contacts.length > 0) {
    contacts.forEach(c => results.push({
      type: "contact",
      id: c.id,
      title: c.full_name || c.email || "Unknown Contact",
      subtitle: c.company || "No Company",
      url: `/contacts`
    }));
  }

  if (sequences && sequences.length > 0) {
    sequences.forEach(s => results.push({
      type: "sequence",
      id: s.id,
      title: s.name,
      subtitle: `Status: ${s.status}`,
      url: `/sequences/${s.id}`
    }));
  }

  if (threads && threads.length > 0) {
    threads.forEach(t => results.push({
      type: "inbox_thread",
      id: t.id,
      title: t.subject,
      subtitle: `State: ${t.state}`,
      url: `/inbox/${t.id}`
    }));
  }

  return results;
}
