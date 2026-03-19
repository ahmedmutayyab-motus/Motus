"use client";

import { useState, useRef } from "react";
import { X, UploadCloud, FileType, Check, Loader2, Info } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { importContactsBatch } from "@/app/actions/contacts";

const EXPECTED_COLUMNS = [
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "email", label: "Email", required: true },
  { key: "company", label: "Company" },
  { key: "title", label: "Job Title" },
  { key: "linkedin_url", label: "LinkedIn URL" },
  { key: "phone", label: "Phone" },
];

export default function CsvImportModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: upload, 2: map, 3: summary
  const [parsedData, setParsedData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  function resetState() {
    setStep(1);
    setParsedData([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setImportSummary(null);
  }

  function handleClose() {
    resetState();
    onClose();
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        if (!results.meta.fields || results.meta.fields.length === 0) {
          toast.error("Invalid CSV format. No headers found.");
          return;
        }
        setCsvHeaders(results.meta.fields);
        setParsedData(results.data);
        
        // Auto-map logic based on exact or similar names
        const initialMapping = {};
        EXPECTED_COLUMNS.forEach(col => {
          const match = results.meta.fields.find(h => 
            h.toLowerCase() === col.key || 
            h.toLowerCase() === col.label.toLowerCase() ||
            h.toLowerCase().replace(/[^a-z]/g, '') === col.key.replace(/_/, '')
          );
          if (match) initialMapping[col.key] = match;
        });
        setColumnMapping(initialMapping);
        setStep(2);
      },
      error: function(error) {
        toast.error(`CSV Parse Error: ${error.message}`);
      }
    });
  }

  function handleMappingChange(expectedKey, csvHeader) {
    setColumnMapping(prev => ({ ...prev, [expectedKey]: csvHeader }));
  }

  async function executeImport() {
    setIsSubmitting(true);
    
    try {
      // 1. Client-Side Parsing & Validation
      let totalRows = parsedData.length;
      let validRowsRaw = [];
      
      parsedData.forEach(row => {
        const mappedContact = {};
        Object.entries(columnMapping).forEach(([expectedKey, csvHeader]) => {
          if (csvHeader && row[csvHeader]) {
            mappedContact[expectedKey] = row[csvHeader];
          }
        });
        
        // Basic requirement: needs email OR (name and company)
        if (mappedContact.email || (mappedContact.first_name && mappedContact.company)) {
          validRowsRaw.push(mappedContact);
        }
      });

      // 2. Client-Side Duplicate Detection (Preview Deduplication)
      const uniqueEmails = new Set();
      const uniqueNames = new Set();
      const clientDeduplicated = [];
      let clientSkipped = 0;

      for (const row of validRowsRaw) {
        let isClientDupe = false;
        if (row.email) {
          if (uniqueEmails.has(row.email.toLowerCase())) {
            isClientDupe = true;
          } else {
            uniqueEmails.add(row.email.toLowerCase());
          }
        } else if (row.first_name && row.company) {
          const hash = `${row.first_name.toLowerCase()}|${row.company.toLowerCase()}`;
          if (uniqueNames.has(hash)) {
            isClientDupe = true;
          } else {
            uniqueNames.add(hash);
          }
        }
        
        if (isClientDupe) {
          clientSkipped++;
        } else {
          clientDeduplicated.push(row);
        }
      }

      const validRowsCount = validRowsRaw.length;

      if (clientDeduplicated.length === 0) {
        throw new Error(`Out of ${totalRows} rows, none were valid or all were duplicates within the file.`);
      }

      // 3. Server-Side Insertion & DB-level Duplicate Checking
      // We pass the total base numbers for accurate final reporting
      const result = await importContactsBatch(clientDeduplicated);
      
      const serverSkipped = result.duplicates || 0;
      const totalSkipped = clientSkipped + serverSkipped;

      setImportSummary({
        totalRows: totalRows,
        validRows: validRowsCount,
        duplicates: totalSkipped,
        skipped: totalSkipped, // We strictly skip duplicates in Phase 2
        imported: result.imported
      });

      toast.success(`Import complete!`);
      setStep(3);
    } catch (error) {
      toast.error(error.message || "Failed to import contacts.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-2xl rounded-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold text-white">Import Contacts from CSV</h2>
          {step !== 3 && (
            <button onClick={handleClose} className="text-brand-muted hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="h-64 border-2 border-dashed border-white/10 hover:border-brand-primary/50 transition-colors rounded-xl flex flex-col items-center justify-center bg-black/20 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
              <UploadCloud className="h-12 w-12 text-brand-primary mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Click or drag a .csv file here</h3>
              <p className="text-sm text-brand-muted text-center max-w-xs">
                File must include headers. We will automatically map common fields like Email and First Name.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center text-sm text-brand-muted bg-brand-primary/10 border border-brand-primary/30 p-3 rounded-md">
                <FileType className="h-5 w-5 text-brand-primary mr-3 shrink-0" />
                Found {parsedData.length} rows. Please review how columns will map to Motus.
              </div>
              
              <div className="border border-white/5 rounded-md overflow-hidden bg-obsidian-900">
                <table className="w-full text-sm text-left">
                  <thead className="bg-black/40 text-brand-muted border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3 font-medium w-1/2">Motus Field</th>
                      <th className="px-4 py-3 font-medium w-1/2">CSV Column</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXPECTED_COLUMNS.map((col, idx) => (
                      <tr key={col.key} className={idx !== EXPECTED_COLUMNS.length - 1 ? "border-b border-white/5" : ""}>
                        <td className="px-4 py-3 text-white">
                          {col.label} {col.required && <span className="text-red-500">*</span>}
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            value={columnMapping[col.key] || ""} 
                            onChange={(e) => handleMappingChange(col.key, e.target.value)}
                            className="w-full bg-transparent border border-white/10 rounded-md px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                          >
                            <option value="">-- Ignore --</option>
                            {csvHeaders.map(h => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 3 && importSummary && (
             <div className="space-y-6 text-center py-8">
               <div className="h-16 w-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-primary/30">
                 <Check className="h-8 w-8 text-brand-primary" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Import Complete</h3>
               <p className="text-brand-muted max-w-sm mx-auto mb-8">
                 Your CSV has been processed. Duplicates matched against your existing Motus workspace and intra-file have been skipped safely.
               </p>

               <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 max-w-3xl mx-auto">
                 <div className="bg-obsidian-900 border border-white/5 p-4 rounded-lg">
                   <div className="text-2xl font-semibold text-white">{importSummary.totalRows}</div>
                   <div className="text-xs text-brand-muted uppercase tracking-wider mt-1">Total Rows</div>
                 </div>
                 <div className="bg-obsidian-900 border border-white/5 p-4 rounded-lg">
                   <div className="text-2xl font-semibold text-white">{importSummary.validRows}</div>
                   <div className="text-xs text-brand-muted uppercase tracking-wider mt-1">Valid Rows</div>
                 </div>
                 <div className="bg-obsidian-900 border border-brand-primary/20 p-4 rounded-lg bg-brand-primary/5">
                   <div className="text-2xl font-semibold text-brand-primary">{importSummary.imported}</div>
                   <div className="text-xs text-brand-muted uppercase tracking-wider mt-1">Imported</div>
                 </div>
                 <div className="bg-obsidian-900 border border-white/5 p-4 rounded-lg">
                   <div className="text-2xl font-semibold text-white">{importSummary.duplicates}</div>
                   <div className="text-xs text-brand-muted uppercase tracking-wider mt-1">Duplicates</div>
                 </div>
                 <div className="bg-obsidian-900 border border-white/5 p-4 rounded-lg">
                   <div className="text-2xl font-semibold text-white">{importSummary.skipped}</div>
                   <div className="text-xs text-brand-muted uppercase tracking-wider mt-1">Skipped</div>
                 </div>
               </div>
             </div>
          )}
        </div>

        {step !== 3 && (
          <div className="p-6 border-t border-white/5 bg-black/20 flex justify-between items-center">
            {step === 2 ? (
              <button type="button" onClick={() => setStep(1)} disabled={isSubmitting} className="px-4 py-2 rounded-md font-medium text-brand-muted hover:text-white transition-colors">
                Back
              </button>
            ) : <div></div>}
            
            <div className="flex space-x-3">
              <button type="button" onClick={handleClose} disabled={isSubmitting} className="px-4 py-2 rounded-md font-medium border border-white/10 hover:bg-white/5 transition-colors text-white">
                Cancel
              </button>
              {step === 2 && (
                <button onClick={executeImport} disabled={isSubmitting} className="px-4 py-2 rounded-md font-medium bg-brand-primary hover:bg-brand-primaryHover transition-colors text-white shadow flex items-center">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Import {parsedData.length} Contacts
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end items-center">
             <button onClick={handleClose} className="px-6 py-2 rounded-md font-medium bg-brand-primary hover:bg-brand-primaryHover transition-colors text-white shadow">
                Done
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
