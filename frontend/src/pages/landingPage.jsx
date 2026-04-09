import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ───────────────────── Intersection Observer Hook ───────────────────── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsInView(true); observer.unobserve(el); }
    }, { threshold: 0.15, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, isInView];
}

/* ───────────────────── Parallax on Scroll Hook ───────────────────── */
function useParallax(speed = 0.3) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      const rect = el.getBoundingClientRect();
      const offset = (rect.top - window.innerHeight / 2) * speed;
      el.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, [speed]);
  return ref;
}

/* ───────────────────── Animated Counter ───────────────────── */
function Counter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ───────────────────── Reveal Wrapper ───────────────────── */
function Reveal({ children, className = '', delay = 0, direction = 'up' }) {
  const [ref, inView] = useInView();
  const transforms = {
    up: 'translateY(60px)',
    down: 'translateY(-60px)',
    left: 'translateX(60px)',
    right: 'translateX(-60px)',
    scale: 'scale(0.85)',
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) translateX(0) scale(1)' : transforms[direction],
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ───────────────────── Typewriter Prompt Component ───────────────────── */
const SYSTEM_PROMPTS = [
  'Your name is Nova, you have a friendly personality, your communication style should be enthusiastic, and you are an expert in tech.',
  'Your name is Aria, you have an empathetic personality, your communication style should be calm, and you are an expert in wellness.',
  'Your name is Max, you have a humorous personality, your communication style should be playful, and you are an expert in lifestyle.',
  'Your name is Sage, you have a professional personality, your communication style should be formal, and you are an expert in education.',
];

function TypewriterPrompt() {
  const [displayText, setDisplayText] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPrompt = SYSTEM_PROMPTS[promptIndex];
    let timeout;

    if (!isDeleting) {
      if (displayText.length < currentPrompt.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentPrompt.slice(0, displayText.length + 1));
        }, 28);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 14);
      } else {
        setIsDeleting(false);
        setPromptIndex((promptIndex + 1) % SYSTEM_PROMPTS.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, promptIndex]);

  return (
    <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace', lineHeight: 1.6, minHeight: 65 }}>
      {displayText}
      <span style={{ display: 'inline-block', width: 2, height: 16, background: '#6366f1', marginLeft: 2, verticalAlign: 'text-bottom', animation: 'blink 1s step-end infinite' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const parallaxRef = useParallax(0.15);

  return (
    <div style={{ background: '#050507', color: '#e2e8f0', fontFamily: "'Inter', system-ui, -apple-system, sans-serif", overflowX: 'hidden' }}>
      
      {/* ╔══════ GLOBAL CSS ANIMATIONS ══════╗ */}
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
        @keyframes spin-slow { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes gradient-shift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes typing { 0%{width:0} 100%{width:100%} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 6s ease-in-out 2s infinite; }
        .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #818cf8, #a78bfa, #c084fc, #e879f9, #818cf8);
          background-size: 300% 300%;
          animation: gradient-shift 6s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
        .glass-strong { background: rgba(255,255,255,0.05); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.1); }
        .feature-card {
          position: relative;
          overflow: hidden;
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease;
        }
        .feature-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 30px 80px -20px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.2);
        }
        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.08), transparent 60%);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .feature-card:hover::before { opacity: 1; }
        .shimmer-line {
          position: relative;
          overflow: hidden;
        }
        .shimmer-line::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: shimmer 3s infinite;
        }
      `}</style>

      {/* ╔══════ NAVIGATION ══════╗ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(5,5,7,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'all 0.4s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
            }}>
              <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>AI Companion</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/login" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, color: '#94a3b8', textDecoration: 'none', borderRadius: 12, transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>
              Sign In
            </Link>
            <Link to="/signup" style={{
              padding: '10px 24px', fontSize: 14, fontWeight: 600, color: '#000', textDecoration: 'none',
              background: '#fff', borderRadius: 50, transition: 'all 0.3s',
              boxShadow: '0 0 20px rgba(255,255,255,0.1)',
            }}
              onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 0 30px rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 0 20px rgba(255,255,255,0.1)'; }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ╔══════ HERO ══════╗ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', overflow: 'hidden' }}>
        {/* Animated background orbs that follow mouse slightly */}
        <div style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          top: '10%', left: `calc(30% + ${mousePos.x * 0.02}px)`,
          filter: 'blur(60px)', transition: 'left 0.8s ease, top 0.8s ease',
        }} className="animate-pulse-glow" />
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
          bottom: '5%', right: `calc(20% + ${mousePos.x * -0.015}px)`,
          filter: 'blur(60px)', transition: 'right 0.8s ease',
        }} className="animate-pulse-glow" />
        
        {/* Decorative grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)',
        }} />

        <div ref={parallaxRef} style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900 }}>
          {/* Badge */}
          <Reveal delay={0}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
              borderRadius: 50, fontSize: 13, fontWeight: 500, color: '#a78bfa',
              border: '1px solid rgba(167,139,250,0.2)', background: 'rgba(167,139,250,0.06)',
              marginBottom: 32,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', animation: 'pulse-glow 2s ease infinite' }} />
              Powered by Mistral AI + Mem0 Memory
            </div>
          </Reveal>

          {/* Main heading */}
          <Reveal delay={0.1}>
            <h1 style={{ fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 28px', color: '#fff' }}>
              Your AI that<br />
              <span className="gradient-text">actually remembers you.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#64748b', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.7 }}>
              Create custom AI companions with unique personalities. They remember your preferences, create to‑do lists and notes for you, and get smarter with every conversation.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" style={{
                padding: '16px 36px', fontSize: 16, fontWeight: 600, color: '#000', textDecoration: 'none',
                background: 'linear-gradient(135deg, #fff 0%, #e2e8f0 100%)', borderRadius: 50,
                boxShadow: '0 0 40px rgba(255,255,255,0.15), 0 4px 20px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px) scale(1.03)'; e.target.style.boxShadow = '0 0 60px rgba(255,255,255,0.25), 0 8px 30px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 0 40px rgba(255,255,255,0.15), 0 4px 20px rgba(0,0,0,0.3)'; }}>
                Start Building Free →
              </Link>
              <Link to="/dashboard" style={{
                padding: '16px 36px', fontSize: 16, fontWeight: 500, color: '#e2e8f0', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50,
                background: 'rgba(255,255,255,0.03)', transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.03)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                Go to Dashboard
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scroll to explore</span>
          <div style={{ width: 24, height: 40, borderRadius: 12, border: '2px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
            <div style={{ width: 4, height: 10, borderRadius: 2, background: '#6366f1', animation: 'float 2s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ╔══════ STATS BAR ══════╗ */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '48px 24px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { num: 6, suffix: '', label: 'Personality Types' },
            { num: 5, suffix: '', label: 'Expertise Domains' },
            { num: 7, suffix: '', label: 'Built-in AI Tools' },
            { num: 3, suffix: '', label: 'Export Formats' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div>
                <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>
                  <Counter target={s.num} suffix={s.suffix} />
                </div>
                <p style={{ fontSize: 13, color: '#475569', marginTop: 8, fontWeight: 500 }}>{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ╔══════ FEATURE 1 — CUSTOM COMPANIONS ══════╗ */}
      <section style={{ padding: '140px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <Reveal direction="right">
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, color: '#818cf8', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.15)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Feature 01
                </div>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 20 }}>
                  Build Your Perfect<br />AI Companion
                </h2>
                <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.8, marginBottom: 32 }}>
                  Design AI personalities from scratch. Choose from 6 personality types like <strong style={{ color: '#a5b4fc' }}>friendly, humorous, empathetic</strong> — pick a communication style, set an area of expertise, and even write your own system prompt for full control.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { label: 'Friendly', color: '52,211,153', text: '#34d399', textHover: '#6ee7b7', icon: <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg> },
                    { label: 'Professional', color: '56,189,248', text: '#38bdf8', textHover: '#7dd3fc', icon: <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> },
                    { label: 'Humorous', color: '250,204,21', text: '#facc15', textHover: '#fde68a', icon: <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg> },
                    { label: 'Empathetic', color: '244,114,182', text: '#f472b6', textHover: '#f9a8d4', icon: <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg> },
                    { label: 'Supportive', color: '168,85,247', text: '#a855f7', textHover: '#c4b5fd', icon: <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg> },
                    { label: 'Creative', color: '251,146,60', text: '#fb923c', textHover: '#fdba74', icon: <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg> },
                  ].map(p => (
                    <span key={p.label} style={{ padding: '6px 14px', borderRadius: 50, fontSize: 13, fontWeight: 500, background: `rgba(${p.color},0.08)`, border: `1px solid rgba(${p.color},0.3)`, color: p.text, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: `0 0 14px rgba(${p.color},0.12), inset 0 0 14px rgba(${p.color},0.05)`, transition: 'all 0.3s ease', cursor: 'default' }}
                      onMouseEnter={e => { e.currentTarget.style.background = `rgba(${p.color},0.18)`; e.currentTarget.style.borderColor = `rgba(${p.color},0.55)`; e.currentTarget.style.boxShadow = `0 0 22px rgba(${p.color},0.28), inset 0 0 14px rgba(${p.color},0.08)`; e.currentTarget.style.color = p.textHover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `rgba(${p.color},0.08)`; e.currentTarget.style.borderColor = `rgba(${p.color},0.3)`; e.currentTarget.style.boxShadow = `0 0 14px rgba(${p.color},0.12), inset 0 0 14px rgba(${p.color},0.05)`; e.currentTarget.style.color = p.text; }}
                    >{p.icon} {p.label}</span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal direction="left" delay={0.2}>
              <div style={{ position: 'relative' }}>
                {/* Animated companion creation mockup */}
                <div className="glass-strong" style={{ borderRadius: 24, padding: 32, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div className="animate-float" style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', boxShadow: '0 8px 30px rgba(99,102,241,0.3)' }}>N</div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Nova</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <span style={{ padding: '2px 10px', borderRadius: 50, fontSize: 11, fontWeight: 500, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>friendly</span>
                        <span style={{ padding: '2px 10px', borderRadius: 50, fontSize: 11, fontWeight: 500, background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>tech</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step progress */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                    {[1,2,3,4,5,6,7].map(s => (
                      <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= 5 ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)', transition: 'background 0.5s' }} />
                    ))}
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>System Prompt</div>
                    <TypewriterPrompt />
                  </div>
                </div>

                {/* Floating decorative element */}
                <div className="animate-float-delayed" style={{ position: 'absolute', top: -20, right: -20, width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" fill="none" stroke="#c4b5fd" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ╔══════ FEATURE 2 — LONG-TERM MEMORY ══════╗ */}
      <section style={{ padding: '140px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '30%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(168,85,247,0.08)', filter: 'blur(100px)' }} />
        
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            {/* Visual on the left */}
            <Reveal direction="right" delay={0.1}>
              <div style={{ position: 'relative' }}>
                <div className="glass-strong" style={{ borderRadius: 24, padding: 32, overflow: 'hidden' }}>
                  {/* Memory nodes visualization */}
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div className="animate-spin-slow" style={{ width: 120, height: 120, margin: '0 auto', position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(168,85,247,0.2)', borderTopColor: '#a855f7' }} />
                      <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.15)', borderBottomColor: '#6366f1' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}>
                          <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Memory items */}
                  {[
                    { text: 'User loves horror movies', color: '#a78bfa' },
                    { text: 'Prefers morning workouts', color: '#818cf8' },
                    { text: 'Learning React & Node.js', color: '#c084fc' },
                  ].map((m, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                      marginBottom: 8, animation: `float 4s ease-in-out ${i * 0.5}s infinite`,
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, boxShadow: `0 0 12px ${m.color}60` }} />
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>{m.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal direction="left">
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, color: '#c084fc', background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.15)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Feature 02
                </div>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 20 }}>
                  Memory That<br />Persists Forever
                </h2>
                <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.8, marginBottom: 24 }}>
                  Powered by <strong style={{ color: '#c4b5fd' }}>Mem0</strong>, your companions remember your preferences, habits, goals, and past conversations across sessions. They learn what matters to you — no repetition needed.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    'Stores facts, preferences & context automatically',
                    'Semantic search finds relevant memories instantly',
                    'Update or delete specific memories on command',
                    'Per-companion memory isolation',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(192,132,252,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="12" height="12" fill="none" stroke="#c084fc" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span style={{ fontSize: 15, color: '#94a3b8' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ╔══════ FEATURE 3 — AI TOOL CALLING ══════╗ */}
      <section style={{ padding: '140px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.15)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Feature 03
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16 }}>
                AI That Takes Action
              </h2>
              <p style={{ fontSize: 17, color: '#64748b', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
                Your companions don't just talk — they act. Through intelligent tool calling, they create to‑do lists and notes for you automatically during conversation.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                icon: <svg width="24" height="24" fill="none" stroke="#34d399" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
                title: 'Auto-Create To‑Do Lists',
                desc: 'Ask your companion to plan a workout routine, and it creates organized task lists with actionable steps — directly in your dashboard.',
                gradient: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(20,184,166,0.05))',
                border: 'rgba(16,185,129,0.15)',
                iconBg: 'rgba(16,185,129,0.15)',
              },
              {
                icon: <svg width="24" height="24" fill="none" stroke="#fbbf24" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
                title: 'Smart Note Generation',
                desc: 'Your AI explains the "why" behind its recommendations by generating detailed notes — saved and searchable in your notes section.',
                gradient: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.05))',
                border: 'rgba(245,158,11,0.15)',
                iconBg: 'rgba(245,158,11,0.15)',
              },
              {
                icon: <svg width="24" height="24" fill="none" stroke="#c084fc" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>,
                title: 'Memory Management',
                desc: 'The AI proactively stores important facts about you and recalls them with semantic search — add, update, or delete memories via natural language.',
                gradient: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(139,92,246,0.05))',
                border: 'rgba(168,85,247,0.15)',
                iconBg: 'rgba(168,85,247,0.15)',
              },
            ].map((card, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="feature-card" style={{ borderRadius: 24, padding: 36, background: card.gradient, border: `1px solid ${card.border}`, height: '100%' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>{card.icon}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{card.title}</h3>
                  <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>{card.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ╔══════ FEATURE 4 — CHAT EXPERIENCE ══════╗ */}
      <section style={{ padding: '140px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '20%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(99,102,241,0.06)', filter: 'blur(100px)' }} />
        
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <Reveal direction="right">
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, color: '#38bdf8', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.15)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Feature 04
                </div>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 20 }}>
                  A Chat Interface<br />You'll Love Using
                </h2>
                <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.8, marginBottom: 32 }}>
                  Rich Markdown rendering, conversation history with search, and export your chats to <strong style={{ color: '#7dd3fc' }}>PDF, TXT, or JSON</strong>. Suggested prompts get you started instantly.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { icon: <svg width="18" height="18" fill="none" stroke="#38bdf8" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>, text: 'Markdown Rendering' },
                    { icon: <svg width="18" height="18" fill="none" stroke="#38bdf8" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>, text: 'Chat History Search' },
                    { icon: <svg width="18" height="18" fill="none" stroke="#38bdf8" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>, text: 'Export to PDF/TXT/JSON' },
                    { icon: <svg width="18" height="18" fill="none" stroke="#38bdf8" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>, text: 'Suggested Prompts' },
                  ].map((f, i) => (
                    <div key={i} style={{ padding: '14px 16px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.15)', boxShadow: '0 0 15px rgba(56,189,248,0.06), inset 0 0 15px rgba(56,189,248,0.03)', backdropFilter: 'blur(20px)', transition: 'all 0.3s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.1)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.35)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(56,189,248,0.12), inset 0 0 15px rgba(56,189,248,0.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.04)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.15)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(56,189,248,0.06), inset 0 0 15px rgba(56,189,248,0.03)'; }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal direction="left" delay={0.2}>
              <div className="glass-strong" style={{ borderRadius: 24, overflow: 'hidden' }}>
                {/* Chat header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>A</div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Aria</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 50, background: 'rgba(255,255,255,0.04)', color: '#64748b', marginLeft: 'auto' }}>wellness</span>
                </div>
                {/* Chat messages */}
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ alignSelf: 'flex-end', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px 16px 4px 16px', padding: '12px 16px', maxWidth: '80%' }}>
                    <p style={{ fontSize: 14, color: '#e2e8f0' }}>Can you create a morning routine for me?</p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, maxWidth: '85%' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #f43f5e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0, marginTop: 2 }}>A</div>
                    <div>
                      <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>I'd love to help! I'll create a to-do list for your morning routine and a note explaining why each step matters. Let me do that now.</p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500, background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.15)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> List created</span>
                        <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 500, background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.15)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> Note created</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ╔══════ FEATURE 5 — ANALYTICS ══════╗ */}
      <section style={{ padding: '140px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <Reveal direction="right" delay={0.1}>
              <div className="glass-strong" style={{ borderRadius: 24, padding: 32, overflow: 'hidden' }}>
                {/* Analytics mockup */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Companions', value: '4', color: '#818cf8' },
                    { label: 'Conversations', value: '37', color: '#a78bfa' },
                    { label: 'Messages', value: '1.2k', color: '#e879f9' },
                    { label: 'Avg Length', value: '32', color: '#34d399' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, padding: '16px 14px' }}>
                      <div style={{ fontSize: 10, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {/* Bar chart mockup */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, padding: '0 8px' }}>
                  {[65, 40, 85, 55, 30, 70, 45].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '6px 6px 0 0', background: `linear-gradient(180deg, rgba(129,140,248,0.6), rgba(139,92,246,0.2))`, transition: 'height 1s ease' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 8px 0', fontSize: 10, color: '#334155' }}>
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
                </div>
              </div>
            </Reveal>

            <Reveal direction="left">
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, color: '#f472b6', background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.15)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Feature 05
                </div>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 20 }}>
                  Insights &<br />Analytics Dashboard
                </h2>
                <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.8, marginBottom: 24 }}>
                  Track every interaction. See which companions you chat with most, your weekly activity patterns, message counts, and a companion leaderboard — all in beautiful interactive charts.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    'Conversations & messages per companion',
                    'Weekly activity heatmap by day',
                    'Companion leaderboard with rankings',
                    'Individual companion detail cards',
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(244,114,182,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="12" height="12" fill="none" stroke="#f472b6" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span style={{ fontSize: 15, color: '#94a3b8' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ╔══════ FINAL CTA ══════╗ */}
      <section style={{ padding: '160px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
        
        <Reveal direction="scale">
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
              Ready to meet your<br />
              <span className="gradient-text">AI Companion?</span>
            </h2>
            <p style={{ fontSize: 18, color: '#475569', marginBottom: 48, lineHeight: 1.7 }}>
              Create your first companion in under 2 minutes. No credit card required.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" style={{
                padding: '18px 44px', fontSize: 17, fontWeight: 600, color: '#000', textDecoration: 'none',
                background: '#fff', borderRadius: 50,
                boxShadow: '0 0 60px rgba(255,255,255,0.15), 0 4px 20px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-3px) scale(1.04)'; e.target.style.boxShadow = '0 0 80px rgba(255,255,255,0.25), 0 12px 40px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 0 60px rgba(255,255,255,0.15), 0 4px 20px rgba(0,0,0,0.3)'; }}>
                Get Started Free
              </Link>
              <Link to="/login" style={{
                padding: '18px 44px', fontSize: 17, fontWeight: 500, color: '#94a3b8', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50,
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.target.style.color = '#94a3b8'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                Sign In
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ╔══════ FOOTER ══════╗ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '48px 24px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#94a3b8' }}>AI Companion</span>
          </div>
          <p style={{ fontSize: 13, color: '#334155' }}>© {new Date().getFullYear()} AI Companion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;