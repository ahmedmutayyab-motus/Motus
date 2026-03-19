"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, UploadCloud, Search, Trash2, Edit2, RefreshCw } from "lucide-react";
import { getContacts, deleteContact } from "@/app/actions/contacts";
import ContactFormModal from "@/components/contacts/ContactFormModal";
import CsvImportModal from "@/components/contacts/CsvImportModal";
import { toast } from "sonner";

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getContacts(search, stageFilter);
      setContacts(data);
    } catch (error) {
      toast.error("Failed to load contacts.");
    } finally {
      setIsLoading(false);
    }
  }, [search, stageFilter]);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => fetchContacts(), 300);
    return () => clearTimeout(timer);
  }, [fetchContacts]);

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await deleteContact(id);
      toast.success("Contact deleted.");
      fetchContacts();
    } catch (error) {
      toast.error("Failed to delete contact.");
    }
  }

  function openEditModal(contact) {
    setSelectedContact(contact);
    setIsContactModalOpen(true);
  }

  function openAddModal() {
    setSelectedContact(null);
    setIsContactModalOpen(true);
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Contacts</h1>
          <p className="text-sm text-brand-muted">Manage your list and prepare for outreach.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsCsvModalOpen(true)} className="flex items-center bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-md font-medium text-sm border border-white/5 transition-colors">
            <UploadCloud className="h-4 w-4 mr-2" />
            Import CSV
          </button>
          <button onClick={openAddModal} className="flex items-center bg-brand-primary hover:bg-brand-primaryHover text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl flex flex-col flex-1 overflow-hidden border border-white/5">
        <div className="p-4 border-b border-white/5 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
            <input 
              type="text" 
              placeholder="Search names, emails, companies..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-obsidian-900 border border-white/10 rounded-md pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
            />
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={fetchContacts} className="p-2 text-brand-muted hover:text-white bg-obsidian-900 rounded-md border border-white/10 transition-colors">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <select 
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-obsidian-900 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="all">All Stages</option>
              <option value="Cold">Cold</option>
              <option value="Approached">Approached</option>
              <option value="Replied">Replied</option>
              <option value="Interested">Interested</option>
              <option value="Customer">Customer</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/40 text-brand-muted border-b border-white/5 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Stage</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && contacts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-brand-muted">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-brand-primary" />
                    Loading contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-brand-muted" />
                    </div>
                    <p className="text-white font-medium mb-1">No contacts found</p>
                    <p className="text-brand-muted text-xs mb-4">Try adjusting your filters or importing a CSV.</p>
                  </td>
                </tr>
              ) : (
                contacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{contact.full_name || contact.email?.split('@')[0]}</div>
                      <div className="text-xs text-brand-muted">{contact.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{contact.company || "-"}</div>
                      <div className="text-xs text-brand-muted">{contact.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                        {contact.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(contact)} className="p-1.5 text-brand-muted hover:text-white hover:bg-white/10 rounded transition-colors" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(contact.id)} className="p-1.5 text-brand-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ContactFormModal 
        isOpen={isContactModalOpen} 
        onClose={() => { setIsContactModalOpen(false); fetchContacts(); }} 
        contact={selectedContact} 
      />
      
      <CsvImportModal 
        isOpen={isCsvModalOpen} 
        onClose={() => { setIsCsvModalOpen(false); fetchContacts(); }} 
      />
    </div>
  );
}
