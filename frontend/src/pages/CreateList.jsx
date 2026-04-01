import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../auth/auth.js';

const LIST_API = import.meta.env.VITE_LIST_API_URL;

const CreateList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');

  useEffect(() => {
    checkAuth().then((auth) => {
      if (!auth.success) {
        navigate('/login', { replace: true });
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks([...tasks, taskInput.trim()]);
    setTaskInput('');
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return alert('Please enter a title');
    if (tasks.length === 0) return alert('Please add at least one task');

    setSaving(true);
    try {
      const res = await fetch(`${LIST_API}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: title.trim(), tasks }),
      });
      const data = await res.json();
      if (data.success) {
        navigate('/dashboard');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Glows */}
      <div className="fixed top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-teal-600/10 blur-[110px] pointer-events-none" />

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
          <span className="text-slate-500 text-xs font-medium">New List</span>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-start justify-center pt-10 pb-16 px-4">
        <div className="w-full max-w-lg space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Create a new list</h1>
            <p className="text-slate-400 text-sm">Add a title and your tasks</p>
          </div>

          {/* Title input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Title</label>
            <input
              type="text"
              placeholder="e.g. Groceries, Work Tasks..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/60 transition-all duration-200"
              autoFocus
            />
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Tasks</label>

            {/* Task list */}
            {tasks.length > 0 && (
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white/4 border border-white/8 rounded-xl px-4 py-3"
                  >
                    <span className="text-slate-200 text-sm">{task}</span>
                    <button
                      onClick={() => removeTask(index)}
                      className="text-slate-500 hover:text-red-400 transition-colors ml-3 shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add task input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a task..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/60 transition-all duration-200"
              />
              <button
                onClick={addTask}
                disabled={!taskInput.trim()}
                className="px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 text-sm font-medium shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving || !title.trim() || tasks.length === 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
          >
            {saving ? 'Saving...' : '✅ Save List'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateList;
