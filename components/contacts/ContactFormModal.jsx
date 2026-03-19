"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { addContact, updateContact } from "@/app/actions/contacts";
import { toast } from "sonner";

export default function ContactFormModal({ isOpen, onClose, contact = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      if (contact) {
        await updateContact(contact.id, data);
        toast.success("Contact updated successfully.");
      } else {
        await addContact(data);
        toast.success("Contact added successfully.");
      }
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save contact.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-lg rounded-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold text-white">
            {contact ? "Edit Contact" : "Add Contact"}
          </h2>
          <button onClick={onClose} className="text-brand-muted hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="first_name">First Name</label>
                <input name="first_name" id="first_name" defaultValue={contact?.first_name || ""} className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="last_name">Last Name</label>
                <input name="last_name" id="last_name" defaultValue={contact?.last_name || ""} className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="email">Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" id="email" defaultValue={contact?.email || ""} className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="company">Company</label>
                <input name="company" id="company" defaultValue={contact?.company || ""} className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="title">Job Title</label>
                <input name="title" id="title" defaultValue={contact?.title || ""} className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="linkedin_url">LinkedIn URL</label>
              <input type="url" name="linkedin_url" id="linkedin_url" defaultValue={contact?.linkedin_url || ""} className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary" placeholder="https://linkedin.com/in/..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="stage">Stage</label>
                <select name="stage" id="stage" defaultValue={contact?.stage || "Cold"} className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary">
                  <option value="Cold">Cold</option>
                  <option value="Approached">Approached</option>
                  <option value="Replied">Replied</option>
                  <option value="Interested">Interested</option>
                  <option value="Customer">Customer</option>
                  <option value="Disqualified">Disqualified</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="phone">Phone</label>
                <input name="phone" id="phone" defaultValue={contact?.phone || ""} className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-brand-muted mb-1" htmlFor="notes_summary">Notes Summary</label>
              <textarea name="notes_summary" id="notes_summary" defaultValue={contact?.notes_summary || ""} rows={3} className="w-full bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none" />
            </div>
          </div>
          
          <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 rounded-md font-medium border border-white/10 hover:bg-white/5 transition-colors text-white">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md font-medium bg-brand-primary hover:bg-brand-primaryHover transition-colors text-white shadow flex items-center">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {contact ? "Save Changes" : "Add Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
