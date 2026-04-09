"use server";

import { getWorkspaceContext } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export async function getWorkspaceProfile() {
  const { supabase, workspaceId } = await getWorkspaceContext();

  const { data, error } = await supabase
    .from("workspaces")
    .select("name, created_at")
    .eq("id", workspaceId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateWorkspaceProfile(name) {
  const { supabase, workspaceId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("workspaces")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", workspaceId);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  revalidatePath("/dashboard"); 
  return { success: true };
}

export async function getWorkspaceMembers() {
  const { supabase, workspaceId } = await getWorkspaceContext();

  // Due to Supabase auth boundaries on the client standard API, 
  // we just fetch membership records. We don't have full names unless stored in a dedicated users table, 
  // so we'll just return user_ids and roles to show a functional count/list.
  const { data, error } = await supabase
    .from("workspace_members")
    .select("user_id, role, created_at")
    .eq("workspace_id", workspaceId);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getUserProfile() {
  const { supabase } = await getWorkspaceContext();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) throw new Error("Could not retrieve user.");

  return {
    email: user.email,
    id: user.id,
    full_name: user.user_metadata?.full_name || "",
  };
}

export async function updateUserProfile(options) {
  const { supabase } = await getWorkspaceContext();
  const { full_name } = options;

  const { error } = await supabase.auth.updateUser({
    data: { full_name }
  });

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { success: true };
}
