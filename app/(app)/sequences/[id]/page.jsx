"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, GripVertical, Check, PauseCircle, PlayCircle, Loader2, Save, Trash2, X, Users, MessageSquare, Briefcase, Plus, HelpCircle, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { getSequenceById, updateSequenceStatus, updateSequenceMetadata, saveSequenceSteps, enrollContacts } from "@/app/actions/sequences";
import { getContacts } from "@/app/actions/contacts";
import EnrollModal from "@/components/sequences/EnrollModal";
import Link from "next/link";

export default function SequenceEditorPage() {
  const { id } = useParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [sequence, setSequence] = useState(null);
  const [steps, setSteps] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  
  const [localName, setLocalName] = useState("");
  const [localDesc, setLocalDesc] = useState("");
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [isSavingSteps, setIsSavingSteps] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const [activeTab, setActiveTab] = useState("builder"); // "builder" | "enrollments"
  
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [contactsDB, setContactsDB] = useState([]);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await getSequenceById(id);
      setSequence(data);
      setSteps(data.sequence_steps || []);
      setEnrollments(data.sequence_enrollments || []);
      setLocalName(data.name || "");
      setLocalDesc(data.description || "");

      // Premount contact data for modal
      const c = await getContacts("", "all");
      setContactsDB(c);
    } catch (err) {
      toast.error(err.message || "Failed to load sequence.");
      router.push("/sequences");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (id) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleToggleStatus() {
    setIsTogglingStatus(true);
    const newStatus = sequence.status === 'active' ? 'paused' : 'active';
    try {
      await updateSequenceStatus(id, newStatus);
      setSequence(prev => ({ ...prev, status: newStatus }));
      toast.success(`Sequence ${newStatus}`);
    } catch (e) {
      toast.error("Failed to update status.");
    } finally {
      setIsTogglingStatus(false);
    }
  }

  async function handleSaveMeta() {
    setIsSavingMeta(true);
    try {
      await updateSequenceMetadata(id, localName, localDesc);
      setSequence(prev => ({ ...prev, name: localName, description: localDesc }));
      toast.success("Sequence identity saved.");
    } catch (e) {
      toast.error("Failed to save sequence identity.");
    } finally {
      setIsSavingMeta(false);
    }
  }

  async function handleSaveSteps() {
    setIsSavingSteps(true);
    try {
      await saveSequenceSteps(id, steps);
      toast.success("Timeline configuration saved.");
      loadData(); // Reverify alignment
    } catch (e) {
      toast.error("Failed to save step configuration.");
    } finally {
      setIsSavingSteps(false);
    }
  }

  async function performEnrollmentSubmit(contactIds) {
    try {
      const result = await enrollContacts(id, contactIds);
      toast.success(`Enrollment success: ${result.enrolled} joined (Skipped ${result.skipped} active duplicates).`);
      setIsEnrollModalOpen(false);
      loadData();
    } catch (e) {
      toast.error(e.message || "Enrollment failed.");
    }
  }

  function addStep(type) {
    setSteps(prev => [
      ...prev,
      {
        id: `virtual-${Date.now()}`,
        step_type: type,
        delay_days: prev.length === 0 ? 0 : 1,
        subject_template: type === 'email' ? "" : null,
        body_template: type === 'email' ? "" : null,
        task_title: type !== 'email' ? "Complete task" : null
      }
    ]);
  }

  function removeStep(index) {
    setSteps(prev => prev.filter((_, i) => i !== index));
  }

  function moveStep(index, direction) {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === steps.length - 1) return;
    setSteps(prev => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[index + direction];
      arr[index + direction] = temp;
      return arr;
    });
  }

  function updateStep(index, field, value) {
    setSteps(prev => {
      const arr = [...prev];
      arr[index] = { ...arr[index], [field]: value };
      return arr;
    });
  }

  // Helper for rendering available contacts excluding existing
  const currentlyEnrolledIds = new Set(enrollments.map(e => e.contacts.id));
  const availableToEnroll = contactsDB.filter(c => !currentlyEnrolledIds.has(c.id));

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <p className="text-brand-muted mt-4">Loading Architecture...</p>
      </div>
    );
  }

  if (!sequence) return null;

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
           <Link href="/sequences" className="text-xs text-brand-muted hover:text-white flex items-center mb-3 transition-colors">
              <ArrowLeft className="h-3 w-3 mr-1" /> Back to Sequences
           </Link>
           <div className="flex items-center mb-2 gap-3">
             <h1 className="text-2xl font-bold tracking-tight text-white">{sequence.name}</h1>
             {sequence.status === 'active' && <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded text-xs uppercase tracking-wider font-semibold border border-green-500/20">Active</span>}
             {sequence.status === 'paused' && <span className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded text-xs uppercase tracking-wider font-semibold border border-amber-500/20">Paused</span>}
             {sequence.status === 'draft' && <span className="text-brand-muted bg-white/5 border border-white/10 px-2 py-1 rounded text-xs uppercase tracking-wider font-semibold">Draft</span>}
           </div>
        </div>

        <div className="flex items-center space-x-3">
           <button onClick={handleToggleStatus} disabled={isTogglingStatus || steps.length === 0} className={`flex items-center px-4 py-2 rounded-md font-medium text-sm transition-colors border ${sequence.status === 'active' ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'border-green-500/50 hover:bg-green-500/20 bg-green-500/10 text-green-500'} disabled:opacity-50`}>
             {isTogglingStatus ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : (sequence.status === 'active' ? <PauseCircle className="h-4 w-4 mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />)}
             {sequence.status === 'active' ? 'Pause Sequence' : 'Launch Sequence'}
           </button>
        </div>
      </div>

      <div className="glass-panel p-1 rounded-lg flex space-x-1 border border-white/5 bg-black/40 w-fit">
        <button onClick={() => setActiveTab('builder')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'builder' ? 'bg-white/10 text-white' : 'text-brand-muted hover:text-white'}`}>Flow Builder</button>
        <button onClick={() => setActiveTab('enrollments')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'enrollments' ? 'bg-white/10 text-white' : 'text-brand-muted hover:text-white'}`}>Enrollments <span className="ml-1 opacity-50">({enrollments.length})</span></button>
      </div>

      {activeTab === 'builder' && (
      <div className="grid lg:grid-cols-4 gap-6">
         {/* Meta Config */}
         <div className="lg:col-span-1 space-y-4">
            <div className="glass-panel p-5 border border-white/5 rounded-xl space-y-4">
               <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Internal Name</label>
                  <input type="text" value={localName} onChange={e => setLocalName(e.target.value)} className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary" />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Description</label>
                  <textarea rows={4} value={localDesc} onChange={e => setLocalDesc(e.target.value)} className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none" placeholder="What is the goal of this sequence?"></textarea>
               </div>
               <button onClick={handleSaveMeta} disabled={isSavingMeta} className="w-full py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-md text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50">
                 {isSavingMeta ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                 Update Metadata
               </button>
            </div>
         </div>

         {/* Sequence Timeline Editor */}
         <div className="lg:col-span-3">
            <div className="glass-panel rounded-xl flex flex-col border border-white/5 h-[650px]">
               <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                 <h2 className="font-semibold text-white">Timeline Architecture</h2>
                 <button onClick={handleSaveSteps} disabled={isSavingSteps} className="px-4 py-1.5 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-md text-sm font-medium transition-colors shadow flex items-center disabled:opacity-50">
                    {isSavingSteps ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />} Save Architecture
                 </button>
               </div>
               <div className="flex-1 overflow-y-auto p-6 bg-obsidian-900/50">
                 {steps.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-brand-muted">
                       <HelpCircle className="h-10 w-10 mb-3 opacity-20" />
                       <p>This sequence has no structural timeline.</p>
                       <p className="text-sm mt-1 mb-6">Add steps below to design your outbound flow.</p>
                    </div>
                 ) : (
                    <div className="space-y-6 pb-20">
                      {steps.map((step, idx) => (
                        <div key={idx} className="relative group">
                           {/* Connecting Line visually simulating steps hierarchy */}
                           {idx !== steps.length - 1 && <div className="absolute left-[20px] top-[40px] bottom-[-24px] w-[2px] bg-white/5 z-0" />}
                           
                           <div className="relative z-10 flex items-start space-x-4">
                              <div className="flex-shrink-0 mt-3 h-10 w-10 rounded-full bg-obsidian-900 border border-white/10 flex items-center justify-center text-brand-muted text-xs shadow-lg title font-medium">
                                 {idx + 1}
                              </div>
                              <div className="flex-1 bg-obsidian-900 border border-white/10 rounded-xl p-4 shadow-xl transition-all hover:border-white/20">
                                 <div className="flex items-center justify-between mb-4">
                                     <div className="flex items-center space-x-3">
                                        <div className={`p-1.5 rounded-md ${step.step_type === 'email' ? 'bg-blue-500/10 text-blue-400' : step.step_type === 'linkedin_task' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                           {step.step_type === 'email' ? <MessageSquare className="h-4 w-4" /> : step.step_type === 'linkedin_task' ? <Users className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-white mb-0.5 capitalize">{step.step_type.replace('_', ' ')} Layout</div>
                                          <div className="text-xs text-brand-muted flex items-center">
                                            Wait <input type="number" min="0" value={step.delay_days} onChange={e => updateStep(idx, 'delay_days', parseInt(e.target.value)||0)} className="w-12 bg-transparent border-b border-white/20 mx-1 px-1 text-center text-white focus:outline-none focus:border-brand-primary" /> days before execution
                                          </div>
                                        </div>
                                     </div>
                                     <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="p-1.5 text-brand-muted hover:text-white bg-white/5 rounded transition-all disabled:opacity-30">
                                          <ArrowUp className="h-4 w-4" />
                                       </button>
                                       <button onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} className="p-1.5 text-brand-muted hover:text-white bg-white/5 rounded transition-all disabled:opacity-30">
                                          <ArrowDown className="h-4 w-4" />
                                       </button>
                                       <div className="w-px h-4 bg-white/10 mx-1"></div>
                                       <button onClick={() => removeStep(idx)} className="p-1.5 text-brand-muted hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded transition-all">
                                          <Trash2 className="h-4 w-4" />
                                       </button>
                                     </div>
                                 </div>
                                 
                                 <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                                    {step.step_type === 'email' ? (
                                      <>
                                        <div>
                                          <label className="block text-[10px] font-semibold text-brand-muted uppercase tracking-wider mb-1">Subject Pipeline</label>
                                          <input type="text" value={step.subject_template || ""} onChange={e => updateStep(idx, 'subject_template', e.target.value)} placeholder="{{first_name}}, quick question" className="w-full bg-black/40 border border-white/5 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary" />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-semibold text-brand-muted uppercase tracking-wider mb-1">Body Architecture</label>
                                          <textarea rows={4} value={step.body_template || ""} onChange={e => updateStep(idx, 'body_template', e.target.value)} className="w-full bg-black/40 border border-white/5 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none" placeholder="Hey {{first_name}}, dropping a note to see..."></textarea>
                                        </div>
                                      </>
                                    ) : (
                                       <div>
                                          <label className="block text-[10px] font-semibold text-brand-muted uppercase tracking-wider mb-1">Task Definition / Instructions</label>
                                          <input type="text" value={step.task_title || ""} onChange={e => updateStep(idx, 'task_title', e.target.value)} placeholder={step.step_type === 'linkedin_task' ? "Send LinkedIn connection request with note" : "Review CRM state manually"} className="w-full bg-black/40 border border-white/5 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary" />
                                        </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                 )}
               </div>
               
               <div className="p-4 border-t border-white/5 bg-black/20 flex justify-center space-x-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
                 <button onClick={() => addStep('email')} className="px-3 py-1.5 rounded text-xs font-medium border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1.5" /> + Email Framework
                 </button>
                 <button onClick={() => addStep('linkedin_task')} className="px-3 py-1.5 rounded text-xs font-medium border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors flex items-center">
                    <Users className="h-3 w-3 mr-1.5" /> + LinkedIn Task
                 </button>
                 <button onClick={() => addStep('manual_task')} className="px-3 py-1.5 rounded text-xs font-medium border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors flex items-center">
                    <Briefcase className="h-3 w-3 mr-1.5" /> + Review Task
                 </button>
               </div>
            </div>
         </div>
      </div>
      )}

      {activeTab === 'enrollments' && (
      <div className="glass-panel rounded-xl flex flex-col border border-white/5 min-h-[500px]">
         <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
           <h2 className="font-semibold text-white">Enrollment Database</h2>
           <button onClick={() => setIsEnrollModalOpen(true)} className="px-4 py-1.5 bg-brand-primary hover:bg-brand-primaryHover text-white rounded-md text-sm font-medium transition-colors shadow flex items-center">
              <Plus className="h-4 w-4 mr-2" /> Add Target Contacts
           </button>
         </div>
         <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-black/40 text-brand-muted border-b border-white/5">
                 <tr>
                   <th className="px-6 py-3 font-medium">Recipient Target</th>
                   <th className="px-6 py-3 font-medium">Company</th>
                   <th className="px-6 py-3 font-medium">Traversing State</th>
                   <th className="px-6 py-3 font-medium">Current Action</th>
                   <th className="px-6 py-3 font-medium">Time Elapsed</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {enrollments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-brand-muted">
                        <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No contacts have been enrolled in this sequence structurally.</p>
                      </td>
                    </tr>
                 ) : (
                    enrollments.map(e => (
                       <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3">
                            <div className="text-white font-medium">{e.contacts.full_name || e.contacts.email}</div>
                          </td>
                          <td className="px-6 py-3 text-brand-muted">{e.contacts.company || "-"}</td>
                          <td className="px-6 py-3">
                            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded border border-brand-primary/20 bg-brand-primary/10 text-brand-primary">
                              {e.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-brand-muted">Architectural Step {e.current_step}</td>
                          <td className="px-6 py-3 text-brand-muted text-xs">{new Date(e.enrolled_at).toLocaleDateString()}</td>
                       </tr>
                    ))
                 )}
               </tbody>
            </table>
         </div>
      </div>
      )}

      {/* Enroll Modal Overlays */}
      <EnrollModal 
         isOpen={isEnrollModalOpen} 
         onClose={() => setIsEnrollModalOpen(false)}
         remainingContacts={availableToEnroll}
         onEnroll={performEnrollmentSubmit}
      />
    </div>
  );
}
