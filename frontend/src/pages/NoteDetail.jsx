import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { checkAuth } from '../auth/auth';

const NOTE_API = import.meta.env.VITE_NOTE_API_URL;

const NoteDetail = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch note
  useEffect(() => {
    const init = async () => {
      const authData = await checkAuth();
      if (!authData.success) { navigate('/login', { replace: true }); return; }

      try {
        const res = await fetch(`${NOTE_API}/${noteId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setNote(data.note);
          setTitle(data.note.title);
          setContent(data.note.content);
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Failed to load note:', err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [noteId, navigate]);

  // Track changes
  useEffect(() => {
    if (!note) return;
    setHasChanges(title !== note.title || content !== note.content);
  }, [title, content, note]);

  // Save
  const handleSave = async () => {
    if (!title.trim()) return alert('Title cannot be empty');
    setSaving(true);
    try {
      const res = await fetch(`${NOTE_API}/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: title.trim(), content }),
      });
      const data = await res.json();
      if (data.success) {
        setNote(data.note);
        setHasChanges(false);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Glows */}
      <div className="fixed top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-amber-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-orange-600/10 blur-[110px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-white/3 backdrop-blur-md flex-shrink-0">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-amber-400 text-xs font-medium">Unsaved changes</span>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                hasChanges
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-500'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-3xl font-bold text-white tracking-tight bg-transparent border-none focus:outline-none placeholder-slate-600 mb-6"
        />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full flex-1 bg-transparent text-slate-200 text-base leading-relaxed focus:outline-none resize-none placeholder-slate-600 min-h-[60vh]"
        />
      </div>
    </div>
  );
};

export default NoteDetail;
