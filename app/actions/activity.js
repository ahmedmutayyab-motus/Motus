"use server";

import { getWorkspaceContext } from "@/lib/workspace";

export async function getActivityFeed() {
  const { supabase, workspaceId } = await getWorkspaceContext();

  // Due to absence of an explicit broad activity aggregation table that stores timeline JSON natively,
  // we will manually query the most highly relevant "recent" actions (contacts added, sequences built)
  // to power a clean real-time-like notifications feed for MVP.

  const { data: recentContacts } = await supabase
    .from("contacts")
    .select("id, full_name, email, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentSequences } = await supabase
    .from("sequences")
    .select("id, name, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: recentThreads } = await supabase
    .from("inbox_threads")
    .select("id, subject, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(3);

  const feed = [];

  (recentContacts || []).forEach(c => {
    feed.push({
      id: `contact-${c.id}`,
      type: 'contact',
      title: "New Contact Added",
      description: `${c.full_name || c.email} was added to the CRM.`,
      timestamp: c.created_at,
      iconType: 'user'
    });
  });

  (recentSequences || []).forEach(s => {
    feed.push({
      id: `seq-${s.id}`,
      type: 'sequence',
      title: "Sequence Created",
      description: `Sequence "${s.name}" was initialized.`,
      timestamp: s.created_at,
      iconType: 'layers'
    });
  });

  (recentThreads || []).forEach(t => {
    feed.push({
      id: `inbox-${t.id}`,
      type: 'inbox',
      title: "New Thread Started",
      description: `Thread: ${t.subject}`,
      timestamp: t.created_at,
      iconType: 'mail'
    });
  });

  feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return feed.slice(0, 7);
}
