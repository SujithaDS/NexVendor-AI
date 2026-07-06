import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Edit, Eye, Terminal, Play, RefreshCw } from 'lucide-react';
import { GeneratedEmail } from '../types';

interface EmailDashboardProps {
  token: string;
  analysisId: string;
  emails: GeneratedEmail[];
  onEmailStatusUpdated: () => void;
}

export default function EmailDashboard({ token, analysisId, emails: initialEmails, onEmailStatusUpdated }: EmailDashboardProps) {
  const [emails, setEmails] = useState<GeneratedEmail[]>(initialEmails);
  const [selectedEmailId, setSelectedEmailId] = useState<string>('');
  
  // Email editor state
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [smtpLogs, setSmtpLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(true);

  // Sync state with props or select first email
  useEffect(() => {
    setEmails(initialEmails);
    if (initialEmails.length > 0) {
      // Find the first draft or default to first email
      const activeItem = initialEmails.find(e => e.id === selectedEmailId) || initialEmails[0];
      setSelectedEmailId(activeItem.id);
      setRecipient(activeItem.recipientEmail);
      setSubject(activeItem.subject);
      setBody(activeItem.body);
    }
  }, [initialEmails]);

  // Handle email card selection
  const handleSelectEmail = (email: GeneratedEmail) => {
    setSelectedEmailId(email.id);
    setRecipient(email.recipientEmail);
    setSubject(email.subject);
    setBody(email.body);
  };

  // Synchronize changes to individual inputs back into the bulk list
  const handleRecipientChange = (val: string) => {
    setRecipient(val);
    setEmails(prev => prev.map(e => e.id === selectedEmailId ? { ...e, recipientEmail: val } : e));
  };

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    setEmails(prev => prev.map(e => e.id === selectedEmailId ? { ...e, subject: val } : e));
  };

  const handleBodyChange = (val: string) => {
    setBody(val);
    setEmails(prev => prev.map(e => e.id === selectedEmailId ? { ...e, body: val } : e));
  };

  // Bulk Send Email to All Vendors
  const handleSendAllEmails = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    setSmtpLogs([
      'Initializing bulk JavaMailSender transmission protocol...',
      `Detected ${emails.length} outbox items in workspace queue...`
    ]);
    setShowLogs(true);

    let succeededCount = 0;
    let failedCount = 0;

    const updatedEmails = [...emails];

    for (let i = 0; i < updatedEmails.length; i++) {
      const emailItem = updatedEmails[i];
      
      setSmtpLogs(prev => [
        ...prev,
        `[${i + 1}/${emails.length}] Connecting outbound SMTP relay for ${emailItem.vendorName}...`,
        `Authenticating with secure credentials...`,
        `Transmitting to <${emailItem.recipientEmail}>...`
      ]);

      try {
        // Realistic network latency simulation
        await new Promise(resolve => setTimeout(resolve, 1000));

        const res = await fetch('/api/sendEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            emailId: emailItem.id,
            recipientEmail: emailItem.recipientEmail,
            subject: emailItem.subject,
            body: emailItem.body
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'SMTP envelope rejected');
        }

        emailItem.status = 'sent';
        succeededCount++;
        
        setSmtpLogs(prev => [
          ...prev,
          `✓ SUCCESS: Result email transmitted successfully to ${emailItem.vendorName}.`
        ]);
      } catch (err: any) {
        failedCount++;
        setSmtpLogs(prev => [
          ...prev,
          `❌ SMTP FAILURE for ${emailItem.vendorName}: ${err.message}`
        ]);
      }
    }

    setEmails(updatedEmails);
    
    // Auto-update fields in current editor view
    const currentlySelected = updatedEmails.find(e => e.id === selectedEmailId);
    if (currentlySelected) {
      setRecipient(currentlySelected.recipientEmail);
      setSubject(currentlySelected.subject);
      setBody(currentlySelected.body);
    }

    if (failedCount === 0) {
      setSuccessMsg(`All ${succeededCount} vendor result emails have been successfully dispatched!`);
    } else {
      setErrorMsg(`Bulk dispatch finished with warnings: ${succeededCount} delivered, ${failedCount} failed.`);
    }

    onEmailStatusUpdated();
    setLoading(false);
  };

  const activeEmail = emails.find(e => e.id === selectedEmailId);

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* BULK DISPATCH ACTION CONSOLE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Communication Hub</span>
          <h2 className="text-sm font-semibold text-slate-700">
            Outbox Status: <strong className="text-indigo-600">{emails.filter(e => e.status !== 'sent').length} Drafts</strong> ready for bulk dispatch.
          </h2>
        </div>
        
        <button
          onClick={handleSendAllEmails}
          disabled={loading || emails.length === 0}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-100 transition-all cursor-pointer hover:-translate-y-0.5"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Transmitting Bulk Letters...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Send Emails to All Vendors</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SIDEBAR: Outbox Queue */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Outbox Items</h3>
          
          <div className="space-y-2.5">
            {emails.map(email => {
              const isSelected = email.id === selectedEmailId;
              const isSent = email.status === 'sent';
              
              return (
                <button
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' 
                      : 'bg-white hover:bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      email.type === 'selected' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {email.type === 'selected' ? 'Winner selected' : 'Rejected'}
                    </span>

                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      isSent ? 'text-emerald-600' : 'text-amber-500'
                    }`}>
                      {isSent ? 'Sent' : 'Draft'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 mt-2 truncate">{email.vendorName}</h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{email.recipientEmail}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* EMAIL WORKSPACE PANEL */}
        <div className="md:col-span-2 space-y-4">
          {activeEmail ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <Edit className="h-3.5 w-3.5" />
                  <span>Email Editor Workspace (Individual Customization)</span>
                </span>
                
                <span className="text-xs font-semibold text-slate-400">
                  Status: <strong className={activeEmail.status === 'sent' ? 'text-emerald-600' : 'text-amber-500'}>
                    {activeEmail.status.toUpperCase()}
                  </strong>
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1">
                {successMsg && (
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-md flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-700 font-medium">{successMsg}</p>
                  </div>
                )}

                {errorMsg && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
                  </div>
                )}

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">To (Recipient Email)</label>
                    <input
                      type="email"
                      value={recipient}
                      onChange={(e) => handleRecipientChange(e.target.value)}
                      disabled={activeEmail.status === 'sent' || loading}
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject Line</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      disabled={activeEmail.status === 'sent' || loading}
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Letter Body</label>
                    <textarea
                      value={body}
                      onChange={(e) => handleBodyChange(e.target.value)}
                      disabled={activeEmail.status === 'sent' || loading}
                      rows={12}
                      className="mt-1 block w-full px-3.5 py-3 border border-slate-200 rounded-lg text-xs text-slate-700 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center space-x-1 cursor-pointer"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>{showLogs ? 'Hide transport logs' : 'Show JavaMail logs'}</span>
                </button>
              </div>

              {/* Simulated SMTP Connection Console logs */}
              {showLogs && smtpLogs.length > 0 && (
                <div className="bg-slate-900 p-4 border-t border-slate-800 font-mono text-[10px] text-emerald-400 space-y-1 overflow-y-auto max-h-40">
                  <div className="flex items-center space-x-2 text-slate-400 border-b border-slate-800 pb-1 mb-1">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>SMTP Bulk Outbound Console (JavaMailSender Simulator)</span>
                  </div>
                  {smtpLogs.map((log, idx) => (
                    <div key={idx} className={log.includes('FAILURE') || log.includes('❌') ? 'text-red-400' : ''}>
                      &gt; {log}
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
              <Mail className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium">Select a recipient from the outbox queue to edit details.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
