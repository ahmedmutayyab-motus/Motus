"use server";

import { getWorkspaceContext } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export async function getContacts(search = "", stageFilter = "all") {
  const { supabase, workspaceId } = await getWorkspaceContext();

  let query = supabase
    .from("contacts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
  }
  
  if (stageFilter && stageFilter !== "all" && stageFilter !== "") {
    query = query.eq("stage", stageFilter);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  
  return data || [];
}

export async function addContact(formData) {
  const { supabase, workspaceId } = await getWorkspaceContext();

  const newContact = {
    workspace_id: workspaceId,
    first_name: formData.first_name || null,
    last_name: formData.last_name || null,
    full_name: `${formData.first_name || ""} ${formData.last_name || ""}`.trim() || null,
    email: formData.email || null,
    phone: formData.phone || null,
    company: formData.company || null,
    title: formData.title || null,
    website: formData.website || null,
    linkedin_url: formData.linkedin_url || null,
    industry: formData.industry || null,
    location: formData.location || null,
    stage: formData.stage || "Cold",
    notes_summary: formData.notes_summary || null,
    source: "Manual",
  };

  const { data, error } = await supabase.from("contacts").insert(newContact).select().single();
  if (error) {
    if (error.code === "23505") throw new Error("A contact with this email already exists in your workspace.");
    throw new Error(error.message);
  }

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  return data;
}

export async function updateContact(id, formData) {
  const { supabase, workspaceId } = await getWorkspaceContext();

  const updates = {
    ...formData,
    full_name: `${formData.first_name || ""} ${formData.last_name || ""}`.trim() || null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("contacts")
    .update(updates)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/contacts");
  return data;
}

export async function deleteContact(id) {
  const { supabase, workspaceId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) throw new Error(error.message);

  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function importContactsBatch(contactsArray) {
  const { supabase, workspaceId } = await getWorkspaceContext();

  // Normalize and bind workspace id
  const payload = contactsArray.map(c => ({
    workspace_id: workspaceId,
    first_name: c.first_name || null,
    last_name: c.last_name || null,
    full_name: c.full_name || `${c.first_name || ""} ${c.last_name || ""}`.trim() || null,
    email: c.email || null,
    phone: c.phone || null,
    company: c.company || null,
    title: c.title || null,
    website: c.website || null,
    linkedin_url: c.linkedin_url || c.linkedin || null,
    industry: c.industry || null,
    location: c.location || null,
    notes_summary: c.notes || null,
    source: "CSV Import",
    stage: "Cold"
  }));

  // Fetch existing emails to deduplicate
  const { data: existing } = await supabase
    .from("contacts")
    .select("email, full_name, company")
    .eq("workspace_id", workspaceId);
  
  const existingEmails = new Set((existing || []).filter(e => e.email).map(e => e.email.toLowerCase()));
  const existingNames = new Set((existing || []).filter(e => e.full_name && e.company).map(e => `${e.full_name.toLowerCase()}|${e.company.toLowerCase()}`));

  const validPayload = [];
  let duplicates = 0;

  for (const row of payload) {
    let isDuplicate = false;
    if (row.email && existingEmails.has(row.email.toLowerCase())) {
      isDuplicate = true;
    } else if (row.full_name && row.company && existingNames.has(`${row.full_name.toLowerCase()}|${row.company.toLowerCase()}`)) {
      isDuplicate = true;
    }

    if (isDuplicate) {
      duplicates++;
    } else {
      validPayload.push(row);
      if (row.email) existingEmails.add(row.email.toLowerCase());
      if (row.full_name && row.company) existingNames.add(`${row.full_name.toLowerCase()}|${row.company.toLowerCase()}`);
    }
  }

  if (validPayload.length > 0) {
    const { error } = await supabase.from("contacts").insert(validPayload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/contacts");
  revalidatePath("/dashboard");

  return { 
    totalRows: contactsArray.length, 
    validRows: validPayload.length + duplicates, 
    duplicates,
    skipped: duplicates,
    imported: validPayload.length 
  };
}
