import React, { useState, useEffect, useReducer, useRef } from 'react';

// --- MOCK DATA ---
const MOCK_APPLICANTS = [
  { id: 1, name: 'Alice Chen', income: 125000, credit_score: 780, loan_amount: 50000, employment_years: 5.5, prior_default: false, status: 'Approved' },
  { id: 2, name: 'Marcus Johnson', income: 65000, credit_score: 610, loan_amount: 40000, employment_years: 1.2, prior_default: true, status: 'Rejected' },
  { id: 3, name: 'Sophia Martinez', income: 98000, credit_score: 720, loan_amount: 25000, employment_years: 3.0, prior_default: false, status: 'Approved' },
  { id: 4, name: 'David Kim', income: 45000, credit_score: 580, loan_amount: 30000, employment_years: 0.5, prior_default: false, status: 'Rejected' },
  { id: 5, name: 'Emma Wilson', income: 150000, credit_score: 810, loan_amount: 100000, employment_years: 8.0, prior_default: false, status: 'Approved' },
  { id: 6, name: 'James Taylor', income: 72000, credit_score: 640, loan_amount: 20000, employment_years: 2.5, prior_default: false, status: 'Approved' },
  { id: 7, name: 'Olivia Brown', income: 55000, credit_score: 590, loan_amount: 35000, employment_years: 1.0, prior_default: true, status: 'Rejected' },
  { id: 8, name: 'William Davis', income: 110000, credit_score: 750, loan_amount: 60000, employment_years: 4.5, prior_default: false, status: 'Approved' },
  { id: 9, name: 'Isabella White', income: 85000, credit_score: 690, loan_amount: 15000, employment_years: 6.0, prior_default: false, status: 'Approved' },
  { id: 10, name: 'Ethan Harris', income: 40000, credit_score: 550, loan_amount: 25000, employment_years: 0.8, prior_default: true, status: 'Rejected' },
  { id: 11, name: 'Mia Martin', income: 92000, credit_score: 710, loan_amount: 45000, employment_years: 3.5, prior_default: false, status: 'Approved' },
  { id: 12, name: 'Alexander Thompson', income: 135000, credit_score: 790, loan_amount: 80000, employment_years: 7.0, prior_default: false, status: 'Approved' },
  { id: 13, name: 'Charlotte Garcia', income: 68000, credit_score: 630, loan_amount: 10000, employment_years: 2.0, prior_default: false, status: 'Approved' },
  { id: 14, name: 'Benjamin Robinson', income: 50000, credit_score: 570, loan_amount: 40000, employment_years: 1.5, prior_default: true, status: 'Rejected' },
  { id: 15, name: 'Amelia Clark', income: 105000, credit_score: 740, loan_amount: 55000, employment_years: 5.0, prior_default: false, status: 'Approved' }
];

// --- ML LOGIC ---
const mlPredict = (data) => {
  const { income, credit_score, loan_amount, employment_years, prior_default } = data;
  let score = 0;
  if (income > loan_amount * 1.5) score += 1;
  if (credit_score > 650) score += 1;
  if (employment_years >= 2) score += 1;
  if (prior_default) score -= 3;
  return score >= 2 ? 'Approved' : 'Rejected';
};

// --- REDUCER ---
const actionTypes = {
  ADD_APPLICANT: 'ADD_APPLICANT',
  DELETE_APPLICANT: 'DELETE_APPLICANT',
  SET_VIEW: 'SET_VIEW'
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_APPLICANT:
      return { ...state, applicants: [action.payload, ...state.applicants] };
    case actionTypes.DELETE_APPLICANT:
      return { ...state, applicants: state.applicants.filter(a => a.id !== action.payload) };
    case actionTypes.SET_VIEW:
      return { ...state, view: action.payload };
    default:
      return state;
  }
};

