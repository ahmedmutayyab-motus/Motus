"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Minimal fallback session resolution
async function ensureWorkspaceAndUser(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "00000000-0000-0000-0000-000000000000";

  const { data: workspaces } = await supabase.from("workspaces").select("id").limit(1);
  let workspaceId = workspaces?.[0]?.id;
  if (!workspaceId) {
    const { data: newWs } = await supabase.from("workspaces").insert({ name: "My Workspace" }).select("id").single();
    workspaceId = newWs?.id;
  }
  return { workspaceId, userId };
}

export async function getSequences() {
  const supabase = createClient();
  const { workspaceId } = await ensureWorkspaceAndUser(supabase);

  const { data, error } = await supabase
    .from("sequences")
    .select(`
      *,
      sequence_enrollments (count)
    `)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getSequenceById(id) {
  const supabase = createClient();
  const { workspaceId } = await ensureWorkspaceAndUser(supabase);

  const { data, error } = await supabase
    .from("sequences")
    .select(`
      *,
      sequence_steps (*),
      sequence_enrollments (
        id, status, current_step, enrolled_at,
        contacts (id, first_name, last_name, email, company)
      )
    `)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .single();

  if (error) throw new Error("Sequence not found or restricted.");
  
  // Sort steps
  if (data?.sequence_steps) {
    data.sequence_steps.sort((a, b) => a.step_order - b.step_order);
  }

  return data;
}

export async function createSequence(name, description) {
  const supabase = createClient();
  const { workspaceId, userId } = await ensureWorkspaceAndUser(supabase);

  const { data, error } = await supabase.from("sequences").insert({
    workspace_id: workspaceId,
    created_by: userId,
    name,
    description,
    status: 'draft'
  }).select().single();

  if (error) throw new Error(error.message);
  revalidatePath("/sequences");
  return data;
}

export async function updateSequenceStatus(id, status) {
  const supabase = createClient();
  const { workspaceId } = await ensureWorkspaceAndUser(supabase);

  const { error } = await supabase.from("sequences")
    .update({ status, updated_at: new Date() })
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) throw new Error(error.message);
  revalidatePath(`/sequences/${id}`);
  revalidatePath("/sequences");
}

export async function updateSequenceMetadata(id, name, description) {
  const supabase = createClient();
  const { workspaceId } = await ensureWorkspaceAndUser(supabase);

  const { error } = await supabase.from("sequences")
    .update({ name, description, updated_at: new Date() })
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) throw new Error(error.message);
  revalidatePath(`/sequences/${id}`);
}

export async function saveSequenceSteps(sequenceId, steps) {
  const supabase = createClient();
  const { workspaceId } = await ensureWorkspaceAndUser(supabase);

  // Validate ownership first
  const { data: seq } = await supabase.from("sequences").select("id").eq("id", sequenceId).eq("workspace_id", workspaceId).single();
  if (!seq) throw new Error("Sequence not found or restricted.");

  // Delete old steps replacing entirely payload for simplicity (good for structural drafts)
  await supabase.from("sequence_steps").delete().eq("sequence_id", sequenceId);

  if (steps && steps.length > 0) {
    const freshSteps = steps.map((s, idx) => ({
      sequence_id: sequenceId,
      step_order: idx + 1,
      step_type: s.step_type,
      delay_days: s.delay_days || 1,
      subject_template: s.subject_template || null,
      body_template: s.body_template || null,
      task_title: s.task_title || null
    }));

    const { error } = await supabase.from("sequence_steps").insert(freshSteps);
    if (error) throw new Error(`Failed to save steps: ${error.message}`);
  }

  revalidatePath(`/sequences/${sequenceId}`);
}

export async function enrollContacts(sequenceId, contactIds) {
  const supabase = createClient();
  const { workspaceId } = await ensureWorkspaceAndUser(supabase);

  // Filter existing enrollments natively avoiding unique constraint crashes
  const { data: existing } = await supabase.from("sequence_enrollments")
    .select("contact_id")
    .eq("sequence_id", sequenceId)
    .in("contact_id", contactIds);
    
  const existingSet = new Set((existing || []).map(e => e.contact_id));
  const newEnrollments = contactIds.filter(id => !existingSet.has(id));

  if (newEnrollments.length > 0) {
    const payload = newEnrollments.map(id => ({
      workspace_id: workspaceId,
      sequence_id: sequenceId,
      contact_id: id,
      status: "active",
      current_step: 1
    }));
    
    const { error } = await supabase.from("sequence_enrollments").insert(payload);
    if (error) throw new Error(`Failed to enroll contacts: ${error.message}`);
  }

  revalidatePath(`/sequences/${sequenceId}`);
  return { requested: contactIds.length, enrolled: newEnrollments.length, skipped: existingSet.size };
}
