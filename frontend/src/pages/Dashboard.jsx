import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuth } from '../auth/auth.js';
import CompanionGrid from '../components/Dashboard/CompanionGrid.jsx';
import ListGrid from '../components/Dashboard/ListGrid.jsx';
import NoteGrid from '../components/Dashboard/NoteGrid.jsx';
import LoadingComponent from '../components/Loading/loading.jsx';

const LIST_API = import.meta.env.VITE_LIST_API_URL;
const NOTE_API = import.meta.env.VITE_NOTE_API_URL;
const GET_USER_API = import.meta.env.VITE_GET_USER_API_URL;
const DELETE_COMPANION_API = import.meta.env.VITE_DELETE_COMPANION_API_URL


const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companions, setCompanions] = useState([]);
  const [lists, setLists] = useState([]);
  const [notes, setNotes] = useState([]);
  const [listSearchQuery, setListSearchQuery] = useState('');
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);

  const loadData = async () => {
    const authData = await checkAuth();
    if (!authData.success) {
      navigate('/login', { replace: true });
    } else {
      try {
        const userRes = await fetch(GET_USER_API, {method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include"});
        const userData = await userRes.json();
        const User = userData.user;
        setUserName(User.name);
        setUserAvatar(User.avatar);
        setCompanions(User.companions);
        setLists(User.lists);
        setNotes(User.notes);

      } catch (error) {
        console.error("Failed to load Data:", error);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  
  const handleDeleteCompanion = async (companionId) => {
    try {
      const res = await fetch(DELETE_COMPANION_API, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companionId }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setCompanions(prev => prev.filter(c => c._id !== companionId));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Delete companion failed:", error);
    }
  };
  
  const handleDeleteList = async (listId) => {
    try {
      const res = await fetch(`${LIST_API}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setLists(prev => prev.filter(l => l._id !== listId));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Delete list failed:", error);
    }
  };
  
  const handleDeleteNote = async (noteId) => {
    try {
      const res = await fetch(`${NOTE_API}/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setNotes(prev => prev.filter(n => n._id !== noteId));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Delete note failed:", error);
    }
  };
  
  if (loading) return (<LoadingComponent text="Loading Dashboard"/>);

  const filteredLists = lists.filter(list => list.title?.toLowerCase().includes(listSearchQuery.toLowerCase()));
  const filteredNotes = notes.filter(note => note.title?.toLowerCase().includes(noteSearchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      {/* Topbar */}
      <header className="relative z-10 border-b border-white/5 bg-white/3 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">AI Companion</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {userName && (
              <span className="hidden sm:block text-slate-300 font-medium text-sm uppercase tracking-wider">
                {userName.split(' ')[0]}
              </span>
            )}
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/10 text-slate-300 hover:text-white transition-all duration-200 text-sm font-medium group"
              title="View Analytics"
            >
              <svg className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border border-white/10 flex items-center justify-center hover:shadow-lg hover:shadow-indigo-500/20 transition-all text-slate-400 hover:text-white overflow-hidden shrink-0"
              title="Profile Settings"
            >
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {userName ? userName.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-14">

        {/* ═══ Companions Section ═══ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">My Companions</h1>
              <p className="text-slate-400 text-sm mt-1">
                {companions.length === 0
                  ? "You don't have any companions yet"
                  : `${companions.length} companion${companions.length !== 1 ? 's' : ''} in your squad`
                }
              </p>
            </div>
            <button
              onClick={() => navigate("/createCompanion")}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Companion
            </button>
          </div>
          <CompanionGrid
            companions={companions}
            onDelete={handleDeleteCompanion}
            onRefresh={loadData}
          />
        </section>

        {/* ═══ To-Do Lists Section ═══ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">My Lists</h2>
              <p className="text-slate-400 text-sm mt-1">
                {lists.length === 0
                  ? "You don't have any to-do lists yet"
                  : `${lists.length} list${lists.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search lists..."
                  value={listSearchQuery}
                  onChange={(e) => setListSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-white/5 border border-white/10 group-hover:border-emerald-500/30 text-white text-sm rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-slate-400 transition-all duration-200"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-emerald-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => navigate("/createList")}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-2.5 px-5 flex-shrink-0 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add List
              </button>
            </div>
          </div>
          <ListGrid
            lists={filteredLists}
            onDelete={handleDeleteList}
          />
        </section>

        {/* ═══ Notes Section ═══ */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">My Notes</h2>
              <p className="text-slate-400 text-sm mt-1">
                {notes.length === 0
                  ? "You don't have any notes yet"
                  : `${notes.length} note${notes.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={noteSearchQuery}
                  onChange={(e) => setNoteSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-white/5 border border-white/10 group-hover:border-amber-500/30 text-white text-sm rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder-slate-400 transition-all duration-200"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-amber-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => navigate("/createNote")}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold py-2.5 px-5 flex-shrink-0 rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Note
              </button>
            </div>
          </div>
          <NoteGrid
            notes={filteredNotes}
            onDelete={handleDeleteNote}
          />
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