// --- COMPONENTS ---

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-[#10B981] text-[#0A0E1A]',
    error: 'bg-[#EF4444] text-white',
    info: 'bg-[#3B82F6] text-white'
  };

  return (
    <div className={`fixed bottom-6 right-6 ${colors[type]} px-6 py-3 rounded-lg shadow-lg font-['Sora'] font-medium animate-slide-up z-50 flex items-center gap-3 backdrop-blur-md`}>
      {type === 'success' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
      {type === 'error' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
      {message}
    </div>
  );
};

// Main App Component
export default function FinCoreSPA() {
  const [state, dispatch] = useReducer(reducer, { applicants: MOCK_APPLICANTS, view: 'dashboard' });
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Inject Tailwind CDN if not present
    if (!document.getElementById('tailwind-script')) {
      const script = document.createElement('script');
      script.id = 'tailwind-script';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const renderView = () => {
    switch (state.view) {
      case 'dashboard': return <DashboardView applicants={state.applicants} dispatch={dispatch} showToast={showToast} getInitials={getInitials} />;
      case 'add': return <AddApplicantView dispatch={dispatch} showToast={showToast} />;
      case 'simulator': return <SimulatorView />;
      default: return null;
    }
  };

  return (
    <>
      {/* GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@300;400;500;600;700&display=swap');
        
        :root {
          --bg-page: #0A0E1A;
          --bg-sidebar: #0F1629;
          --bg-card: #141C35;
          --accent: #3B82F6;
          --success: #10B981;
          --danger: #EF4444;
          --warning: #F59E0B;
        }

        body {
          background-color: var(--bg-page);
          color: white;
          font-family: 'Sora', sans-serif;
          margin: 0;
          overflow-x: hidden;
        }

        .font-mono { font-family: 'IBM Plex Mono', monospace !important; }

        .bg-grid-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: radial-gradient(circle, rgba(59, 130, 246, 0.15) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
          z-index: 0;
        }

        .glass-card {
          background: rgba(20, 28, 53, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        /* ANIMATIONS */
        @keyframes slideUpFade {
          0% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slideUpFade 0.3s ease-out forwards; }

        @keyframes fillWidth {
          0% { width: 0%; }
        }
        .animate-fill-width { animation: fillWidth 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .animate-pulse-dot { animation: pulseDot 2s infinite; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .btn-shimmer:hover {
          background: linear-gradient(90deg, var(--accent) 0%, #60A5FA 50%, var(--accent) 100%);
          background-size: 200% auto;
          animation: shimmer 1.5s linear infinite;
        }

        /* CUSTOM SCROLLBAR */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg-page); }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }

        /* INPUT FIXES */
        input:focus, button:focus { outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      <div className="bg-grid-overlay"></div>

      <div className="flex h-screen relative z-10">
        {/* SIDEBAR */}
        <div className={`bg-[#0F1629] border-r border-white/5 transition-all duration-300 flex flex-col ${sidebarExpanded ? 'w-60' : 'w-16'}`}>
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className={`font-bold text-lg tracking-wide transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>FinCore</span>
            </div>
            {sidebarExpanded && (
              <button onClick={() => setSidebarExpanded(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
              </button>
            )}
            {!sidebarExpanded && (
              <button onClick={() => setSidebarExpanded(true)} className="absolute -right-3 top-5 bg-[#141C35] border border-white/10 rounded-full p-1 text-gray-400 hover:text-white z-20">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>

          <div className="flex-1 py-6 flex flex-col gap-2 px-2">
            {[
              { id: 'dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', label: 'Registry' },
              { id: 'add', icon: 'M12 4v16m8-8H4', label: 'Add Applicant' },
              { id: 'simulator', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', label: 'Simulator' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => dispatch({ type: actionTypes.SET_VIEW, payload: item.id })}
                className={`relative flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${state.view === item.id ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                title={!sidebarExpanded ? item.label : ''}
              >
                {state.view === item.id && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#3B82F6] rounded-r-md shadow-[0_0_10px_#3B82F6]"></div>}
                <svg className={`w-5 h-5 shrink-0 ${state.view === item.id ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className={`ml-3 font-medium whitespace-nowrap transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-white/5">
            <div className={`flex items-center gap-3 ${sidebarExpanded ? '' : 'justify-center'}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse-dot shrink-0"></div>
              <span className={`text-xs text-gray-400 font-mono transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden hidden'}`}>ML Model: Online</span>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* TOPBAR */}
          <div className="h-16 border-b border-white/5 glass-card !border-x-0 !border-t-0 !rounded-none flex items-center justify-between px-6 shrink-0 z-20 relative">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-white capitalize">{state.view === 'add' ? 'Add Applicant' : state.view}</h1>
              <div className="hidden md:flex items-center text-sm text-gray-500 font-mono">
                <span>/</span><span className="mx-2 text-gray-400">FinCore</span><span>/</span><span className="mx-2 text-[#3B82F6] capitalize">{state.view}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative hidden md:block">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search applicants..." className="bg-[#0F1629] border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white placeholder-gray-500 focus:border-[#3B82F6]/50 w-64 transition-colors" />
              </div>
              <button className="relative text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute 0 right-0 w-2 h-2 bg-[#EF4444] rounded-full border border-[#0A0E1A]"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-sm font-bold shadow-lg border border-white/10">AJ</div>
            </div>
          </div>

          {/* PAGE CONTENT */}
          <div className="flex-1 overflow-auto p-6 scroll-smooth">
            {renderView()}
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

// --- SUBVIEWS ---

function DashboardView({ applicants, dispatch, showToast, getInitials }) {
  const stats = [
    { label: 'Total Applicants', value: applicants.length, color: 'text-white' },
    { label: 'Approved', value: applicants.filter(a => a.status === 'Approved').length, color: 'text-[#10B981]' },
    { label: 'Rejected', value: applicants.filter(a => a.status === 'Rejected').length, color: 'text-[#EF4444]' },
    { label: 'High Risk (Defaulted)', value: applicants.filter(a => a.prior_default).length, color: 'text-[#F59E0B]' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 animate-slide-up flex flex-col justify-center relative overflow-hidden group" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
            </div>
            <span className="text-gray-400 text-sm font-medium mb-1">{stat.label}</span>
            <span className={`text-3xl font-mono font-semibold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="glass-card animate-slide-up" style={{ animationDelay: '320ms' }}>
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Applicant Registry</h2>
          <button onClick={() => dispatch({ type: actionTypes.SET_VIEW, payload: 'add' })} className="bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#3B82F6]/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 font-medium">Applicant</th>
                <th className="px-6 py-4 font-medium">Income</th>
                <th className="px-6 py-4 font-medium">Credit Score</th>
                <th className="px-6 py-4 font-medium">Req. Amount</th>
                <th className="px-6 py-4 font-medium">Exp.</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {applicants.map((app, i) => (
                <tr key={app.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group relative animate-slide-up" style={{ animationDelay: `${400 + (i * 30)}ms` }}>
                  {/* Subtle left border flash on hover */}
                  <td className="absolute left-0 top-0 bottom-0 w-0.5 bg-transparent group-hover:bg-[#3B82F6] transition-colors"></td>
                  
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                      {getInitials(app.name)}
                    </div>
                    <span className="font-medium text-white">{app.name}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-300">${app.income.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-300 w-8">{app.credit_score}</span>
                      <div className="w-16 h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                        <div className={`h-full animate-fill-width ${app.credit_score > 700 ? 'bg-[#10B981]' : app.credit_score > 600 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}`} style={{ width: `${(app.credit_score / 850) * 100}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-300">${app.loan_amount.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-gray-300">{app.employment_years}y</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${app.status === 'Approved' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'}`}>
                      {app.status}
                    </span>
                    {app.prior_default && (
                      <span className="w-5 h-5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center border border-[#F59E0B]/30 tooltip" title="Prior Default">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => {
                      dispatch({ type: actionTypes.DELETE_APPLICANT, payload: app.id });
                      showToast('Applicant removed successfully', 'error');
                    }} className="text-gray-500 hover:text-[#EF4444] transition-colors p-1 opacity-0 group-hover:opacity-100 transform active:scale-90">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {applicants.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    <p>No applicants found. Add one to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AddApplicantView({ dispatch, showToast }) {
  const [formData, setFormData] = useState({ name: '', income: '', credit_score: '', loan_amount: '', employment_years: '', prior_default: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      const data = {
        id: Date.now(),
        name: formData.name,
        income: Number(formData.income),
        credit_score: Number(formData.credit_score),
        loan_amount: Number(formData.loan_amount),
        employment_years: Number(formData.employment_years),
        prior_default: formData.prior_default,
      };
      data.status = mlPredict(data);
      
      dispatch({ type: actionTypes.ADD_APPLICANT, payload: data });
      showToast(`Applicant ${data.status} by ML Model`, data.status === 'Approved' ? 'success' : 'error');
      dispatch({ type: actionTypes.SET_VIEW, payload: 'dashboard' });
    }, 600); // simulate network/ML processing delay
  };

  const InputField = ({ label, name, type = 'text', prefix, suffix, ...props }) => (
    <div className="mb-5 relative">
      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-gray-500 font-mono text-sm">{prefix}</span>}
        <input 
          type={type} name={name} required
          className={`w-full bg-[#0A0E1A] border border-white/10 rounded-lg text-white font-mono text-sm focus:border-[#3B82F6] transition-colors py-2.5 ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-10' : 'pr-4'}`}
          value={formData[name]}
          onChange={(e) => setFormData({...formData, [name]: e.target.value})}
          {...props}
        />
        {suffix && <span className="absolute right-3 text-gray-500 font-mono text-sm">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 animate-slide-up pb-10">
      {/* FORM COLUMN */}
      <div className="flex-[3] glass-card p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
           <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           Application Data Entry
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5 relative">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Full Legal Name</label>
            <input 
              type="text" required
              className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg text-white text-sm focus:border-[#3B82F6] transition-colors py-2.5 px-4 font-sans"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InputField label="Annual Income" name="income" type="number" prefix="$" min="0" />
            <InputField label="Credit Score" name="credit_score" type="number" min="300" max="850" />
            <InputField label="Loan Amount" name="loan_amount" type="number" prefix="$" min="0" />
            <InputField label="Employment History" name="employment_years" type="number" suffix="YRS" min="0" step="0.1" />
          </div>

          <div className="mt-2 mb-8">
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Risk Flags</label>
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all flex items-center gap-4 ${formData.prior_default ? 'bg-[#EF4444]/10 border-[#EF4444]/50' : 'bg-[#0A0E1A] border-white/10 hover:border-white/20'}`}
              onClick={() => setFormData({...formData, prior_default: !formData.prior_default})}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.prior_default ? 'bg-[#EF4444] border-[#EF4444]' : 'border-gray-500'}`}>
                {formData.prior_default && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <div>
                <p className={`text-sm font-medium ${formData.prior_default ? 'text-[#EF4444]' : 'text-gray-300'}`}>Prior Default History</p>
                <p className="text-xs text-gray-500 mt-0.5">Applicant has defaulted on a loan in the past 7 years.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/5">
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium py-2.5 rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 btn-shimmer disabled:opacity-70 disabled:cursor-wait">
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>Run Assessment <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
              )}
            </button>
            <button type="button" onClick={() => dispatch({ type: actionTypes.SET_VIEW, payload: 'dashboard' })} className="px-6 bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 font-medium py-2.5 rounded-lg transition-all transform active:scale-95">
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* INFO COLUMN */}
      <div className="flex-[2] flex flex-col gap-4">
        <div className="glass-card p-6 border-t-4 !border-[#3B82F6]">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ML Model Criteria
          </h3>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            FinCore's internal evaluation engine uses historical data points to predict risk. Submitting this form runs the data against our Random Forest topology in real-time.
          </p>
          
          <div className="space-y-4">
            {[
              { label: 'Debt-to-Income Ratio', desc: 'Income must exceed 1.5x loan req', color: 'bg-green-500' },
              { label: 'FICO Baseline', desc: 'Scores > 650 are heavily weighted', color: 'bg-blue-500' },
              { label: 'Job Stability', desc: '2+ years exp reduces risk factor', color: 'bg-purple-500' },
              { label: 'Derogatory Marks', desc: 'Prior defaults are a critical penalty', color: 'bg-red-500' }
            ].map((f, i) => (
              <div key={i} className="bg-[#0A0E1A] rounded-lg p-3 border border-white/5 flex gap-3 items-center">
                <div className={`w-1 h-8 rounded-full ${f.color}`}></div>
                <div>
                  <p className="text-xs font-semibold text-gray-200">{f.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimulatorView() {
  const [formData, setFormData] = useState({ income: '', credit_score: '', loan_amount: '', employment_years: '', prior_default: false });
  const [result, setResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = (e) => {
    e.preventDefault();
    setResult(null);
    setIsSimulating(true);
    
    setTimeout(() => {
      const data = {
        income: Number(formData.income), credit_score: Number(formData.credit_score),
        loan_amount: Number(formData.loan_amount), employment_years: Number(formData.employment_years),
        prior_default: formData.prior_default
      };
      setResult(mlPredict(data));
      setIsSimulating(false);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 animate-slide-up pb-10 h-full">
      <div className="flex-[1] glass-card p-6 flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Live Risk Simulator
          </h2>
          <p className="text-sm text-gray-400 mt-1">Test edge cases without saving to DB.</p>
        </div>

        <form onSubmit={handleSimulate} className="flex-1 flex flex-col">
          <div className="grid grid-cols-1 gap-4 mb-6">
             <div className="relative">
              <input type="number" required placeholder="Income" className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg text-white font-mono text-sm focus:border-[#3B82F6] transition-colors py-2.5 pl-8 pr-4" value={formData.income} onChange={(e) => setFormData({...formData, income: e.target.value})} />
              <span className="absolute left-3 top-2.5 text-gray-500 font-mono text-sm">$</span>
            </div>
            <div className="relative">
              <input type="number" required placeholder="Credit Score" min="300" max="850" className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg text-white font-mono text-sm focus:border-[#3B82F6] transition-colors py-2.5 pl-4 pr-4" value={formData.credit_score} onChange={(e) => setFormData({...formData, credit_score: e.target.value})} />
            </div>
            <div className="relative">
              <input type="number" required placeholder="Loan Amount" className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg text-white font-mono text-sm focus:border-[#3B82F6] transition-colors py-2.5 pl-8 pr-4" value={formData.loan_amount} onChange={(e) => setFormData({...formData, loan_amount: e.target.value})} />
              <span className="absolute left-3 top-2.5 text-gray-500 font-mono text-sm">$</span>
            </div>
            <div className="relative">
              <input type="number" required placeholder="Employment Years" step="0.1" className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg text-white font-mono text-sm focus:border-[#3B82F6] transition-colors py-2.5 pl-4 pr-10" value={formData.employment_years} onChange={(e) => setFormData({...formData, employment_years: e.target.value})} />
              <span className="absolute right-3 top-2.5 text-gray-500 font-mono text-sm">YR</span>
            </div>
            
            <div className={`border rounded-lg p-3 cursor-pointer transition-all flex items-center gap-3 ${formData.prior_default ? 'bg-[#EF4444]/10 border-[#EF4444]/50' : 'bg-[#0A0E1A] border-white/10'}`} onClick={() => setFormData({...formData, prior_default: !formData.prior_default})}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.prior_default ? 'bg-[#EF4444] border-[#EF4444]' : 'border-gray-500'}`}>
                {formData.prior_default && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className={`text-sm ${formData.prior_default ? 'text-[#EF4444]' : 'text-gray-400'}`}>Prior Default</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-white/5">
             <button type="submit" disabled={isSimulating} className="w-full bg-[#1E293B] hover:bg-[#334155] text-white border border-white/10 font-medium py-3 rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 group">
              {isSimulating ? (
                 <svg className="animate-spin h-5 w-5 text-[#3B82F6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <>Run Simulation <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="flex-[1] glass-card flex flex-col items-center justify-center p-8 relative overflow-hidden min-h-[400px]">
        {/* Background glow based on result */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] opacity-20 transition-all duration-700 ${result === 'Approved' ? 'bg-[#10B981]' : result === 'Rejected' ? 'bg-[#EF4444]' : 'bg-[#3B82F6]'}`}></div>

        {!result && !isSimulating && (
          <div className="text-center z-10 animate-slide-up">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
            <h3 className="text-gray-400 font-medium">Awaiting Input</h3>
            <p className="text-xs text-gray-500 mt-2">Model ready for execution</p>
          </div>
        )}

        {isSimulating && (
           <div className="text-center z-10">
             <div className="w-16 h-16 mx-auto mb-4 relative">
               <div className="absolute inset-0 border-4 border-[#3B82F6]/20 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-[#3B82F6] rounded-full border-t-transparent animate-spin"></div>
             </div>
             <h3 className="text-[#3B82F6] font-medium font-mono text-sm tracking-widest uppercase">Analyzing</h3>
           </div>
        )}

        {result && !isSimulating && (
          <div className="text-center z-10 w-full animate-slide-up">
            {result === 'Approved' ? (
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-[#10B981]/20 rounded-full animate-ping opacity-75"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-[#10B981]/10 border-2 border-[#10B981] rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <svg className="w-10 h-10 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
            ) : (
              <div className="relative w-24 h-24 mx-auto mb-6 animate-shake">
                <div className="relative flex items-center justify-center w-full h-full bg-[#EF4444]/10 border-2 border-[#EF4444] rounded-full shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                  <svg className="w-10 h-10 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
              </div>
            )}
            
            <h2 className={`text-3xl font-bold tracking-wide mb-1 ${result === 'Approved' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{result}</h2>
            <p className="text-gray-400 text-sm mb-8">Confidence Score: <span className="font-mono text-white">{(Math.random() * 15 + 84).toFixed(1)}%</span></p>

            <div className="text-left space-y-3 w-full max-w-xs mx-auto">
              <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Feature Importance</h4>
              {['Income Ratio', 'Credit Profile', 'History', 'Derogatory'].map((f, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-mono uppercase">
                    <span>{f}</span>
                    <span>{['45%', '25%', '15%', '15%'][i]}</span>
                  </div>
                  <div className="h-1 w-full bg-[#0A0E1A] rounded-full overflow-hidden">
                    <div className="h-full bg-gray-600 animate-fill-width" style={{ width: ['45%', '25%', '15%', '15%'][i], backgroundColor: result === 'Approved' ? '#10B981' : '#EF4444', opacity: 1 - (i*0.2) }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
