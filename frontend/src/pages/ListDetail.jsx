import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { checkAuth } from '../auth/auth';

const LIST_API = import.meta.env.VITE_LIST_API_URL;

const ListDetail = () => {
  const { listId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  // Fetch list
  useEffect(() => {
    const init = async () => {
      const authData = await checkAuth();
      if (!authData.success) { navigate('/login', { replace: true }); return; }

      try {
        const res = await fetch(`${LIST_API}/${listId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setList(data.list);
          setTitleDraft(data.list.title);
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Failed to load list:', err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [listId, navigate]);

  // Save title
  const saveTitle = async () => {
    if (!titleDraft.trim() || titleDraft.trim() === list.title) {
      setEditingTitle(false);
      setTitleDraft(list.title);
      return;
    }
    try {
      const res = await fetch(`${LIST_API}/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: titleDraft.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setList({ ...list, title: titleDraft.trim() });
      }
    } catch (err) {
      console.error('Failed to update title:', err);
    }
    setEditingTitle(false);
  };

  // Add task
  const addTask = async () => {
    if (!taskInput.trim()) return;
    try {
      const res = await fetch(`${LIST_API}/${listId}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ task: taskInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setList({ ...list, tasks: [...list.tasks, data.task] });
        setTaskInput('');
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  // Toggle task
  const toggleTask = async (taskId) => {
    try {
      const res = await fetch(`${LIST_API}/${listId}/task/${taskId}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setList({
          ...list,
          tasks: list.tasks.map((t) => t._id === taskId ? { ...t, state: !t.state } : t),
        });
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      const res = await fetch(`${LIST_API}/${listId}/task/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setList({ ...list, tasks: list.tasks.filter((t) => t._id !== taskId) });
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (loading || !list) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  const doneCount = list.tasks.filter((t) => t.state).length;
  const totalCount = list.tasks.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Glows */}
      <div className="fixed top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-teal-600/10 blur-[110px] pointer-events-none" />

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
          {totalCount > 0 && (
            <span className="text-slate-500 text-xs font-medium">
              {doneCount}/{totalCount} done · {progress}%
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {/* Title (editable) */}
        <div className="mb-8">
          {editingTitle ? (
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
              className="text-3xl font-bold text-white tracking-tight bg-transparent border-b-2 border-emerald-500/50 focus:outline-none w-full pb-1"
              autoFocus
            />
          ) : (
            <h1
              onClick={() => setEditingTitle(true)}
              className="text-3xl font-bold text-white tracking-tight cursor-pointer hover:text-emerald-300 transition-colors pb-1 border-b-2 border-transparent hover:border-emerald-500/30"
              title="Click to edit title"
            >
              {list.title}
            </h1>
          )}
          <p className="text-slate-500 text-sm mt-2">Click the title to rename · Check tasks to mark done</p>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mb-8">
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Task list */}
        <div className="space-y-2 mb-6">
          {list.tasks.map((task) => (
            <div
              key={task._id}
              className={`flex items-center gap-4 bg-white/4 border border-white/8 rounded-xl px-5 py-4 group transition-all duration-150 ${task.state ? 'opacity-60' : ''}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTask(task._id)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                  task.state
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-white/20 hover:border-emerald-500/50'
                }`}
              >
                {task.state && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Task text */}
              <span className={`flex-1 text-sm ${task.state ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {task.task}
              </span>

              {/* Delete */}
              <button
                onClick={() => deleteTask(task._id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all duration-150 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Add task */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Add a new task..."
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/60 transition-all duration-200"
          />
          <button
            onClick={addTask}
            disabled={!taskInput.trim()}
            className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-emerald-400 hover:to-teal-500 transition-all duration-200 shadow-lg shadow-emerald-500/20 shrink-0"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListDetail;
