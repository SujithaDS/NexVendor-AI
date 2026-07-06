import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Trash2, Play, AlertCircle, AlertTriangle, FileUp, Sparkles, Edit2, Check } from 'lucide-react';
import { VendorDocument } from '../types';

interface NewAnalysisProps {
  token: string;
  onAnalysisComplete: (analysisData: any) => void;
}

export default function NewAnalysis({ token, onAnalysisComplete }: NewAnalysisProps) {
  const [files, setFiles] = useState<VendorDocument[]>([]);
  const [vendorNames, setVendorNames] = useState<{ [key: string]: string }>({});
  const [editingTexts, setEditingTexts] = useState<{ [key: string]: string }>({});
  const [isEditingDocId, setIsEditingDocId] = useState<string | null>(null);
  
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [analyzingStep, setAnalyzingStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    'Reading uploaded proposal documents...',
    'Performing deep context text extraction...',
    'Initializing Google Gemini LLM parser...',
    'Scoring quality, pricing, compliance, and SLAs...',
    'Running multi-criteria ranking algorithm...',
    'Structuring final JSON assessment data...'
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesUpload(e.target.files);
    }
  };

  const handleFilesUpload = async (fileList: FileList) => {
    setError('');
    setUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process files');
      }

      const newDocs: VendorDocument[] = data.files;
      setFiles(prev => [...prev, ...newDocs]);

      // Initialize vendor names and editable texts
      const namesUpdate = { ...vendorNames };
      const textsUpdate = { ...editingTexts };
      
      newDocs.forEach(doc => {
        // Auto-extract vendor name from filename (e.g., "Apex Solutions.pdf" -> "Apex Solutions")
        const cleanName = doc.name.replace(/\.[^/.]+$/, "");
        namesUpdate[doc.id] = cleanName;
        textsUpdate[doc.id] = doc.extractedText;
      });

      setVendorNames(namesUpdate);
      setEditingTexts(textsUpdate);
    } catch (err: any) {
      setError(err.message || 'Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    const namesUpdate = { ...vendorNames };
    delete namesUpdate[id];
    setVendorNames(namesUpdate);

    const textsUpdate = { ...editingTexts };
    delete textsUpdate[id];
    setEditingTexts(textsUpdate);

    if (isEditingDocId === id) {
      setIsEditingDocId(null);
    }
  };

  const triggerAnalysis = async () => {
    if (files.length < 2) {
      setError('Please upload at least 2 vendor documents to perform comparison.');
      return;
    }

    // Verify all vendor names are filled
    const missingNames = files.some(f => !vendorNames[f.id]?.trim());
    if (missingNames) {
      setError('Please specify a vendor name for every document.');
      return;
    }

    setError('');
    setAnalyzing(true);
    setAnalyzingStep(0);

    // Simulate step changes for progress reassurances
    const stepInterval = setInterval(() => {
      setAnalyzingStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    try {
      const payload = {
        vendors: files.map(f => ({
          name: vendorNames[f.id],
          text: editingTexts[f.id]
        }))
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze documents');
      }

      onAnalysisComplete(data);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || 'Error during analysis processing');
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-display font-bold text-slate-900 flex items-center space-x-2">
          <FileUp className="h-6 w-6 text-indigo-600" />
          <span>New Vendor Proposal Analysis</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload and extract multiple vendor proposal documents simultaneously. Supports PDF, DOCX, and TXT files.
        </p>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="mt-6 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50/100"
        >
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.docx,.txt"
          />
          <div className="bg-indigo-50 p-4 rounded-full text-indigo-600 mb-3">
            <UploadCloud className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Drag & Drop vendor documents here</p>
          <p className="text-xs text-slate-400 mt-1">or click to browse from files (PDF, DOCX, TXT)</p>
          <p className="text-[10px] text-slate-400 mt-2 bg-indigo-50/50 px-2 py-0.5 rounded">Max size 10MB per file</p>
        </div>
      </div>

      {/* Uploaded Documents Management */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">{files.length} Vendor Documents Uploaded</span>
            <button
              onClick={() => {
                setFiles([]);
                setVendorNames({});
                setEditingTexts({});
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {files.map(doc => {
              const cleanName = doc.name.replace(/\.[^/.]+$/, "");
              return (
                <div key={doc.id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">
                            {doc.type}
                          </span>
                          <span className="text-xs font-medium text-slate-400">{doc.size}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 mt-1">{doc.name}</h4>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFile(doc.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Vendor Entity Name
                      </label>
                      <input
                        type="text"
                        value={vendorNames[doc.id] || ''}
                        onChange={(e) => {
                          setVendorNames({ ...vendorNames, [doc.id]: e.target.value });
                        }}
                        placeholder="e.g. Apex Solutions"
                        className="mt-1 block w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => setIsEditingDocId(isEditingDocId === doc.id ? null : doc.id)}
                        className={`w-full py-1.5 border px-4 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
                          isEditingDocId === doc.id
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {isEditingDocId === doc.id ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Save Extracted Proposal Text</span>
                          </>
                        ) : (
                          <>
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Review & Edit Extracted Text</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Editable Text Content */}
                  {isEditingDocId === doc.id && (
                    <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 flex items-center space-x-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                          <span>Extracted Content for Prompting</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {editingTexts[doc.id]?.length || 0} characters
                        </span>
                      </div>
                      <textarea
                        value={editingTexts[doc.id] || ''}
                        onChange={(e) => setEditingTexts({ ...editingTexts, [doc.id]: e.target.value })}
                        rows={6}
                        className="w-full text-xs font-mono p-3 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Paste or edit the vendor specs, SLAs, and price sheets here..."
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-xs text-slate-500 font-medium">
                Ensure at least 2 vendors are added for a competitive procurement evaluation.
              </span>
            </div>

            <button
              onClick={triggerAnalysis}
              disabled={files.length < 2 || uploading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow shadow-indigo-200 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              <span>Analyze & Compare Vendors</span>
            </button>
          </div>
        </div>
      )}

      {/* Uploading File Loader */}
      {uploading && (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Extracting proposal specifications...</p>
          <p className="text-xs text-slate-400">Performing document ingestion analysis</p>
        </div>
      )}

      {/* AI Processing Screen */}
      {analyzing && (
        <div className="bg-slate-950 text-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6 relative overflow-hidden min-h-[350px] justify-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-1000 ease-out"
              style={{ width: `${((analyzingStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center animate-pulse">
              <Sparkles className="h-8 w-8 text-indigo-400" />
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-display font-bold tracking-tight">AI Analysis in Progress...</h3>
            <p className="text-sm text-slate-400">Our Senior Procurement Advisor Agent is reviewing the proposals and scoring the criteria.</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-3 max-w-sm w-full font-mono text-xs text-indigo-400">
            {steps[analyzingStep]}
          </div>

          <div className="flex space-x-1.5">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === analyzingStep 
                    ? 'bg-indigo-500 scale-125' 
                    : idx < analyzingStep 
                      ? 'bg-emerald-500' 
                      : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
