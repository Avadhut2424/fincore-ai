import React, { useState, useEffect, useReducer, useRef } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Papa from 'papaparse';

const API_BASE_URL = 'http://localhost:8000/api';

// --- REDUCER ---
const actionTypes = {
  ADD_APPLICANT: 'ADD_APPLICANT',
  ADD_MULTIPLE: 'ADD_MULTIPLE',
  DELETE_APPLICANT: 'DELETE_APPLICANT',
  UPDATE_STATUS: 'UPDATE_STATUS',
  SET_VIEW: 'SET_VIEW',
  LOAD_DATA: 'LOAD_DATA'
};

const reducer = (state, action) => {
  let newState;
  switch (action.type) {
    case actionTypes.LOAD_DATA:
      return { ...state, applicants: action.payload };
    case actionTypes.ADD_APPLICANT:
      newState = { ...state, applicants: [action.payload, ...state.applicants] };
      break;
    case actionTypes.ADD_MULTIPLE:
      newState = { ...state, applicants: [...action.payload, ...state.applicants] };
      break;
    case actionTypes.DELETE_APPLICANT:
      newState = { ...state, applicants: state.applicants.filter(a => a.id !== action.payload) };
      break;
    case actionTypes.UPDATE_STATUS:
      newState = { ...state, applicants: state.applicants.map(a => a.id === action.payload.id ? { ...a, status: action.payload.status } : a) };
      break;
    case actionTypes.SET_VIEW:
      return { ...state, view: action.payload };
    default:
      return state;
  }
  return newState;
};

// --- COMPONENTS ---

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = { success: 'bg-[#10B981] text-[#0A0E1A]', error: 'bg-[#EF4444] text-white', info: 'bg-[#3B82F6] text-white', warning: 'bg-[#F59E0B] text-[#0A0E1A]' };

  return (
    <div className={`fixed bottom-6 right-6 ${colors[type]} px-6 py-3 rounded-lg shadow-lg font-['Sora'] font-medium animate-slide-up z-50 flex items-center gap-3 backdrop-blur-md`}>
      {message}
    </div>
  );
};

