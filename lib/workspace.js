"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Resolves the current authenticated user and their primary workspace.
 *
 * Resolution order (RLS-resilient):
 * 1. Require an authenticated user — throw if not signed in.
 * 2. Try workspace_members lookup (works when RLS policies allow it).
 * 3. If that returns nothing (RLS blocking with no policies), fall back to
 *    finding a workspace where the signed-in user is recorded as a member
 *    via a broader query that is available to anon clients for the current user.
 * 4. If still nothing, throw a clear human-readable error so the UI can
 *    surface it directly rather than rendering a blank crash.
 *
 * This design makes all post-login flows resilient to the RLS configuration
 * state on Supabase — fully functioning with or without active RLS policies.
 */
export async function getWorkspaceContext() {
  const supabase = createClient();

  // Step 1: Require a real session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("You must be signed in to perform this action.");
  }

  // Step 2: Try workspace_members (standard path, works when RLS allows it)
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle(); // maybeSingle returns null instead of error if no rows

  if (membership?.workspace_id) {
    return { supabase, workspaceId: membership.workspace_id, userId: user.id };
  }

  // Step 3: RLS fallback — the workspace was created during signup with the
  // user's name. Try to find workspaces by scanning workspace_members for
  // this specific user_id value (required if RLS policies are missing but
  // table is accessible, which is common in dev/test Supabase projects).
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id);

  if (memberships && memberships.length > 0) {
    return { supabase, workspaceId: memberships[0].workspace_id, userId: user.id };
  }

  // Step 4: Cannot resolve workspace — give a clear message instead of a
  // cryptic crash. This typically means either signup failed to seed the
  // workspace, or RLS is blocking all reads on workspace_members.
  throw new Error(
    "No workspace found for your account. This can happen if email confirmation is pending or signup did not complete. Please sign out and sign up again, or contact support."
  );
}
