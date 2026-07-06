import React, { useState } from 'react';
import { Calendar, Users, Trophy, Download, Eye, Trash2, Search, AlertCircle } from 'lucide-react';
import { VendorAnalysis } from '../types';

interface HistoryListProps {
  token: string;
  analyses: VendorAnalysis[];
  onSelectAnalysis: (analysis: VendorAnalysis) => void;
  onRefreshAnalyses: () => void;
}

export default function HistoryList({ token, analyses, onSelectAnalysis, onRefreshAnalyses }: HistoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you absolutely sure you want to delete this historical analysis from database? This action cannot be reversed.')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete');
      }

      // Refresh listings
      onRefreshAnalyses();
    } catch (err: any) {
      alert(err.message || 'Error deleting item');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAnalyses = analyses.filter(a => {
    const term = searchTerm.toLowerCase();
    return (
      a.bestVendor.name.toLowerCase().includes(term) ||
      a.uploadedVendors.some(v => v.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 flex items-center space-x-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <span>Procurement Analysis History</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View, review, print, and delete all saved procurement comparative reports.
          </p>
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {filteredAnalyses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          <AlertCircle className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium">No saved analyses found matching the filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-6">Assessment Date</th>
                  <th className="py-3.5 px-4">Uploaded Files</th>
                  <th className="py-3.5 px-4">Selected Winner</th>
                  <th className="py-3.5 px-4 text-center">Score</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredAnalyses.map(analysis => {
                  return (
                    <tr 
                      key={analysis.id} 
                      onClick={() => onSelectAnalysis(analysis)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4.5 px-6 font-semibold text-slate-800">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>{new Date(analysis.date).toLocaleDateString()}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{new Date(analysis.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      
                      <td className="py-4.5 px-4 font-mono text-[11px] max-w-xs truncate">
                        {analysis.uploadedVendors.join(', ')}
                      </td>
                      
                      <td className="py-4.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
                          <span className="font-bold text-slate-900">{analysis.bestVendor.name}</span>
                        </div>
                      </td>

                      <td className="py-4.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700">
                          {analysis.bestVendor.score}/100
                        </span>
                      </td>

                      <td className="py-4.5 px-6 text-right space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAnalysis(analysis);
                          }}
                          className="p-1.5 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 rounded-lg transition-colors cursor-pointer inline-flex items-center space-x-1 font-semibold"
                          title="View Assessment Details"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Details</span>
                        </button>

                        <button
                          onClick={(e) => handleDelete(analysis.id, e)}
                          disabled={deletingId === analysis.id}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer inline-flex items-center space-x-1 font-semibold"
                          title="Delete Analysis History"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
