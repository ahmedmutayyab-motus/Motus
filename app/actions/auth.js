"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Sign In with Email and Password
 */
export async function signIn(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return redirect("/dashboard");
}

/**
 * Sign Up with Email and Password
 * Includes Workspace creation and member association
 */
export async function signUp(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  
  const supabase = createClient();

  // 1. Sign Up the User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
      },
    },
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("User creation failed.");

  // If email confirmation is required, Supabase returns a user BUT no session.
  // In that case we cannot create the workspace yet (no authed context).
  // Redirect to a holding page instead of crashing.
  if (!authData.session) {
    return redirect("/check-email");
  }

  // 2. Create Default Workspace
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .insert([
      { name: `${firstName || email.split("@")[0]}'s Workspace` }
    ])
    .select()
    .single();

  if (wsError) throw new Error("Workspace initialization failed: " + wsError.message);

  // 3. Associate User with Workspace as Admin/Member
  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert([
      {
        workspace_id: workspace.id,
        user_id: authData.user.id,
        role: "admin"
      }
    ]);

  if (memberError) throw new Error("Workspace membership failed: " + memberError.message);

  return redirect("/dashboard");
}

/**
 * Sign Out
 */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}

/**
 * Reset Password Request
 */
export async function resetPassword(email) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/settings/password`,
  });

  if (error) throw new Error(error.message);
  return { success: true };
}
