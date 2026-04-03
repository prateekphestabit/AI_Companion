import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuth } from '../auth/auth.js';
import LoadingComponent from '../components/Loading/loading.jsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const ANALYTICS_API = import.meta.env.VITE_ANALYTICS_API_URL;

const COLORS = [
  '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6',
  '#fb923c', '#34d399', '#38bdf8', '#facc15', '#f87171',
];

const GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #8b5cf6, #a855f7)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #0ea5e9, #3b82f6)',
];

/* ─── Custom Recharts Tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15, 15, 25, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '12px 16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    }}>
      <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 500, marginBottom: 6 }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || entry.fill, fontSize: 14, fontWeight: 600 }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};


const Analytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const init = async () => {
      const authData = await checkAuth();
      if (!authData.success) { navigate('/login', { replace: true }); return; }
      try {
        const res = await fetch(ANALYTICS_API, {
          method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        });
        const json = await res.json();
        if (json.success) setData(json);
      } catch (err) {
        console.error('Analytics fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  if (loading) return <LoadingComponent text="Loading Analytics" />;

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b' }}>Failed to load analytics data.</p>
      </div>
    );
  }

  const { overview, companionStats, weeklyActivity } = data;

  const conversationsBarData = companionStats
    .map(c => ({ name: c.name, Conversations: c.totalConversations, Messages: c.totalMessages }))
    .sort((a, b) => b.Conversations - a.Conversations);

  const rankedCompanions = [...companionStats].sort((a, b) => b.totalMessages - a.totalMessages);
  const maxMessages = rankedCompanions.length > 0 ? rankedCompanions[0].totalMessages : 1;

  const statCards = [
    {
      label: 'Total Companions', value: overview.totalCompanions, sub: 'In your squad',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      icon: (
        <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Conversations', value: overview.totalConversations, sub: 'Across all companions',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
      icon: (
        <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      label: 'Total Messages', value: overview.totalMessages.toLocaleString(),
      sub: `${overview.totalUserMessages} sent · ${overview.totalAssistantMessages} received`,
      gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
      icon: (
        <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
    {
      label: 'Avg. Length', value: `${overview.overallAvgLength} msgs`,
      sub: overview.mostActiveCompanion ? `Most active: ${overview.mostActiveCompanion.name}` : 'No data yet',
      gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
      icon: (
        <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', position: 'relative', overflow: 'hidden' }}>
      {/* Background glows */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(99,102,241,0.06)', filter: 'blur(140px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', filter: 'blur(120px)', pointerEvents: 'none' }} />

      {/* ═══ Header ═══ */}
      <header style={{
        position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99,102,241,0.3)' }}>
              <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>Analytics</span>
          </div>
          <div style={{ fontSize: 11, padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {overview.totalCompanions} companion{overview.totalCompanions !== 1 ? 's' : ''} tracked
          </div>
        </div>
      </header>

      {/* ═══ Content ═══ */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
          {statCards.map((card, i) => (
            <div key={i} style={{
              position: 'relative', borderRadius: 16, padding: 24,
              background: '#111119', border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden', transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: card.gradient, opacity: 0.12, filter: 'blur(20px)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: `0 4px 15px rgba(0,0,0,0.3)` }}>
                  {card.icon}
                </div>
                <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{card.label}</p>
                <p style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{card.value}</p>
                {card.sub && <p style={{ color: '#475569', fontSize: 12, marginTop: 6 }}>{card.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          {/* Conversations by Companion */}
          <div style={{
            borderRadius: 16, padding: 28,
            background: '#111119', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Conversations by Companion</h3>
            <p style={{ color: '#475569', fontSize: 13, marginBottom: 24 }}>Total conversation threads per companion</p>
            {conversationsBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={conversationsBarData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                  <defs>
                    <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="Conversations" fill="url(#barGrad1)" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </div>

          {/* Weekly Activity */}
          <div style={{
            borderRadius: 16, padding: 28,
            background: '#111119', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Weekly Activity</h3>
            <p style={{ color: '#475569', fontSize: 13, marginBottom: 24 }}>Which days you chat the most</p>
            {weeklyActivity.some(d => d.conversations > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyActivity} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(168,85,247,0.06)' }} />
                  <defs>
                    <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="conversations" fill="url(#barGrad2)" radius={[8, 8, 0, 0]} maxBarSize={44} name="Conversations" />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </div>
        </div>

        {/* ── Leaderboard ── */}
        <div style={{
          borderRadius: 16, padding: 28,
          background: '#111119', border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 40,
        }}>
          <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Companion Leaderboard</h3>
          <p style={{ color: '#475569', fontSize: 13, marginBottom: 24 }}>Ranked by total messages exchanged</p>
          {rankedCompanions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rankedCompanions.map((comp, index) => {
                const pct = maxMessages > 0 ? (comp.totalMessages / maxMessages) * 100 : 0;
                const color = COLORS[index % COLORS.length];
                const medalStyles = [
                  { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#fff', shadow: '0 4px 12px rgba(251,191,36,0.3)' },
                  { bg: 'linear-gradient(135deg, #cbd5e1, #94a3b8)', color: '#1e293b', shadow: '0 4px 12px rgba(148,163,184,0.2)' },
                  { bg: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fef3c7', shadow: '0 4px 12px rgba(217,119,6,0.2)' },
                ];
                const medal = medalStyles[index] || null;

                return (
                  <div key={comp.companionId} style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
                    borderRadius: 12, background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
                  >
                    {/* Rank */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                      ...(medal ? { background: medal.bg, color: medal.color, boxShadow: medal.shadow } : { background: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.06)' }),
                    }}>
                      {index + 1}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{comp.name}</span>
                          <span style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.04)', color: '#64748b',
                            fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em',
                          }}>
                            {comp.personality}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#475569' }}>
                          <span><strong style={{ color: '#94a3b8' }}>{comp.totalConversations}</strong> chats</span>
                          <span><strong style={{ color: '#94a3b8' }}>{comp.totalMessages}</strong> msgs</span>
                          <span>~<strong style={{ color: '#94a3b8' }}>{comp.avgConversationLength}</strong> avg</span>
                        </div>
                      </div>
                      <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.04)', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 10,
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}88)`,
                          boxShadow: `0 0 16px ${color}30`,
                          transition: 'width 1s ease-out',
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState />}
        </div>

        {/* ── Companion Detail Cards ── */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: '#f1f5f9', fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 4 }}>Companion Details</h2>
          <p style={{ color: '#475569', fontSize: 13, marginBottom: 28 }}>Individual statistics for each companion</p>

          {companionStats.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
              {companionStats.map((comp, index) => {
                const color = COLORS[index % COLORS.length];
                const grad = GRADIENTS[index % GRADIENTS.length];
                const pct = maxMessages > 0 ? (comp.totalMessages / maxMessages) * 100 : 0;

                return (
                  <div
                    key={comp.companionId}
                    onClick={() => navigate(`/chat/${comp.companionId}`)}
                    style={{
                      borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                      background: '#111119', border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.boxShadow = `0 20px 60px -12px ${color}20`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Gradient top accent bar */}
                    <div style={{ height: 3, background: grad, opacity: 0.7 }} />

                    <div style={{ padding: '24px 24px 20px' }}>
                      {/* Top row: avatar + name + arrow */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{
                            width: 48, height: 48, borderRadius: 14, background: grad,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 20,
                            boxShadow: `0 6px 20px ${color}30`,
                          }}>
                            {comp.name[0].toUpperCase()}
                          </div>
                          <div>
                            <h4 style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 16, lineHeight: 1.2, marginBottom: 3 }}>{comp.name}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: '#94a3b8', fontSize: 12, textTransform: 'capitalize' }}>{comp.personality}</span>
                              <span style={{ color: '#334155' }}>·</span>
                              <span style={{ color: '#94a3b8', fontSize: 12, textTransform: 'capitalize' }}>{comp.expertise}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569',
                        }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>

                      {/* Stats 2×2 grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        {[
                          { label: 'Conversations', val: comp.totalConversations, unit: '' },
                          { label: 'Messages', val: comp.totalMessages, unit: '' },
                          { label: 'Avg Length', val: comp.avgConversationLength, unit: 'msgs' },
                          { label: 'Longest Chat', val: comp.longestConversation, unit: 'msgs' },
                        ].map((stat, j) => (
                          <div key={j} style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 12, padding: '14px 16px' }}>
                            <p style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{stat.label}</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                              <span style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{stat.val}</span>
                              {stat.unit && <span style={{ color: '#475569', fontSize: 11 }}>{stat.unit}</span>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Activity bar */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Activity</span>
                          <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>{Math.round(pct)}%</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 10,
                            width: `${pct}%`,
                            background: grad, opacity: 0.8,
                            boxShadow: `0 0 14px ${color}25`,
                            transition: 'width 1s ease-out',
                          }} />
                        </div>
                      </div>

                      {/* Footer */}
                      {comp.lastActive && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.4)' }} />
                          <span style={{ color: '#64748b', fontSize: 12 }}>
                            Last active {new Date(comp.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

      </main>
    </div>
  );
};

/* ─── Empty State ─── */
const EmptyState = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', textAlign: 'center' }}>
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    }}>
      <svg width="28" height="28" fill="none" stroke="#334155" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
    <p style={{ color: '#475569', fontSize: 14 }}>No data yet. Start chatting to see analytics!</p>
  </div>
);

export default Analytics;
