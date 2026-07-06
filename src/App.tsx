import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, FileUp, ClipboardList, User2, LogOut, 
  Sparkles, Mail, FileBarChart2, Menu, X 
} from 'lucide-react';
import LoginRegister from './components/LoginRegister';
import NewAnalysis from './components/NewAnalysis';
import ComparisonDashboard from './components/ComparisonDashboard';
import EmailDashboard from './components/EmailDashboard';
import HistoryList from './components/HistoryList';
import ProfileView from './components/ProfileView';
import { VendorAnalysis, GeneratedEmail } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'new_analysis' | 'dashboard' | 'emails' | 'history' | 'profile'>('new_analysis');
  
  // Active report states
  const [activeAnalysis, setActiveAnalysis] = useState<VendorAnalysis | null>(null);
  const [activeEmails, setActiveEmails] = useState<GeneratedEmail[]>([]);

  // History state
  const [analyses, setAnalyses] = useState<VendorAnalysis[]>([]);

  // Mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto load login session
  useEffect(() => {
    const savedToken = localStorage.getItem('vendor_analysis_token');
    const savedUser = localStorage.getItem('vendor_analysis_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      fetchHistory(savedToken);
    }
  }, []);

  const handleLoginSuccess = (userData: { name: string; email: string }, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    fetchHistory(userToken);
    setActiveTab('new_analysis');
  };

  const handleLogout = () => {
    localStorage.removeItem('vendor_analysis_token');
    localStorage.removeItem('vendor_analysis_user');
    setToken(null);
    setUser(null);
    setActiveAnalysis(null);
    setActiveEmails([]);
  };

  const fetchHistory = async (sessionToken: string) => {
    try {
      const res = await fetch('/api/history', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyses(data);
      }
    } catch (err) {
      console.error('Error fetching history logs:', err);
    }
  };

  // Fetch emails for the active analysis
  const fetchActiveEmails = async (analysisId: string, sessionToken: string) => {
    try {
      const res = await fetch(`/api/comparison/${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveEmails(data.emails || []);
      }
    } catch (err) {
      console.error('Error loading verification emails:', err);
    }
  };

  // Handle selecting an analysis from history
  const handleSelectAnalysis = (analysis: VendorAnalysis) => {
    setActiveAnalysis(analysis);
    if (token) {
      fetchActiveEmails(analysis.id, token);
    }
    setActiveTab('dashboard');
  };

  const handleAnalysisFinished = (analysisData: VendorAnalysis) => {
    setActiveAnalysis(analysisData);
    if (token) {
      fetchHistory(token);
      fetchActiveEmails(analysisData.id, token);
    }
    setActiveTab('dashboard');
  };

  if (!token) {
    return <LoginRegister onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* VERTICAL LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 h-screen sticky top-0 print:hidden z-30">
        <div className="flex flex-col">
          {/* Brand Logo & Name */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-base font-display font-extrabold text-slate-900 tracking-tight">
              NexVendor AI
            </span>
          </div>

          {/* Navigation Links vertically stacked */}
          <nav className="p-4 space-y-1.5 flex-1">
            <button
              onClick={() => { setActiveTab('new_analysis'); }}
              className={`w-full px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2.5 cursor-pointer transition-colors ${
                activeTab === 'new_analysis' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileUp className="h-4.5 w-4.5 shrink-0" />
              <span>New Vendor Analysis</span>
            </button>

            <button
              onClick={() => { 
                if (token) fetchHistory(token);
                setActiveTab('history'); 
              }}
              className={`w-full px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2.5 cursor-pointer transition-colors ${
                activeTab === 'history' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ClipboardList className="h-4.5 w-4.5 shrink-0" />
              <span>Analysis History</span>
            </button>

            {activeAnalysis && (
              <>
                <div className="h-px bg-slate-100 my-2 mx-2" />
                <div className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Evaluation</div>
                
                <button
                  onClick={() => { setActiveTab('dashboard'); }}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2.5 cursor-pointer transition-colors ${
                    activeTab === 'dashboard' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileBarChart2 className="h-4.5 w-4.5 shrink-0" />
                  <span>Evaluation Results</span>
                </button>

                <button
                  onClick={() => { setActiveTab('emails'); }}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2.5 cursor-pointer transition-colors ${
                    activeTab === 'emails' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Mail className="h-4.5 w-4.5 shrink-0" />
                  <span>Communication</span>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Bottom User status & Log out */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <div className="px-2 py-1 text-slate-500 text-[11px] font-medium">
            Logged in as <strong className="text-slate-800">{user?.name}</strong>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50">
        
        {/* TOP COMPACT HEADER - ONLY THE PROFILE ON THE FAR RIGHT */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 print:hidden">
          {/* Breadcrumb / Active Screen title */}
          <div>
            <h1 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
              {activeTab === 'new_analysis' && 'New Proposal Assessment'}
              {activeTab === 'history' && 'Evaluation Registry'}
              {activeTab === 'dashboard' && 'Comparative Matrix'}
              {activeTab === 'emails' && 'Vendor Outreach Terminal'}
              {activeTab === 'profile' && 'User Settings Profile'}
            </h1>
          </div>

          {/* Profile Only in the Top-Right Corner */}
          <div>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 border transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-sm'
              }`}
            >
              <User2 className="h-4 w-4 text-indigo-500" />
              <span>{user?.name || 'My Profile'}</span>
            </button>
          </div>
        </header>

        {/* DYNAMIC TAB COMPONENT SWITCH */}
        <main className="flex-1 overflow-y-auto p-8 max-w-5xl w-full mx-auto">
          {activeTab === 'new_analysis' && (
            <NewAnalysis token={token} onAnalysisComplete={handleAnalysisFinished} />
          )}

          {activeTab === 'dashboard' && activeAnalysis && (
            <ComparisonDashboard 
              analysis={activeAnalysis} 
              onNavigateToEmails={() => { setActiveTab('emails'); }} 
            />
          )}

          {activeTab === 'emails' && activeAnalysis && (
            <EmailDashboard 
              token={token} 
              analysisId={activeAnalysis.id} 
              emails={activeEmails} 
              onEmailStatusUpdated={() => {
                if (token) fetchActiveEmails(activeAnalysis.id, token);
              }} 
            />
          )}

          {activeTab === 'history' && (
            <HistoryList 
              token={token} 
              analyses={analyses} 
              onSelectAnalysis={handleSelectAnalysis} 
              onRefreshAnalyses={() => { if (token) fetchHistory(token); }} 
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView token={token} onLogout={handleLogout} />
          )}
        </main>

        {/* FOOTER */}
        <footer className="bg-white border-t border-slate-100 py-5 text-center text-[10px] text-slate-400 font-medium print:hidden">
          <p>&copy; 2026 NexVendor AI &bull; Final Year Engineering Project</p>
        </footer>

      </div>

    </div>
  );
}
