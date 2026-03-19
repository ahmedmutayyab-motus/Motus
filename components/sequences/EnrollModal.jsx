"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

export default function EnrollModal({ isOpen, onClose, remainingContacts, onEnroll }) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filtered = remainingContacts.filter(c => 
    (c.full_name || "").toLowerCase().includes(search.toLowerCase()) || 
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(search.toLowerCase())
  );

  function toggleContact(id) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function handleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  }

  async function handleSumbit() {
    setIsSubmitting(true);
    await onEnroll(Array.from(selectedIds));
    setIsSubmitting(false);
    setSelectedIds(new Set());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-2xl rounded-xl flex flex-col h-[80vh]">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Enroll Contacts</h2>
          <button onClick={onClose} disabled={isSubmitting} className="text-brand-muted hover:text-white transition-colors text-sm font-medium">
            Cancel
          </button>
        </div>

        <div className="p-4 border-b border-white/5 bg-black/20">
           <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
            <input 
              type="text" 
              placeholder="Search available contacts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-obsidian-900 border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
           {filtered.length === 0 ? (
             <div className="p-10 text-center text-brand-muted">No valid contacts found to enroll.</div>
           ) : (
             <table className="w-full text-sm text-left">
              <thead className="bg-black/40 text-brand-muted border-b border-white/5 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-4 py-3 flex items-center">
                    <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={handleSelectAll} className="mr-3" />
                  </th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(contact => (
                  <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleContact(contact.id)}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.has(contact.id)} readOnly className="pointer-events-none mr-3" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{contact.full_name || contact.email?.split('@')[0]}</div>
                      <div className="text-xs text-brand-muted">{contact.email}</div>
                    </td>
                    <td className="px-4 py-3 text-white">
                      {contact.company || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
           )}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/20 flex justify-between items-center">
           <span className="text-sm text-brand-muted">{selectedIds.size} selected</span>
           <button 
             onClick={handleSumbit} 
             disabled={isSubmitting || selectedIds.size === 0} 
             className="px-6 py-2 rounded-md font-medium bg-brand-primary hover:bg-brand-primaryHover transition-colors text-white shadow flex items-center disabled:opacity-50"
           >
             {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
             Enroll Contacts
           </button>
        </div>
      </div>
    </div>
  );
}
