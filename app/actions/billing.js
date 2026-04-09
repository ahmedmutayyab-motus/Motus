"use server";

import { getWorkspaceContext } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

const PLANS = {
  free: {
    key: "free",
    name: "Starter",
    price: "$0",
    period: "forever",
    features: [
      "Up to 100 contacts",
      "3 sequences",
      "Basic inbox",
      "Community support"
    ],
    contactLimit: 100,
    sequenceLimit: 3
  },
  pro: {
    key: "pro",
    name: "Professional",
    price: "$49",
    period: "/month",
    features: [
      "Unlimited contacts",
      "Unlimited sequences",
      "Full inbox workspace",
      "AI Writer access",
      "Priority support"
    ],
    contactLimit: Infinity,
    sequenceLimit: Infinity
  },
  team: {
    key: "team",
    name: "Team",
    price: "$99",
    period: "/month",
    features: [
      "Everything in Professional",
      "Team workspace collaboration",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom integrations"
    ],
    contactLimit: Infinity,
    sequenceLimit: Infinity
  }
};

export async function getPlans() {
  return Object.values(PLANS);
}

export async function getCurrentPlan() {
  const { supabase, workspaceId } = await getWorkspaceContext();

  // Try subscriptions table first
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .single();

  if (sub) {
    return {
      ...PLANS[sub.plan_key] || PLANS.free,
      billing_status: sub.billing_status,
      current_period_end: sub.current_period_end,
      stripe_customer_id: sub.stripe_customer_id ? true : false,
      stripe_subscription_id: sub.stripe_subscription_id ? true : false,
    };
  }

  // Default to free
  return {
    ...PLANS.free,
    billing_status: "active",
    current_period_end: null,
    stripe_customer_id: false,
    stripe_subscription_id: false,
  };
}

export async function getUsageStats() {
  const { supabase, workspaceId } = await getWorkspaceContext();

  const [contactsRes, sequencesRes, threadsRes, aiRes] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("sequences").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("inbox_threads").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("ai_generations").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
  ]);

  return {
    contacts: contactsRes.count || 0,
    sequences: sequencesRes.count || 0,
    threads: threadsRes.count || 0,
    aiGenerations: aiRes.count || 0,
  };
}

export async function createCheckoutSession(planKey) {
  // Stripe integration scaffold
  // When STRIPE_SECRET_KEY is configured, this will create a real checkout session.
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return {
      success: false,
      message: "Stripe is not configured yet. To enable billing, add STRIPE_SECRET_KEY and STRIPE_PRICE_PRO / STRIPE_PRICE_TEAM to your environment variables.",
      requiresSetup: true,
    };
  }

  // Real Stripe flow would go here:
  // const stripe = require('stripe')(stripeKey);
  // const { supabase, workspaceId, userId } = await getWorkspaceContext();
  // const session = await stripe.checkout.sessions.create({ ... });
  // return { success: true, url: session.url };

  return {
    success: false,
    message: "Stripe checkout is being configured. Please try again shortly.",
    requiresSetup: true,
  };
}

export async function removeMember(memberId) {
  const { supabase, workspaceId, userId } = await getWorkspaceContext();

  // Prevent self-removal
  const { data: member } = await supabase
    .from("workspace_members")
    .select("user_id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", memberId)
    .single();

  if (!member) throw new Error("Member not found.");
  if (member.user_id === userId) throw new Error("You cannot remove yourself.");
  if (member.role === 'owner') throw new Error("Cannot remove workspace owner.");

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", memberId);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { success: true };
}