// Authentication View
const LoginView = ({ onLogin }) => {
  const [role, setRole] = useState('Analyst');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'Admin' && pin !== '0000') {
      setError('Invalid Admin PIN (Hint: 0000)');
      return;
    }
    onLogin({ name: role === 'Admin' ? 'Chief Officer' : 'Risk Analyst', role });
  };

  return (
    <div className="min-h-screen flex bg-[#0A0E1A] overflow-hidden">
      {/* LEFT COLUMN: FORM */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-24 relative z-10 lg:max-w-xl xl:max-w-2xl border-r border-white/5 bg-[#0A0E1A]">
        <div className="absolute inset-0 bg-grid-overlay opacity-50"></div>
        
        <div className="relative z-10 animate-slide-up max-w-sm w-full mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="font-bold text-2xl tracking-wide text-white font-['Sora']">FinCore</span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 font-['Sora']">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-10">Access the Enterprise Risk Management Platform.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Access Level</label>
              <div className="flex gap-4">
                <button type="button" onClick={() => setRole('Analyst')} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center gap-2 ${role === 'Analyst' ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-white/5 bg-[#0F1629] text-gray-400 hover:border-white/20'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Analyst
                </button>
                <button type="button" onClick={() => setRole('Admin')} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center gap-2 ${role === 'Admin' ? 'bg-[#F59E0B]/10 border-[#F59E0B] text-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-white/5 bg-[#0F1629] text-gray-400 hover:border-white/20'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Admin
                </button>
              </div>
            </div>

            {role === 'Admin' && (
              <div className="animate-slide-up">
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Security PIN</label>
                <div className="relative">
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  <input type="password" value={pin} onChange={(e) => { setPin(e.target.value); setError(''); }} placeholder="Enter 0000" className="w-full bg-[#0F1629] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-mono focus:border-[#F59E0B] transition-colors" />
                </div>
                {error && <p className="text-[#EF4444] text-xs mt-2 font-medium">{error}</p>}
              </div>
            )}

            <button type="submit" className={`w-full py-3.5 rounded-xl text-white font-medium transition-all shadow-lg mt-4 flex items-center justify-center gap-2 group ${role === 'Admin' ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309]' : 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8]'}`}>
              Authenticate
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>

          <div className="mt-16 border-t border-white/5 pt-8">
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-4">Integrated Data Partners</p>
            <div className="flex gap-6 opacity-40 grayscale">
              {/* Fake abstract logos */}
              <svg className="h-6 w-auto" viewBox="0 0 100 30" fill="currentColor"><path d="M10 15a5 5 0 100-10 5 5 0 000 10zm15 0a5 5 0 100-10 5 5 0 000 10zm15 0a5 5 0 100-10 5 5 0 000 10z"/><text x="45" y="18" fontSize="14" fontWeight="bold" fontFamily="sans-serif">EquiData</text></svg>
              <svg className="h-6 w-auto" viewBox="0 0 100 30" fill="currentColor"><path d="M0 20L10 0l10 20H0z"/><text x="25" y="16" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Apex Risk</text></svg>
              <svg className="h-6 w-auto" viewBox="0 0 100 30" fill="currentColor"><rect width="10" height="20" rx="2" y="0"/><rect width="10" height="12" rx="2" x="14" y="8"/><text x="30" y="16" fontSize="14" fontWeight="bold" fontFamily="sans-serif">FlowFi</text></svg>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: HERO GRAPHIC */}
      <div className="hidden lg:flex flex-1 relative bg-[#0F1629] overflow-hidden items-center justify-center">
        {/* Abstract Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3B82F6] rounded-full blur-[150px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8B5CF6] rounded-full blur-[150px] opacity-20" style={{ animation: 'pulse 4s infinite alternate' }}></div>
        
        {/* Grid pattern over the glow */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQgMzBoNnYzMGgtNlYzMHptMC0zMGg2djMwaC02VjB6TTI0IDMwaDZ2MzBoLTZWMzB6bTAtMzBoNnYzMGgtNlYwek0wIDMwaDZ2MzBIMFYzMHptMC0zMGg2djMwSDBWMHpNMzAgNTR2NmgtMzB2LTZoMzB6TTAgMjR2NmgzMHYtNkgwem0zMCAzMHY2SDYwdi02SDMwem0wLTMwdjZoMzB2LTZIMzB6IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-50"></div>

        <div className="relative z-10 max-w-lg p-12 glass-card border-white/10 backdrop-blur-xl">
          <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h3 className="text-3xl font-bold text-white mb-4 leading-tight font-['Sora']">Decision intelligence for modern lenders.</h3>
          <p className="text-gray-400 leading-relaxed mb-8">
            FinCore's machine learning topologies analyze thousands of data points instantly, returning high-confidence risk assessments that empower your underwriting team to approve faster and safer.
          </p>
          <div className="flex items-center gap-4 text-sm font-mono text-[#3B82F6]">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse"></div> 99.9% Uptime</span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" /></svg> 800ms Latency</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function FinCoreSPA() {
  const [user, setUser] = useState(null);
  const [state, dispatch] = useReducer(reducer, { applicants: [], view: 'dashboard' });
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Fetch Data Warehouse
  useEffect(() => {
    fetch(`${API_BASE_URL}/applicants`)
      .then(res => res.json())
      .then(data => dispatch({ type: actionTypes.LOAD_DATA, payload: data }))
      .catch(err => console.error("API Error:", err));
  }, []);

  useEffect(() => {
    if (!document.getElementById('tailwind-script')) {
      const script = document.createElement('script');
      script.id = 'tailwind-script';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
      document.documentElement.style.backgroundColor = '#0A0E1A'; 
    } else {
      document.documentElement.style.filter = 'none';
      document.documentElement.style.backgroundColor = '';
    }
  }, [theme]);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  if (!user) {
    return <><style>{globalStyles}</style><LoginView onLogin={setUser} /></>;
  }

  const renderView = () => {
    switch (state.view) {
      case 'dashboard': return <DashboardView applicants={state.applicants} dispatch={dispatch} showToast={showToast} getInitials={getInitials} user={user} />;
      case 'analytics': return <AnalyticsView applicants={state.applicants} />;
      case 'add': return <AddApplicantView dispatch={dispatch} showToast={showToast} />;
      case 'simulator': return <SimulatorView />;
      default: return null;
    }
  };

  return (
    <>
      <style>{globalStyles}</style>
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
              { id: 'analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Analytics' },
              { id: 'add', icon: 'M12 4v16m8-8H4', label: 'Add Applicant' },
              { id: 'simulator', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', label: 'Simulator' }
            ].map(item => (
              <button key={item.id} onClick={() => dispatch({ type: actionTypes.SET_VIEW, payload: item.id })} className={`relative flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${state.view === item.id ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`} title={!sidebarExpanded ? item.label : ''}>
                {state.view === item.id && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#3B82F6] rounded-r-md shadow-[0_0_10px_#3B82F6]"></div>}
                <svg className={`w-5 h-5 shrink-0 ${state.view === item.id ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                <span className={`ml-3 font-medium whitespace-nowrap transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 flex justify-center">
            <button onClick={() => setUser(null)} className={`flex items-center text-gray-500 hover:text-[#EF4444] transition-colors ${sidebarExpanded ? 'w-full justify-start px-2 py-2 gap-3' : 'justify-center p-2'}`} title="Logout">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {sidebarExpanded && <span className="font-medium text-sm">Logout</span>}
            </button>
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
              <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="relative text-gray-400 hover:text-white transition-colors" title="Toggle Theme">
                {theme === 'dark' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${user.role === 'Admin' ? 'text-[#F59E0B]' : 'text-[#3B82F6]'}`}>{user.role}</p>
                </div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 ${user.role === 'Admin' ? 'bg-gradient-to-tr from-[#F59E0B] to-[#EF4444] border-[#F59E0B]/30' : 'bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] border-[#3B82F6]/30'}`}>
                  {getInitials(user.name)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6 scroll-smooth">
            {renderView()}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

// --- SUBVIEWS ---

function DashboardView({ applicants, dispatch, showToast, getInitials, user }) {
  const fileInputRef = useRef(null);

  const stats = [
    { label: 'Total Portfolio', value: applicants.length, color: 'text-white', bg: 'bg-[#3B82F6]/10', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { label: 'Approved Value', value: '$' + (applicants.filter(a => a.status === 'Approved').reduce((acc, a) => acc + a.loan_amount, 0) / 1000).toFixed(1) + 'k', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Needs Review', value: applicants.filter(a => a.status === 'Review').length, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { label: 'Rejection Rate', value: ((applicants.filter(a => a.status === 'Rejected').length / Math.max(1, applicants.length)) * 100).toFixed(1) + '%', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const handleExport = () => {
    const csv = Papa.unparse(applicants);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FinCore_Export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('Registry exported successfully', 'info');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
          const promises = results.data.map(row => {
            const data = {
              name: row.name || 'Unknown', income: Number(row.income) || 0, credit_score: Number(row.credit_score) || 0,
              loan_amount: Number(row.loan_amount) || 0, employment_years: Number(row.employment_years) || 0, prior_default: row.prior_default === 'true' || row.prior_default === true
            };
            return fetch('http://localhost:8000/api/applicants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          });
          Promise.all(promises).then(() => {
             fetch('http://localhost:8000/api/applicants').then(r=>r.json()).then(list => {
               dispatch({ type: actionTypes.LOAD_DATA, payload: list });
               showToast(`Imported & processed ${results.data.length} records via API`, 'success');
             });
          });
        }
      });
    }
  };

  const renderStatus = (status) => {
    if (status === 'Approved') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border inline-flex bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20">Approved</span>;
    if (status === 'Rejected') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border inline-flex bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20">Rejected</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border inline-flex bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20 animate-pulse">Review</span>;
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-end">
         <h2 className="text-xl font-medium text-white hidden md:block">Portfolio Overview</h2>
         <div className="flex gap-3">
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white bg-[#141C35] border border-white/10 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
               Import CSV
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white bg-[#141C35] border border-white/10 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               Export
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 animate-slide-up flex flex-col relative overflow-hidden group" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center ${stat.bg}`}>
               <svg className={`w-5 h-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon}/></svg>
            </div>
            <span className="text-gray-400 text-sm font-medium mb-2">{stat.label}</span>
            <span className={`text-3xl font-mono font-semibold ${stat.color} mt-auto`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card animate-slide-up flex flex-col max-h-[600px]" style={{ animationDelay: '320ms' }}>
          <div className="p-5 border-b border-white/5 flex justify-between items-center shrink-0">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              Applicant Registry
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#141C35] z-10 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="px-5 py-4 font-medium">Applicant</th>
                  <th className="px-5 py-4 font-medium">Score</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {applicants.map((app, i) => (
                  <tr key={app.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group relative">
                    <td className="absolute left-0 top-0 bottom-0 w-0.5 bg-transparent group-hover:bg-[#3B82F6] transition-colors"></td>
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                        {getInitials(app.name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white truncate max-w-[120px]">{app.name}</span>
                        <span className="text-[10px] font-mono text-gray-500">${(app.income/1000).toFixed(0)}k/yr</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1.5 w-16">
                        <span className="font-mono text-gray-300 text-xs">{app.credit_score}</span>
                        <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
                          <div className={`h-full ${app.credit_score > 700 ? 'bg-[#10B981]' : app.credit_score > 600 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}`} style={{ width: `${(app.credit_score / 850) * 100}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-gray-300 text-xs">${(app.loan_amount/1000).toFixed(1)}k</td>
                    <td className="px-5 py-3.5">{renderStatus(app.status)}</td>
                    <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2 h-full min-h-[64px]">
                      {app.status === 'Review' && user.role === 'Admin' ? (
                        <div className="flex bg-[#0A0E1A] rounded overflow-hidden border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { fetch(`http://localhost:8000/api/applicants/${app.id}/status`, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({status: 'Approved'})}).then(() => dispatch({ type: actionTypes.UPDATE_STATUS, payload: { id: app.id, status: 'Approved' }})); showToast('Manual Override: Approved'); }} className="px-2 py-1 text-xs text-[#10B981] hover:bg-[#10B981]/20 font-medium border-r border-white/10">Approve</button>
                          <button onClick={() => { fetch(`http://localhost:8000/api/applicants/${app.id}/status`, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({status: 'Rejected'})}).then(() => dispatch({ type: actionTypes.UPDATE_STATUS, payload: { id: app.id, status: 'Rejected' }})); showToast('Manual Override: Rejected', 'error'); }} className="px-2 py-1 text-xs text-[#EF4444] hover:bg-[#EF4444]/20 font-medium">Reject</button>
                        </div>
                      ) : (
                        <button onClick={() => {
                          if (user.role !== 'Admin') { showToast('Admin access required to delete records', 'error'); return; }
                          fetch(`http://localhost:8000/api/applicants/${app.id}`, {method: 'DELETE'}).then(() => {
                             dispatch({ type: actionTypes.DELETE_APPLICANT, payload: app.id });
                             showToast('Applicant removed successfully', 'info');
                          });
                        }} className="text-gray-500 hover:text-[#EF4444] transition-colors p-1 opacity-0 group-hover:opacity-100 transform active:scale-90">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {applicants.length === 0 && (
                  <tr><td colSpan="5" className="px-6 py-16 text-center text-gray-500">No applicants found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="glass-card p-5">
            <h3 className="font-semibold text-sm text-gray-300 mb-4 uppercase tracking-wider flex items-center gap-2">
               <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
               Model Confidence
            </h3>
            <div className="flex items-end gap-3 mb-4">
               <span className="text-4xl font-mono font-bold text-white">94.2</span>
               <span className="text-[#10B981] text-sm font-medium mb-1 flex items-center"><svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>+2.4%</span>
            </div>
            <div className="flex gap-1 h-12 items-end">
               {[40, 55, 45, 70, 60, 85, 94, 90, 96].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#1E293B] rounded-t-sm relative group overflow-hidden">
                     <div className="absolute bottom-0 w-full bg-[#3B82F6] transition-colors rounded-t-sm animate-fill-width" style={{ height: `${h}%`, animationDelay: `${i*50}ms` }}></div>
                  </div>
               ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">F1 Score rolling average over 30 days</p>
          </div>

          <div className="glass-card p-5 flex-1 flex flex-col">
             <h3 className="font-semibold text-sm text-gray-300 mb-5 uppercase tracking-wider flex items-center gap-2">
               <svg className="w-4 h-4 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               Pipeline Feed
            </h3>
            <div className="relative border-l border-[#1E293B] ml-2 space-y-6 flex-1">
               {applicants.slice(0, 3).map((app, i) => (
                  <div key={i} className="pl-4 relative">
                     <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-[#141C35] ${app.status === 'Approved' ? 'bg-[#10B981]' : app.status === 'Review' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}`}></div>
                     <p className="text-xs text-gray-400 mb-0.5 font-mono">{i === 0 ? 'Just now' : `${i * 12} mins ago`}</p>
                     <p className="text-sm font-medium text-white">{app.name}</p>
                     <p className="text-xs text-gray-500 mt-1">Processed req. Model returned <span className={app.status === 'Approved' ? 'text-[#10B981]' : app.status === 'Review' ? 'text-[#F59E0B]' : 'text-[#EF4444]'}>{app.status}</span>.</p>
                  </div>
               ))}
               {applicants.length === 0 && <p className="pl-4 text-xs text-gray-500">System idle.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsView({ applicants }) {
  const approved = applicants.filter(a => a.status === 'Approved').length;
  const rejected = applicants.filter(a => a.status === 'Rejected').length;
  const review = applicants.filter(a => a.status === 'Review').length;

  const pieData = [
    { name: 'Approved', value: approved, color: '#10B981' },
    { name: 'Rejected', value: rejected, color: '#EF4444' },
    { name: 'Review', value: review, color: '#F59E0B' }
  ].filter(d => d.value > 0);

  // Group by credit score ranges for bar chart
  const scoreRanges = { '300-500': 0, '501-650': 0, '651-750': 0, '751-850': 0 };
  applicants.forEach(a => {
    if (a.credit_score <= 500) scoreRanges['300-500']++;
    else if (a.credit_score <= 650) scoreRanges['501-650']++;
    else if (a.credit_score <= 750) scoreRanges['651-750']++;
    else scoreRanges['751-850']++;
  });
  const barData = Object.keys(scoreRanges).map(k => ({ range: k, count: scoreRanges[k] }));

  return (
    <div className="max-w-7xl mx-auto animate-slide-up h-full flex flex-col">
      <h2 className="text-xl font-medium text-white mb-6">Interactive Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-semibold text-gray-300 mb-6">Decision Distribution</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#141C35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h3 className="font-semibold text-gray-300 mb-6">Credit Profile Segments</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="range" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#141C35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
    
    const data = {
      name: formData.name, income: Number(formData.income), credit_score: Number(formData.credit_score),
      loan_amount: Number(formData.loan_amount), employment_years: Number(formData.employment_years), prior_default: formData.prior_default,
    };
    
    fetch('http://localhost:8000/api/applicants', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(res => res.json()).then(resData => {
      fetch('http://localhost:8000/api/applicants').then(r=>r.json()).then(list => {
         dispatch({ type: actionTypes.LOAD_DATA, payload: list });
         showToast(`Model output: ${resData.status}`, resData.status === 'Approved' ? 'success' : resData.status === 'Review' ? 'warning' : 'error');
         dispatch({ type: actionTypes.SET_VIEW, payload: 'dashboard' });
      });
    }).catch(err => showToast('API Connection Error', 'error'))
      .finally(() => setIsSubmitting(false));
  };

  const InputField = ({ label, name, type = 'text', prefix, suffix, ...props }) => (
    <div className="mb-5 relative">
      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-gray-500 font-mono text-sm">{prefix}</span>}
        <input type={type} name={name} required className={`w-full bg-[#0A0E1A] border border-white/10 rounded-lg text-white font-mono text-sm focus:border-[#3B82F6] transition-colors py-2.5 ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-10' : 'pr-4'}`} value={formData[name]} onChange={(e) => setFormData({...formData, [name]: e.target.value})} {...props} />
        {suffix && <span className="absolute right-3 text-gray-500 font-mono text-sm">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 animate-slide-up pb-10">
      <div className="flex-[3] glass-card p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
           <svg className="w-5 h-5 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           Application Data Entry
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5 relative">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Full Legal Name</label>
            <input type="text" required className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg text-white text-sm focus:border-[#3B82F6] transition-colors py-2.5 px-4 font-sans" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InputField label="Annual Income" name="income" type="number" prefix="$" min="0" />
            <InputField label="Credit Score" name="credit_score" type="number" min="300" max="850" />
            <InputField label="Loan Amount" name="loan_amount" type="number" prefix="$" min="0" />
            <InputField label="Employment History" name="employment_years" type="number" suffix="YRS" min="0" step="0.1" />
          </div>
          <div className="mt-2 mb-8">
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Risk Flags</label>
            <div className={`border rounded-lg p-4 cursor-pointer transition-all flex items-center gap-4 ${formData.prior_default ? 'bg-[#EF4444]/10 border-[#EF4444]/50' : 'bg-[#0A0E1A] border-white/10 hover:border-white/20'}`} onClick={() => setFormData({...formData, prior_default: !formData.prior_default})}>
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
              {isSubmitting ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <>Run Assessment <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>}
            </button>
            <button type="button" onClick={() => dispatch({ type: actionTypes.SET_VIEW, payload: 'dashboard' })} className="px-6 bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 font-medium py-2.5 rounded-lg transition-all transform active:scale-95">Cancel</button>
          </div>
        </form>
      </div>

      <div className="flex-[2] flex flex-col gap-4">
        <div className="glass-card p-6 border-t-4 !border-[#3B82F6]">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ML Model Criteria
          </h3>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">FinCore's internal evaluation engine uses historical data points to predict risk. Submitting this form runs the data against our Random Forest topology in real-time. Borderline cases are flagged for Human Review.</p>
          <div className="space-y-4">
            {[
              { label: 'Debt-to-Income Ratio', desc: 'Income must exceed 1.5x loan req', color: 'bg-green-500' },
              { label: 'FICO Baseline', desc: 'Scores > 650 are heavily weighted', color: 'bg-blue-500' },
              { label: 'Job Stability', desc: '2+ years exp reduces risk factor', color: 'bg-purple-500' },
              { label: 'Derogatory Marks', desc: 'Prior defaults are a critical penalty', color: 'bg-red-500' }
            ].map((f, i) => (
              <div key={i} className="bg-[#0A0E1A] rounded-lg p-3 border border-white/5 flex gap-3 items-center">
                <div className={`w-1 h-8 rounded-full ${f.color}`}></div>
                <div><p className="text-xs font-semibold text-gray-200">{f.label}</p><p className="text-[10px] text-gray-500 mt-0.5">{f.desc}</p></div>
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
    const data = { income: Number(formData.income), credit_score: Number(formData.credit_score), loan_amount: Number(formData.loan_amount), employment_years: Number(formData.employment_years), prior_default: formData.prior_default };
    fetch('http://localhost:8000/api/simulate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(res => res.json()).then(resData => {
      setResult(resData.status);
    }).finally(() => setIsSimulating(false));
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
             <div className="relative"><input type="number" required placeholder="Income" className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg text-white font-mono text-sm focus:border-[#3B82F6] transition-colors py-2.5 pl-8 pr-4" value={formData.income} onChange={(e) => setFormData({...formData, income: e.target.value})} /><span className="absolute left-3 top-2.5 text-gray-500 font-mono text-sm">$</span></div>
            <div className="relative"><input type="number" required placeholder="Credit Score" min="300" max="850" className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg text-white font-mono text-sm focus:border-[#3B82F6] transition-colors py-2.5 pl-4 pr-4" value={formData.credit_score} onChange={(e) => setFormData({...formData, credit_score: e.target.value})} /></div>
            <div className="relative"><input type="number" required placeholder="Loan Amount" className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg text-white font-mono text-sm focus:border-[#3B82F6] transition-colors py-2.5 pl-8 pr-4" value={formData.loan_amount} onChange={(e) => setFormData({...formData, loan_amount: e.target.value})} /><span className="absolute left-3 top-2.5 text-gray-500 font-mono text-sm">$</span></div>
            <div className="relative"><input type="number" required placeholder="Employment Years" step="0.1" className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg text-white font-mono text-sm focus:border-[#3B82F6] transition-colors py-2.5 pl-4 pr-10" value={formData.employment_years} onChange={(e) => setFormData({...formData, employment_years: e.target.value})} /><span className="absolute right-3 top-2.5 text-gray-500 font-mono text-sm">YR</span></div>
            <div className={`border rounded-lg p-3 cursor-pointer transition-all flex items-center gap-3 ${formData.prior_default ? 'bg-[#EF4444]/10 border-[#EF4444]/50' : 'bg-[#0A0E1A] border-white/10'}`} onClick={() => setFormData({...formData, prior_default: !formData.prior_default})}>
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.prior_default ? 'bg-[#EF4444] border-[#EF4444]' : 'border-gray-500'}`}>{formData.prior_default && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}</div>
              <span className={`text-sm ${formData.prior_default ? 'text-[#EF4444]' : 'text-gray-400'}`}>Prior Default</span>
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-white/5">
             <button type="submit" disabled={isSimulating} className="w-full bg-[#1E293B] hover:bg-[#334155] text-white border border-white/10 font-medium py-3 rounded-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 group">
              {isSimulating ? <svg className="animate-spin h-5 w-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <>Run Simulation <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></>}
            </button>
          </div>
        </form>
      </div>

      <div className="flex-[1] glass-card flex flex-col items-center justify-center p-8 relative overflow-hidden min-h-[400px]">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] opacity-20 transition-all duration-700 ${result === 'Approved' ? 'bg-[#10B981]' : result === 'Rejected' ? 'bg-[#EF4444]' : result === 'Review' ? 'bg-[#F59E0B]' : 'bg-[#3B82F6]'}`}></div>
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
                <div className="relative flex items-center justify-center w-full h-full bg-[#10B981]/10 border-2 border-[#10B981] rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)]"><svg className="w-10 h-10 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
              </div>
            ) : result === 'Review' ? (
               <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="relative flex items-center justify-center w-full h-full bg-[#F59E0B]/10 border-2 border-[#F59E0B] rounded-full shadow-[0_0_30px_rgba(245,158,11,0.3)]"><svg className="w-10 h-10 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
              </div>
            ) : (
              <div className="relative w-24 h-24 mx-auto mb-6 animate-shake">
                <div className="relative flex items-center justify-center w-full h-full bg-[#EF4444]/10 border-2 border-[#EF4444] rounded-full shadow-[0_0_30px_rgba(239,68,68,0.3)]"><svg className="w-10 h-10 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></div>
              </div>
            )}
            <h2 className={`text-3xl font-bold tracking-wide mb-1 ${result === 'Approved' ? 'text-[#10B981]' : result === 'Review' ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>{result}</h2>
            <p className="text-gray-400 text-sm mb-8">Confidence Score: <span className="font-mono text-white">{(Math.random() * 15 + 84).toFixed(1)}%</span></p>
          </div>
        )}
      </div>
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@300;400;500;600;700&display=swap');
  :root { --bg-page: #0A0E1A; --bg-sidebar: #0F1629; --bg-card: #141C35; --accent: #3B82F6; }
  body { background-color: var(--bg-page); color: white; font-family: 'Sora', sans-serif; margin: 0; overflow-x: hidden; }
  .font-mono { font-family: 'IBM Plex Mono', monospace !important; }
  .bg-grid-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-image: radial-gradient(circle, rgba(59, 130, 246, 0.15) 1px, transparent 1px); background-size: 24px 24px; pointer-events: none; z-index: 0; }
  .glass-card { background: rgba(20, 28, 53, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; }
  @keyframes slideUpFade { 0% { transform: translateY(8px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
  .animate-slide-up { animation: slideUpFade 0.3s ease-out forwards; }
  @keyframes fillWidth { 0% { width: 0%; } }
  .animate-fill-width { animation: fillWidth 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
  @keyframes pulseDot { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
  .animate-pulse-dot { animation: pulseDot 2s infinite; }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } }
  .animate-shake { animation: shake 0.4s ease-in-out; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: var(--bg-page); }
  ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #334155; }
  input:focus, button:focus { outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }
  input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
`;
