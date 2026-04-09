"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send, Bot, Sparkles, Building, MapPin, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { getThreadById, updateThreadState, saveDraftMessage, generateAiReply } from "@/app/actions/inbox";
import Link from "next/link";

export default function ThreadDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyBody, setReplyBody] = useState("");
  
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isUpdatingState, setIsUpdatingState] = useState(false);

  const endOfMessagesRef = useRef(null);

  async function fetchThread() {
    setIsLoading(true);
    try {
      const data = await getThreadById(id);
      setThread(data);
      setMessages(data.inbox_messages || []);
      setTimeout(() => scrollToBottom(), 100);
    } catch (e) {
      toast.error(e.message || "Failed to load thread.");
      router.push("/inbox");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function handleStateChange(newState) {
    setIsUpdatingState(true);
    try {
      await updateThreadState(id, newState);
      setThread(prev => ({ ...prev, state: newState }));
      toast.success("State updated.");
    } catch (e) {
      toast.error(e.message || "Failed to update state.");
    } finally {
      setIsUpdatingState(false);
    }
  }

  async function handleSendReply() {
    if (!replyBody.trim()) return;
    setIsSavingDraft(true);
    try {
      // It's a manual send OR a user confirming the AI drafted text
      await saveDraftMessage(id, replyBody.trim(), false);
      toast.success("Reply saved to thread.");
      setReplyBody("");
      fetchThread(); // Refresh thread
    } catch (e) {
      toast.error(e.message || "Failed to save reply.");
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleGenerateAi() {
    setIsGeneratingAi(true);
    try {
      const res = await generateAiReply(id, "Keep it very concise. Motus is a premium B2B SaaS platform.");
      if (res.draftedReply) {
        setReplyBody(res.draftedReply);
        toast.success("AI draft generated successfully.");
      }
    } catch (e) {
      // Graceful provider failure handling without crashing page
      toast.error(e.message || "Failed to contact AI provider.");
    } finally {
      setIsGeneratingAi(false);
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <p className="text-brand-muted mt-4">Loading Thread...</p>
      </div>
    );
  }

  if (!thread) return null;

  const contact = thread.contacts;

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-4">
      {/* Top Header */}
      <div>
        <Link href="/inbox" className="text-xs text-brand-muted hover:text-white flex items-center mb-3 transition-colors">
          <ArrowLeft className="h-3 w-3 mr-1" /> Back to Inbox
        </Link>
        <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-white">{thread.subject}</h1>
            <div className="flex items-center space-x-2">
               {isUpdatingState && <Loader2 className="h-4 w-4 animate-spin text-brand-muted" />}
               <select 
                 value={thread.state}
                 onChange={(e) => handleStateChange(e.target.value)}
                 disabled={isUpdatingState}
                 className={`text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded border focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer disabled:opacity-50
                   ${thread.state === 'open' ? 'border-brand-primary/20 bg-brand-primary/10 text-brand-primary' : ''}
                   ${thread.state === 'interested' ? 'border-green-500/20 bg-green-500/10 text-green-400' : ''}
                   ${thread.state === 'follow_up' ? 'border-amber-500/20 bg-amber-500/10 text-amber-400' : ''}
                   ${thread.state === 'closed' ? 'border-red-500/20 bg-red-500/10 text-red-400' : ''}
                   ${thread.state === 'archived' ? 'border-white/10 bg-white/5 text-brand-muted' : ''}
                 `}
               >
                 <option value="open" className="bg-obsidian-900 text-white">OPEN</option>
                 <option value="interested" className="bg-obsidian-900 text-white">INTERESTED</option>
                 <option value="follow_up" className="bg-obsidian-900 text-white">FOLLOW UP</option>
                 <option value="closed" className="bg-obsidian-900 text-white">CLOSED</option>
                 <option value="archived" className="bg-obsidian-900 text-white">ARCHIVED</option>
               </select>
            </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-[220px])] min-h-[600px]">
         {/* Main Conversation Thread View */}
         <div className="flex-1 glass-panel rounded-xl flex flex-col border border-white/5 bg-black/20 overflow-hidden">
            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {messages.length === 0 ? (
                  <div className="text-center text-brand-muted mt-10">No messages in this thread yet.</div>
               ) : (
                  messages.map((msg, i) => {
                     const isUser = msg.sender_type === 'user';
                     return (
                        <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                           <div className="flex items-center space-x-2 mb-1.5 opacity-80 px-1">
                              <span className="text-xs font-semibold text-white">{msg.sender_name || msg.sender_email}</span>
                              <span className="text-[10px] text-brand-muted tracking-wide">
                                 {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                              </span>
                              {msg.is_ai_generated && (
                                 <span className="text-[9px] uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded ml-2 flex items-center">
                                    <Bot className="h-2.5 w-2.5 mr-0.5" /> AI Draft
                                 </span>
                              )}
                           </div>
                           <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[75%] whitespace-pre-wrap text-sm leading-relaxed ${isUser ? 'bg-brand-primary/10 border border-brand-primary/20 text-white rounded-br-none' : 'bg-obsidian-900 border border-white/10 text-white/90 rounded-tl-none shadow-xl'}`}>
                              {msg.body}
                           </div>
                        </div>
                     );
                  })
               )}
               <div ref={endOfMessagesRef} />
            </div>
            
            {/* Reply Composer */}
            <div className="p-4 bg-obsidian-900/50 border-t border-white/5 space-y-3 relative">
               <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Draft your reply here..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-brand-primary resize-none h-24"
               ></textarea>
               <div className="flex items-center justify-between">
                  <div className="text-xs text-brand-muted flex items-center">
                     <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20 mr-2 flex items-center">
                        <Loader2 className="h-3 w-3 mr-1" /> Pending Sync Provider
                     </span>
                     Replies save as local drafts in Phase 5.
                  </div>
                  <div className="flex space-x-2">
                     <button 
                         onClick={handleGenerateAi}
                         disabled={isGeneratingAi || isSavingDraft}
                         className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-brand-primary/20 text-brand-primary rounded-md font-medium text-sm transition-colors disabled:opacity-50 shadow"
                     >
                        {isGeneratingAi ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        Generate AI Draft
                     </button>
                     <button 
                         onClick={handleSendReply}
                         disabled={!replyBody.trim() || isSavingDraft || isGeneratingAi}
                         className="flex items-center bg-brand-primary hover:bg-brand-primaryHover text-white px-5 py-2 rounded-md font-medium text-sm transition-colors shadow disabled:opacity-50"
                     >
                        {isSavingDraft ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                        Save Draft
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Context Sidebar */}
         <div className="w-full lg:w-72 space-y-4">
            <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-5">
               <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2 pb-2 border-b border-white/10">Prospect Context</h3>
               
               {contact ? (
                  <div className="space-y-4">
                     <div>
                        <div className="text-sm font-medium text-white">{contact.full_name || contact.email}</div>
                        <div className="text-xs text-brand-muted mt-0.5">{contact.email}</div>
                     </div>
                     
                     <div className="space-y-2">
                        {contact.company && (
                           <div className="flex items-center text-xs text-brand-muted">
                              <Building className="h-3.5 w-3.5 mr-2 opacity-70 flex-shrink-0" />
                              <span className="truncate">{contact.company}</span>
                           </div>
                        )}
                        {contact.title && (
                           <div className="flex items-center text-xs text-brand-muted">
                              <Briefcase className="h-3.5 w-3.5 mr-2 opacity-70 flex-shrink-0" />
                              <span className="truncate">{contact.title}</span>
                           </div>
                        )}
                        {contact.location && (
                           <div className="flex items-center text-xs text-brand-muted">
                              <MapPin className="h-3.5 w-3.5 mr-2 opacity-70 flex-shrink-0" />
                              <span className="truncate">{contact.location}</span>
                           </div>
                        )}
                     </div>
                  </div>
               ) : (
                  <div className="text-sm text-brand-muted text-center py-4">No contact linked.</div>
               )}
            </div>

            <div className="glass-panel p-5 rounded-xl border border-white/5">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 pb-2 border-b border-white/10">AI Insights</h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                   Currently waiting for enough thread volume to generate summary metrics. Check back when the thread extends or when IMAP live ingestion completes in Phase 6.
                </p>
            </div>
         </div>
      </div>
    </div>
  );
}
