"use server";

import { getWorkspaceContext } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export async function getThreads(search = "", stateFilter = "all") {
  const { supabase, workspaceId } = await getWorkspaceContext();

  let query = supabase
    .from("inbox_threads")
    .select(`
      *,
      contacts (id, first_name, last_name, full_name, email, company)
    `)
    .eq("workspace_id", workspaceId)
    .order("last_message_at", { ascending: false });

  if (stateFilter && stateFilter !== "all" && stateFilter !== "") {
    query = query.eq("state", stateFilter);
  }

  if (search) {
    query = query.ilike("subject", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  
  return data || [];
}

export async function getThreadById(id) {
  const { supabase, workspaceId } = await getWorkspaceContext();

  const { data, error } = await supabase
    .from("inbox_threads")
    .select(`
      *,
      contacts (id, first_name, last_name, full_name, email, company, title, location),
      inbox_messages (*)
    `)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .single();

  if (error) throw new Error("Thread not found or restricted.");
  
  if (data?.inbox_messages) {
    data.inbox_messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  return data;
}

export async function updateThreadState(id, state) {
  const { supabase, workspaceId } = await getWorkspaceContext();

  const { error } = await supabase
    .from("inbox_threads")
    .update({ state, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) throw new Error(error.message);
  
  revalidatePath(`/inbox/${id}`);
  revalidatePath("/inbox");
}

export async function saveDraftMessage(threadId, body, isAiGenerated = false) {
  const { supabase, workspaceId, userId } = await getWorkspaceContext();

  // Validate ownership
  const { data: thread } = await supabase
    .from("inbox_threads")
    .select("id")
    .eq("id", threadId)
    .eq("workspace_id", workspaceId)
    .single();

  if (!thread) throw new Error("Thread not found or restricted.");

  // Get user details for sender generic info
  const { data: { user } } = await supabase.auth.getUser();

  const newMessage = {
    thread_id: threadId,
    workspace_id: workspaceId,
    sender_type: "user",
    sender_name: "You",
    sender_email: user?.email || "",
    body,
    is_ai_generated: isAiGenerated
  };

  const { error } = await supabase.from("inbox_messages").insert(newMessage);
  if (error) throw new Error(`Failed to save draft: ${error.message}`);

  // Update thread last_message_at
  await supabase.from("inbox_threads")
    .update({ 
      last_message_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", threadId);

  revalidatePath(`/inbox/${threadId}`);
  revalidatePath("/inbox");
}

export async function generateAiReply(threadId, customInstruction = "") {
  const { supabase, workspaceId, userId } = await getWorkspaceContext();

  // 1. Context Gathering
  const thread = await getThreadById(threadId); // Reusing existing loader
  if (!thread) throw new Error("Thread context unavailable for AI.");

  const contactContext = thread.contacts ? `
    CONTACT PROSPECT:
    Name: ${thread.contacts.full_name || "Unknown"}
    Company: ${thread.contacts.company || "Unknown"}
    Title: ${thread.contacts.title || "Unknown"}
  ` : "";

  const messagesContext = thread.inbox_messages.map(m => 
    `${m.sender_type.toUpperCase()} (${m.sender_name}): ${m.body}`
  ).join("\n\n");

  const systemPrompt = "You are Motus AI, a premium B2B SaaS outbound assistant. Generate a concise, human-sounding reply to the prospect based on the conversation history. Never use corny buzzwords or excessive padding.";
  const finalPrompt = `
    ${contactContext}

    CONVERSATION HISTORY:
    ${messagesContext}

    Provide the draft reply directly. Do NOT include greetings if they are already established in the flow, just keep it natural. 
    Additional Instructions from User: ${customInstruction || "Just handle the objection or push for a call gracefully."}
  `;

  // 2. Call xAI securely
  let outputText = "";
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey || apiKey === "your-xai-grok-api-key") {
    // Graceful fallback for demo
    await new Promise(r => setTimeout(r, 1200));
    outputText = `[AI Simulation — xAI key not active]\n\nHi ${thread.contacts?.first_name || 'there'},\n\nThanks for getting back to us. I'd be happy to show you how Motus can streamline your outbound. Let me know what time works best.\n\nBest,\nMotus`;
  } else {
    try {
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
          throw new Error("AI generation unavailable: API credits exhausted or rate limit reached.");
        }
        throw new Error(`AI service error (${status}). Please try again later.`);
      }

      const data = await response.json();
      outputText = data.choices?.[0]?.message?.content;
      if (!outputText) throw new Error("AI returned an empty response.");
    } catch (e) {
      throw new Error(e.message || "Failed to reach AI provider.");
    }
  }

  // 3. Track Usage (non-blocking)
  try {
    await supabase.from("usage_events").insert({
      workspace_id: workspaceId,
      user_id: userId,
      event_type: "ai_reply_draft",
      metadata_json: { thread_id: threadId }
    });
  } catch {} // ignore usage errors

  return { draftedReply: outputText };
}

// Dev/Test helper since real syncing is Phase 6
export async function seedSampleInbox() {
  const { supabase, workspaceId, userId } = await getWorkspaceContext();
  
  // Create a dummy contact if none exist
  let contactId = null;
  const { data: contacts } = await supabase.from("contacts").select("id").eq("workspace_id", workspaceId).limit(1);
  if (contacts && contacts.length > 0) {
    contactId = contacts[0].id;
  } else {
    const { data: newContact } = await supabase.from("contacts").insert({
      workspace_id: workspaceId,
      first_name: "Sarah",
      last_name: "Connor",
      full_name: "Sarah Connor",
      email: "sarah@techcorp.io",
      company: "TechCorp"
    }).select().single();
    if (newContact) contactId = newContact.id;
  }

  // Create a thread
  const { data: thread } = await supabase.from("inbox_threads").insert({
    workspace_id: workspaceId,
    contact_id: contactId,
    subject: "Re: Motus outbound pilot",
    state: "open",
    sentiment: "positive",
    last_message_at: new Date(Date.now() - 3600000).toISOString()
  }).select().single();

  if (thread) {
    // Add messages
    await supabase.from("inbox_messages").insert([
      {
        thread_id: thread.id,
        workspace_id: workspaceId,
        sender_type: "user",
        sender_name: "You",
        sender_email: "you@yourcompany.com",
        body: "Hi Sarah, wanted to follow up on our previous discussion regarding outbound efficiency.",
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        thread_id: thread.id,
        workspace_id: workspaceId,
        sender_type: "contact",
        sender_name: "Sarah Connor",
        sender_email: "sarah@techcorp.io",
        body: "Hi there. Yes, I'm interested. Can we do a pilot next week?",
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ]);
  }
  
  revalidatePath("/inbox");
}
