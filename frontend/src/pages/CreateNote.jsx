import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../auth/auth.js';

const NOTE_API = import.meta.env.VITE_NOTE_API_URL;

const CreateNote = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    checkAuth().then((auth) => {
      if (!auth.success) {
        navigate('/login', { replace: true });
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  const handleSubmit = async () => {
    if (!title.trim()) return alert('Please enter a title');
    if (!content.trim()) return alert('Please enter some content');

    setSaving(true);
    try {
      const res = await fetch(`${NOTE_API}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/dashboard');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="w-10 h-10 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Glows */}
      <div className="fixed top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-amber-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-orange-600/10 blur-[110px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-white/3 backdrop-blur-md flex-shrink-0">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <span className="text-slate-500 text-xs font-medium">New Note</span>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-start justify-center pt-10 pb-16 px-4">
        <div className="w-full max-w-lg space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Create a new note</h1>
            <p className="text-slate-400 text-sm">Give it a title and write your content</p>
          </div>

          {/* Title input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Title</label>
            <input
              type="text"
              placeholder="e.g. Meeting Notes, Ideas..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 transition-all duration-200"
              autoFocus
            />
          </div>

          {/* Content textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Content</label>
            <textarea
              placeholder="Start writing your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 transition-all duration-200 resize-none leading-relaxed"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving || !title.trim() || !content.trim()}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200 hover:shadow-amber-500/40 hover:-translate-y-0.5"
          >
            {saving ? 'Saving...' : '📝 Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNote;
