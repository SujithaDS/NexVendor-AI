import React, { useEffect, useState } from 'react';
import { User, LogOut, Award, ClipboardCheck, Mail, Key } from 'lucide-react';

interface ProfileViewProps {
  token: string;
  onLogout: () => void;
}

export default function ProfileView({ token, onLogout }: ProfileViewProps) {
  const [profile, setProfile] = useState<{ name: string; email: string; totalAnalyses: number; reportsGenerated: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Banner with profile head */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 h-32 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 bg-indigo-100 border-4 border-white rounded-2xl flex items-center justify-center text-indigo-700 shadow shadow-indigo-100">
              <User className="h-10 w-10" />
            </div>
          </div>
        </div>

        <div className="pt-14 pb-8 px-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900">{profile?.name || 'Authorized User'}</h2>
              <p className="text-xs text-slate-500">{profile?.email || 'user@company.com'}</p>
            </div>

            <button
              onClick={onLogout}
              className="px-4 py-1.5 border border-red-200 hover:bg-red-50 text-red-500 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5">
              <ClipboardCheck className="h-5 w-5 text-indigo-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Vendor Appraisals</span>
              <span className="text-xl font-display font-extrabold text-slate-800">{profile?.totalAnalyses || 0}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5">
              <Award className="h-5 w-5 text-emerald-500" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Reports Compiled</span>
              <span className="text-xl font-display font-extrabold text-slate-800">{profile?.reportsGenerated || 0}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Details & Compliance</h3>
            
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Security Access Level:</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase text-[10px]">Senior Consultant</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Authentication Method:</span>
                <span className="font-mono text-[10px]">JWT RSA-256 HS512</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Database Engine:</span>
                <span className="font-mono text-[10px]">SQLite 3 Database</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
