'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Database,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Search,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { MaintenanceDocument, Equipment } from '@/types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<MaintenanceDocument[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEqId, setSelectedEqId] = useState('');
  const [docType, setDocType] = useState('OEM Service Manual');
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const [docsRes, eqRes] = await Promise.all([
        fetch('/api/documents').then((r) => r.json()),
        fetch('/api/equipment').then((r) => r.json()),
      ]);

      if (docsRes.documents) setDocuments(docsRes.documents);
      if (eqRes.equipment) setEquipmentList(eqRes.equipment);
    } catch (err) {
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedEqId) formData.append('equipment_id', selectedEqId);
      formData.append('document_type', docType);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUploadMessage(data.message || 'Document uploaded and text extracted for memory indexing.');
        setFile(null);
        await loadDocuments();
      } else {
        setErrorMsg(data.error || 'Document processing failed.');
      }
    } catch {
      setErrorMsg('Network error while uploading document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Equipment Manuals & Technical Bulletins
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                Upload OEM manuals, service bulletins, and diagnostic procedures (PDF, TXT, CSV) to enrich organizational memory
              </p>
            </div>
          </div>
        </div>

        {/* Upload Form Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Upload New Equipment Document</span>
          </h2>

          <form onSubmit={handleUpload} className="space-y-4 text-xs md:text-sm">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {uploadMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{uploadMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Associate Equipment (Optional)
                </label>
                <select
                  value={selectedEqId}
                  onChange={(e) => setSelectedEqId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">General Facility Manual</option>
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.equipment_code} — {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="OEM Service Manual">OEM Service Manual</option>
                  <option value="Technical Service Bulletin">Technical Service Bulletin</option>
                  <option value="Electrical Schematic">Electrical Schematic</option>
                  <option value="Lubrication Schedule">Lubrication Schedule</option>
                  <option value="Inspection Checklist">Inspection Checklist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  File (PDF, TXT, CSV)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.txt,.csv,.json"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={uploading || !file}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Extracting Text & Indexing...' : 'Upload & Index Document'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Uploaded Documents List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              Indexed Documents & Knowledge Artifacts ({documents.length})
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Available to REPAIR-MIND grounding engine
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Loading document memory...
            </div>
          ) : documents.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No documents uploaded yet. Upload OEM service manuals to augment AI accuracy.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-blue-400 transition-all text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-900 truncate max-w-xs">{doc.filename}</span>
                    </div>
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
                      {doc.document_type}
                    </span>
                  </div>

                  {doc.equipment_code && (
                    <div className="text-[11px] text-blue-800 font-semibold">
                      Associated Machine: {doc.equipment_code} — {doc.equipment_name}
                    </div>
                  )}

                  <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-[11px] text-slate-600 font-mono leading-relaxed line-clamp-3">
                    {doc.extracted_text || 'Text extracted and stored for vector matching.'}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
                    <span>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</span>
                    <span className="text-emerald-600 font-semibold">Indexed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
