import { useNavigate } from 'react-router-dom';
import {useState} from 'react';

const Sidebar = ({
  startNewChat,
  historyList,
  activeHistoryId,
  loadChat,
  deleteChat,
}) => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = historyList.filter(h => 
    h.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <aside className={`fixed lg:static top-0 left-0 h-full z-40 shrink-0 bg-[#0e0e14] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${sidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full lg:translate-x-0 lg:w-[68px]'}`}>
        {/* Sidebar Header */}
        <div 
          className="flex items-center p-4 border-b border-white/5 shrink-0"
          style={{ justifyContent: sidebarOpen ? 'space-between' : 'center' }}
        >
          {sidebarOpen && (
            <span className="text-sm font-semibold text-slate-300 tracking-wide uppercase">Chats</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 shrink-0 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
        </div>

        {/* Conditionally hide the rest when closed */}
        {sidebarOpen && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* New Chat Button */}
            <div className="p-3 shrink-0 flex flex-col gap-3">
              <button
                onClick={startNewChat}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500/15 to-violet-600/15 border border-indigo-500/20 text-indigo-300 hover:from-indigo-500/25 hover:to-violet-600/25 hover:text-indigo-200 transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Chat
              </button>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1a24] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            {/* History List */}
            <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
              {filteredHistory.length === 0 ? (
                <p className="text-slate-500 text-xs text-center pt-8">
                  {historyList.length === 0 ? "No conversations yet" : "No chats found"}
                </p>
              ) : (
                filteredHistory.slice().reverse().map((h) => (
                  <div key={h._id} className="relative">
                    <button
                      onClick={() => loadChat(h._id)}
                      className={`w-full text-left pl-4 pr-10 py-3 rounded-xl text-sm transition-all duration-150 group ${activeHistoryId === h._id
                          ? 'bg-white/8 text-white border border-white/10'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                        }`}
                    >
                      <p className="truncate font-medium leading-tight mb-0.5">{h.title}</p>
                      <p className="text-[11px] text-slate-500">{new Date(h.createdAt).toLocaleDateString()}</p>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === h._id ? null : h._id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>

                    {openMenuId === h._id && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                        ></div>
                        <div className="absolute right-0 top-12 bg-[#1a1a24] border border-white/10 shadow-2xl shadow-black/80 rounded-xl p-1 z-50 w-36 animate-in fade-in zoom-in-95">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(h._id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Chat
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </nav>

            {/* Sidebar Footer — back to dashboard */}
            <div className="p-3 border-t border-white/5 shrink-0">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Dashboard
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
