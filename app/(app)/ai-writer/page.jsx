"use client";

import { useState, useEffect } from "react";
import { BookOpenCheck, Loader2, Sparkles, Copy, Save, Clock } from "lucide-react";
import { toast } from "sonner";
import { getContacts } from "@/app/actions/contacts";
import { generateAiCopy, saveAiGeneration, getRecentGenerations } from "@/app/actions/ai";

const MODES = [
  { id: "cold_email", label: "Cold Email" },
  { id: "follow_up", label: "Follow-Up" },
  { id: "linkedin_opener", label: "LinkedIn Opener" },
  { id: "reply_suggestion", label: "Reply Suggestion" },
  { id: "objection_handler", label: "Objection Handler" },
  { id: "icp_fit_score", label: "ICP Fit Score" },
  { id: "tone_rewrite", label: "Tone Rewrite" },
  { id: "subject_line", label: "Subject Line" }
];

const TONES = ["concise", "direct", "consultative", "confident"];

export default function AIWriterPage() {
  const [contacts, setContacts] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  
  const [mode, setMode] = useState(MODES[0].id);
  const [tone, setTone] = useState(TONES[0]);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [promptDetails, setPromptDetails] = useState("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [contactsData, historyData] = await Promise.all([
          getContacts("", "all"),
          getRecentGenerations()
        ]);
        setContacts(contactsData);
        setHistory(historyData);
      } catch (err) {
        toast.error("Failed to load contacts or history");
      } finally {
        setIsLoadingContacts(false);
      }
    }
    loadInitialData();
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!promptDetails.trim()) {
      toast.error("Please provide some instructions for the AI.");
      return;
    }

    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const result = await generateAiCopy(mode, promptDetails, selectedContactId || null, tone);
      setGeneratedResult(result);
      toast.success("Generation complete");
    } catch (err) {
      toast.error(err.message || "AI Generation failed. The service might be temporarily unavailable.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!generatedResult) return;
    setIsSaving(true);
    try {
      const saved = await saveAiGeneration(generatedResult);
      setHistory(prev => [saved, ...prev]);
      setGeneratedResult(null);
      setPromptDetails("");
      toast.success("Saved to history successfully.");
    } catch (err) {
      toast.error("Failed to save generation.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  }

  return (
    <div className="h-full flex flex-col space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">AI Writer</h1>
        <p className="text-sm text-brand-muted">Generate high-converting outbound copy powered by Motus AI.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Input Form */}
        <div className="glass-panel rounded-xl flex flex-col border border-white/5 lg:col-span-1 h-full overflow-hidden relative">
           <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center">
                <Sparkles className="h-4 w-4 text-brand-primary mr-2" /> Context
              </h2>
           </div>
           
           <form onSubmit={handleGenerate} className="p-4 flex flex-col space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">Generation Mode</label>
                <select 
                  value={mode} 
                  onChange={e => setMode(e.target.value)} 
                  className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary mb-2"
                >
                  {MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>

                {mode === "tone_rewrite" && (
                  <div className="mt-2 pl-3 border-l-2 border-brand-primary/30">
                    <label className="block text-xs font-medium text-brand-muted mb-1">Select Tone</label>
                    <select 
                      value={tone} 
                      onChange={e => setTone(e.target.value)} 
                      className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    >
                      {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1">Target Contact (Optional)</label>
                <select 
                  value={selectedContactId} 
                  onChange={e => setSelectedContactId(e.target.value)} 
                  className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  disabled={isLoadingContacts}
                >
                  <option value="">-- No specific contact --</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || c.email} {c.company ? `(${c.company})` : ""}
                    </option>
                  ))}
                </select>
                {selectedContactId && (
                  <p className="text-xs text-brand-primary mt-1">AI will automatically inject this contact&apos;s background.</p>
                )}
              </div>

              <div className="flex-1 flex flex-col min-h-[150px]">
                <label className="block text-sm font-medium text-brand-muted mb-1">Instructions & Prompt</label>
                <textarea 
                  value={promptDetails}
                  onChange={e => setPromptDetails(e.target.value)}
                  placeholder="E.g., Congratulate them on their recent series B and tie it into how Motus unifies their expanding sales flow."
                  className="w-full flex-1 bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none"
                  required
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isGenerating} 
                  className="w-full py-2.5 rounded-md font-medium bg-brand-primary hover:bg-brand-primaryHover transition-colors text-white shadow-lg flex items-center justify-center"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BookOpenCheck className="h-4 w-4 mr-2" />}
                  {isGenerating ? "Executing Grok / xAI..." : "Generate Copy"}
                </button>
                <p className="text-[10px] text-center text-brand-muted mt-2">Cost: 1 API Unit</p>
              </div>
           </form>
        </div>

        {/* Middle Column: Output Area */}
        <div className="glass-panel rounded-xl flex flex-col border border-white/5 lg:col-span-1 h-full overflow-hidden bg-obsidian-900/50">
           <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
              <h2 className="font-semibold text-white">Output</h2>
              {generatedResult && (
                 <div className="flex space-x-2">
                    <button type="button" onClick={() => handleCopy(generatedResult.output)} className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-brand-muted hover:text-white transition-colors" title="Copy">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={handleSave} disabled={isSaving} className="p-1.5 bg-brand-primary/20 hover:bg-brand-primary/40 border border-brand-primary/30 rounded text-brand-primary transition-colors flex items-center" title="Save to History">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </button>
                 </div>
              )}
           </div>
           
           <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-brand-foreground font-light">
             {isGenerating ? (
               <div className="h-full flex flex-col items-center justify-center opacity-50">
                 <Loader2 className="h-8 w-8 animate-spin text-brand-primary mb-4" />
                 <p className="text-brand-muted animate-pulse">Consulting the model...</p>
               </div>
             ) : generatedResult ? (
               generatedResult.output
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-brand-muted/50 text-center px-4">
                  <Sparkles className="h-10 w-10 mb-2 opacity-50" />
                  <p>Your generated copy will appear here.</p>
               </div>
             )}
           </div>
        </div>

        {/* Right Column: History */}
        <div className="glass-panel rounded-xl flex flex-col border border-white/5 lg:col-span-1 h-full overflow-hidden">
           <div className="p-4 border-b border-white/5 bg-black/20">
              <h2 className="font-semibold text-white flex items-center">
                <Clock className="h-4 w-4 text-brand-muted mr-2" /> Recent History
              </h2>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {history.length === 0 ? (
                <p className="text-sm text-brand-muted text-center pt-8">No saved generations yet.</p>
             ) : (
               history.map(hist => (
                  <div key={hist.id} className="bg-obsidian-900 border border-white/5 p-3 rounded-lg group hover:border-brand-primary/30 transition-colors">
                     <div className="flex justify-between items-start mb-1">
                       <span className="text-xs font-semibold uppercase text-brand-primary tracking-wider">{hist.generation_type.replace(/_/g, " ")}</span>
                       <button onClick={() => handleCopy(hist.output_text)} className="opacity-0 group-hover:opacity-100 text-brand-muted hover:text-white transition-all">
                          <Copy className="h-3 w-3" />
                       </button>
                     </div>
                     {hist.contacts && (
                        <div className="text-[10px] text-brand-muted mb-2">Target: {hist.contacts.full_name || hist.contacts.email}</div>
                     )}
                     <div className="text-xs text-brand-foreground line-clamp-3 overflow-hidden text-ellipsis italic opacity-80 border-l-2 border-brand-primary/20 pl-2">
                       &quot;{hist.output_text}&quot;
                     </div>
                  </div>
               ))
             )}
           </div>
        </div>

      </div>
    </div>
  );
}
