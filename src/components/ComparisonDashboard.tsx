import React, { useRef } from 'react';
import { 
  Trophy, Award, CheckCircle, FileText, Printer, ArrowRight, 
  HelpCircle, AlertTriangle, Lightbulb, ClipboardCheck, ArrowUpRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { VendorAnalysis } from '../types';

interface ComparisonDashboardProps {
  analysis: VendorAnalysis;
  onNavigateToEmails: () => void;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ComparisonDashboard({ analysis, onNavigateToEmails }: ComparisonDashboardProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const bestVendor = analysis.bestVendor;
  const tableData = [...analysis.comparisonTable].sort((a, b) => b.totalScore - a.totalScore);

  // Data for Bar Chart: Scores per vendor
  const scoreData = tableData.map(v => ({
    name: v.vendor,
    'Total Score': v.totalScore,
    'Price Score (20)': v.price.includes('$') ? 20 - (parseFloat(v.price.replace(/[$,]/g, '')) / 10000 % 10) : 15, // dynamic or custom breakdown
    'Quality Score (20)': v.quality,
    'Compliance (10)': v.compliance,
    'Support (10)': v.support
  }));

  // Data for Radar Chart (Criteria comparison)
  // Re-map keys so we compare each vendor's attributes
  const criteriaList = [
    { subject: 'Quality', fullMark: 20 },
    { subject: 'Support', fullMark: 10 },
    { subject: 'Experience', fullMark: 10 },
    { subject: 'Compliance', fullMark: 10 },
    { subject: 'Risk (Lower is Better)', fullMark: 5 },
    { subject: 'Innovation', fullMark: 5 },
    { subject: 'Scalability', fullMark: 5 },
  ];

  const radarData = criteriaList.map(c => {
    const item: any = { subject: c.subject };
    tableData.forEach(v => {
      let val = 0;
      if (c.subject === 'Quality') val = v.quality;
      if (c.subject === 'Support') val = v.support;
      if (c.subject === 'Experience') val = v.experience;
      if (c.subject === 'Compliance') val = v.compliance;
      if (c.subject === 'Risk (Lower is Better)') val = v.risk;
      if (c.subject === 'Innovation') val = v.innovation;
      if (c.subject === 'Scalability') val = v.scalability;
      item[v.vendor] = val;
    });
    return item;
  });

  // Data for Pie Chart: Quality weighting or distribution
  const pieData = tableData.map(v => ({
    name: v.vendor,
    value: v.totalScore
  }));

  // Trigger browser-native print which compiles PDF beautifully with custom styles
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans print:bg-white print:p-0 print:m-0" ref={printRef}>
      
      {/* Action panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm print:hidden">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Completed</span>
          <h2 className="text-sm text-slate-500 mt-0.5">Assessed on {new Date(analysis.date).toLocaleDateString()}</h2>
        </div>
        
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* WINNER CARD - HIGHLIGHTED EXECUTIVELY */}
      <div id="print-winner" className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl" />

        <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Top-Ranked Vendor Winner</span>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-extrabold tracking-tight">{bestVendor.name}</h1>
              <p className="text-indigo-200 font-medium text-sm leading-relaxed">{bestVendor.recommendation}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>Key Selection Strengths</span>
                </h3>
                <ul className="space-y-1 text-xs text-indigo-100 list-disc list-inside">
                  {bestVendor.reasons.map((r, i) => <li key={i} className="line-clamp-2">{r}</li>)}
                </ul>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Identified Operational Risks</span>
                </h3>
                <ul className="space-y-1 text-xs text-indigo-100 list-disc list-inside">
                  {bestVendor.possibleRisks.map((risk, i) => <li key={i} className="line-clamp-2">{risk}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 px-6 py-8 rounded-2xl flex flex-col items-center justify-center shrink-0 w-full md:w-44 text-center">
            <Award className="h-12 w-12 text-amber-400 mb-2 animate-bounce" />
            <span className="text-xs text-indigo-200 font-bold tracking-wider uppercase">Weighted Score</span>
            <span className="text-4xl font-display font-extrabold text-white mt-1">{bestVendor.score}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">out of 100 max</span>
          </div>
        </div>
      </div>

      {/* VENDOR COMPARISON TABLE */}
      <div id="print-table" className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <ClipboardCheck className="h-5 w-5 text-indigo-500" />
            <span>Vendor Comparison Matrix</span>
          </h3>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Highest Score Highlighted
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-6">Rank</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Quality (20)</th>
                <th className="py-3.5 px-4">Delivery</th>
                <th className="py-3.5 px-4">Support (10)</th>
                <th className="py-3.5 px-4">Experience (10)</th>
                <th className="py-3.5 px-4">Compliance (10)</th>
                <th className="py-3.5 px-4">Risk (5)</th>
                <th className="py-3.5 px-4">Innov. (5)</th>
                <th className="py-3.5 px-4 text-right pr-6">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {tableData.map((row, index) => {
                const isWinner = row.vendor === bestVendor.name;
                return (
                  <tr 
                    key={row.vendor} 
                    className={`hover:bg-slate-50/50 transition-colors ${
                      isWinner ? 'bg-emerald-50/20 font-medium text-slate-900' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0 
                          ? 'bg-amber-100 text-amber-800' 
                          : index === 1 
                            ? 'bg-slate-100 text-slate-800' 
                            : 'bg-slate-50 text-slate-600'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold">{row.vendor}</td>
                    <td className="py-4 px-4 text-slate-600 font-mono text-xs">{row.price}</td>
                    <td className="py-4 px-4">{row.quality}/20</td>
                    <td className="py-4 px-4 text-slate-600 text-xs">{row.delivery}</td>
                    <td className="py-4 px-4">{row.support}/10</td>
                    <td className="py-4 px-4">{row.experience}/10</td>
                    <td className="py-4 px-4">{row.compliance}/10</td>
                    <td className="py-4 px-4">{row.risk}/5</td>
                    <td className="py-4 px-4">{row.innovation}/5</td>
                    <td className="py-4 px-4 text-right pr-6">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${
                        isWinner 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {row.totalScore}/100
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRAPHIC VISUALIZATIONS SECTION */}
      <div id="print-charts" className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1">
        
        {/* BAR CHART: Overall Vendor Scores */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Scoring Comparison</h4>
            <h3 className="text-sm font-semibold text-slate-800 mt-0.5">Cumulative Factor Totals</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #f1f5f9' }} />
                <Bar dataKey="Total Score" radius={[6, 6, 0, 0]}>
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RADAR CHART: Multicriteria factor comparisons */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Factor Performance Radar</h4>
            <h3 className="text-sm font-semibold text-slate-800 mt-0.5">Multi-criteria Weightings</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 20]} tick={{ fontSize: 8 }} />
                {tableData.map((v, idx) => (
                  <Radar 
                    key={v.vendor} 
                    name={v.vendor} 
                    dataKey={v.vendor} 
                    stroke={COLORS[idx % COLORS.length]} 
                    fill={COLORS[idx % COLORS.length]} 
                    fillOpacity={0.15} 
                  />
                ))}
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LINE/COMPARISON CHART: Scaled trend line of vendors */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Procurement Value Vector</h4>
            <h3 className="text-sm font-semibold text-slate-800 mt-0.5">Score vs Category Scaling</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="Total Score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Quality Score (20)" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: Cumulative Score Share */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score Share Distribution</h4>
            <h3 className="text-sm font-semibold text-slate-800 mt-0.5">Proportional Market Standings</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} pts`} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* REJECTIONS & STRATEGIC ADVISORIES */}
      <div id="print-analysis-details" className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1">
        
        {/* REJECTIONS SECTION */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Rejection Evaluation Statements</span>
          </h3>
          <p className="text-xs text-slate-500">Core reasoning behind non-selection of rival bids:</p>
          
          <div className="space-y-4">
            {analysis.rejections.map((rej, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <h4 className="text-xs font-bold text-slate-700">{rej.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rej.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* IMPROVEMENTS AND STRATEGIC ADVISORY */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-emerald-500" />
            <span>Strategic Vendor Advisory</span>
          </h3>
          <p className="text-xs text-slate-500">Suggestions for candidate negotiations and enhancements:</p>

          <div className="space-y-4">
            {analysis.improvementSuggestions.map((rec, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 border-l-2 border-indigo-500 pl-2">{rec.name}</h4>
                <ul className="space-y-1 pl-4 list-disc list-inside text-xs text-slate-600">
                  {rec.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Proceed Button */}
      <div className="flex justify-end pt-4 border-t border-slate-100 print:hidden">
        <button
          onClick={onNavigateToEmails}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl flex items-center space-x-2 shadow-lg shadow-indigo-100 transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <span>Proceed to Email Generation</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* PRINT-ONLY CSS HELPER FOR BEAUTIFUL MULTIPAGE PDF RENDERS */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            padding: 2cm !important;
          }
          .print\\:hidden, header, sidebar, nav, button {
            display: none !important;
          }
          #print-winner {
            background: #1e1b4b !important;
            color: white !important;
            border-radius: 12px !important;
            box-shadow: none !important;
            page-break-after: avoid;
          }
          #print-table, #print-charts, #print-analysis-details {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            page-break-inside: avoid;
            margin-top: 1.5cm;
          }
          table {
            width: 100% !important;
          }
          th, td {
            border-bottom: 1px solid #e2e8f0 !important;
          }
        }
      `}</style>
    </div>
  );
}
