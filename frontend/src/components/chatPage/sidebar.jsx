import { useNavigate } from 'react-router-dom';
import {useState} from 'react';

const Sidebar = ({
  startNewChat,
  historyList,
  activeHistoryId,
  loadChat,
}) => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);

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
            <div className="p-3 shrink-0">
              <button
                onClick={startNewChat}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500/15 to-violet-600/15 border border-indigo-500/20 text-indigo-300 hover:from-indigo-500/25 hover:to-violet-600/25 hover:text-indigo-200 transition-all duration-200 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Chat
              </button>
            </div>

            {/* History List */}
            <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
              {historyList.length === 0 ? (
                <p className="text-slate-500 text-xs text-center pt-8">No conversations yet</p>
              ) : (
                historyList.slice().reverse().map((h) => (
                  <button
                    key={h._id}
                    onClick={() => loadChat(h._id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-150 group ${activeHistoryId === h._id
                        ? 'bg-white/8 text-white border border-white/10'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                      }`}
                  >
                    <p className="truncate font-medium">{h.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{new Date(h.createdAt).toLocaleDateString()}</p>
                  </button>
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
