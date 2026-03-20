"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Resolves current authenticated user's workspace. Throws if unauthenticated.
async function getWorkspaceContext(supabase) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Not authenticated.");

  const { data: membership, error: wsError } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (wsError || !membership) throw new Error("No workspace found for this user.");
  return { workspaceId: membership.workspace_id, userId: user.id };
}

export async function generateAiCopy(mode, promptDetails, contactId = null, tone = null) {
  const supabase = createClient();
  const { workspaceId, userId } = await getWorkspaceContext(supabase);

  // 1. Gather Contact Context
  let contactContext = "";
  if (contactId) {
    const { data: contact } = await supabase.from("contacts").select("*").eq("id", contactId).single();
    if (contact) {
      contactContext = `
      CONTEXT ABOUT RECIPIENT:
      Name: ${contact.full_name || contact.first_name || "Unknown"}
      Company: ${contact.company || "Unknown"}
      Title: ${contact.title || "Unknown"}
      Industry: ${contact.industry || "Unknown"}
      Notes: ${contact.notes_summary || "None"}
      `;
    }
  }

  // 2. Build Prompt based on Mode
  const toneInstruction = mode === "tone_rewrite" && tone ? `TONE REQUIREMENT: ${tone}` : "";
  const systemPrompt = "You are Motus AI, a premium B2B SaaS outbound assistant. You write concise, high-converting, human-sounding outreach copy. Never use corny buzzwords. Provide ONLY the finalized text without conversational padding.";
  const finalPrompt = `
  TASK MODE: ${mode}
  ${toneInstruction}
  ${contactContext}
  USER INSTRUCTIONS: ${promptDetails}
  
  Please generate the requested copy.
  `;

  // 3. Call xAI server-side safely
  let outputText = "";
  let modelUsed = "grok-beta"; // generic fallback name
  
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey || apiKey === "your-xai-grok-api-key") {
    // Phase 3 Stub if real key isn't provided locally
    await new Promise(r => setTimeout(r, 1500)); // Simulate latency
    outputText = `[Grok Simulation]\nHi there,\n\nI noticed your work and wanted to reach out regarding the ${mode} request you made. Given your instructions: "${promptDetails}", I believe we could align nicely.\n\nBest,\nMotus AI`;
  } else {
    // Real Grok execution
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: finalPrompt }
        ],
        model: "grok-beta",
        temperature: 0.7
      })
    });

    if (!response.ok) {
      // Prevent leaking raw provider error stack traces to the client
      throw new Error(`The AI service is currently responding with an error. Please try again later.`);
    }

    const data = await response.json();
    outputText = data.choices[0].message.content;
    modelUsed = data.model || modelUsed;
  }

  // 4. Record Usage Event (Only on success)
  await supabase.from("usage_events").insert({
    workspace_id: workspaceId,
    user_id: userId,
    event_type: "ai_generation",
    units: 1,
    metadata_json: { mode, tone, model: modelUsed }
  });

  return { output: outputText, mode, prompt_summary: promptDetails, contact_id: contactId, workspaceId, userId };
}

export async function saveAiGeneration(payload) {
  const supabase = createClient();
  
  const { data, error } = await supabase.from("ai_generations").insert({
    workspace_id: payload.workspaceId,
    user_id: payload.userId,
    contact_id: payload.contact_id || null,
    generation_type: payload.mode,
    prompt_summary: payload.prompt_summary,
    output_text: payload.output,
    model_name: "grok-beta"
  }).select().single();

  if (error) throw new Error(error.message);
  revalidatePath("/ai-writer");
  return data;
}

export async function getRecentGenerations() {
  const supabase = createClient();
  const { workspaceId } = await getWorkspaceContext(supabase);

  const { data, error } = await supabase
    .from("ai_generations")
    .select("*, contacts(full_name, email, company)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(10);
    
  if (error) throw new Error(error.message);
  return data || [];
}
