"use server";

import { getWorkspaceContext } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export async function generateAiCopy(mode, promptDetails, contactId = null, tone = null) {
  const { supabase, workspaceId, userId } = await getWorkspaceContext();

  // 1. Gather Contact Context
  let contactContext = "";
  if (contactId) {
    const { data: contact } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .single();
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
  let modelUsed = "grok-beta";
  
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey || apiKey === "your-xai-grok-api-key") {
    // Honest stub when API key is not configured
    await new Promise(r => setTimeout(r, 1200));
    outputText = `[AI Simulation — xAI key not configured]\n\nHi there,\n\nBased on your instructions regarding "${mode}", here is a sample draft. Configure your XAI_API_KEY environment variable to enable real Grok-powered generation.\n\nBest,\nMotus AI`;
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
      const status = response.status;
      if (status === 402 || status === 429) {
        throw new Error("AI generation unavailable: API credits exhausted or rate limit reached. Please check your xAI account.");
      }
      throw new Error(`AI service error (${status}). Please try again later.`);
    }

    const data = await response.json();
    outputText = data.choices?.[0]?.message?.content;
    if (!outputText) throw new Error("AI returned an empty response. Please try again.");
    modelUsed = data.model || modelUsed;
  }

  // 4. Track usage event (non-blocking — failure here shouldn't crash generation)
  try {
    await supabase.from("usage_events").insert({
      workspace_id: workspaceId,
      user_id: userId,
      event_type: "ai_generation",
      units: 1,
      metadata_json: { mode, tone, model: modelUsed }
    });
  } catch {
    // Non-critical — ignore usage tracking failure
  }

  return { output: outputText, mode, prompt_summary: promptDetails, contact_id: contactId, workspaceId, userId };
}

export async function saveAiGeneration(payload) {
  const { supabase } = await getWorkspaceContext();
  
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
  const { supabase, workspaceId } = await getWorkspaceContext();

  const { data, error } = await supabase
    .from("ai_generations")
    .select("*, contacts(full_name, email, company)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(10);
    
  if (error) throw new Error(error.message);
  return data || [];
}
