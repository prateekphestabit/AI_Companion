import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { checkAuth } from '../auth/auth';
import Sidebar from '../components/chatPage/sidebar';

const CHAT_API = import.meta.env.VITE_CHAT_API_URL;

const Chat = () => {
  const { companionId } = useParams();
  const navigate = useNavigate();

  // Core state
  const [loading, setLoading] = useState(true);
  const [companion, setCompanion] = useState(null);
  const [userName, setUserName] = useState('');

  // Sidebar
  const [historyList, setHistoryList] = useState([]);

  // Chat
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // ── Bootstrap: auth + companion + history ──
  useEffect(() => {
    const init = async () => {
      const authData = await checkAuth();
      if (!authData.success) { navigate('/login', { replace: true }); return; }
      setUserName(authData.user?.name || '');

      try {
        // Fetch companion details
        const compRes = await fetch(import.meta.env.VITE_GET_COMPANIONS_API_URL, {
          method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        });
        const compData = await compRes.json();
        if (compData.success) {
          const comp = compData.companions.find(c => c._id === companionId);
          if (comp) setCompanion(comp); else { navigate('/dashboard'); return; }
        }

        // Fetch history sidebar
        const histRes = await fetch(`${CHAT_API}/${companionId}/history`, {
          method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        });
        const histData = await histRes.json();
        if (histData.success) setHistoryList(histData.history);
      } catch (err) {
        console.error('Init failed:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [companionId, navigate]);

  // ── Load a specific chat ──
  const loadChat = async (historyId) => {
    try {
      const res = await fetch(`${CHAT_API}/${companionId}/history/${historyId}`, {
        method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.chatHistory.map(m => ({ role: m.role, text: m.content })));
        setActiveHistoryId(historyId);
      }
    } catch (err) {
      console.error('Load chat failed:', err);
    }
  };

  // ── New chat ──
  const startNewChat = () => {
    setActiveHistoryId(null);
    setMessages([]);
  };

  // ── Send message ──
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setSending(true);

    try {
      const res = await fetch(`${CHAT_API}/${companionId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ historyId: activeHistoryId, message: text }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
        if (!activeHistoryId) {
          setActiveHistoryId(data.historyId);
          // Refresh sidebar
          const histRes = await fetch(`${CHAT_API}/${companionId}/history`, {
            method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          });
          const histData = await histRes.json();
          if (histData.success) setHistoryList(histData.history);
        }
      }
    } catch (err) {
      console.error('Send failed:', err);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  // ── Loading state ──
  if (loading || !companion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  // Avatar helpers
  const avatarLetter = companion.name ? companion.name[0].toUpperCase() : '?';
  const gradients = ['from-indigo-500 to-violet-600', 'from-pink-500 to-rose-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-sky-500 to-blue-600'];
  const gradient = gradients[companion.name ? companion.name.charCodeAt(0) % gradients.length : 0];

  const isNewChat = messages.length === 0;
  const firstName = userName ? userName.split(' ')[0] : '';

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-slate-100 overflow-hidden">
      {/* ═══════════ SIDEBAR ═══════════ */}
      <Sidebar
        startNewChat={startNewChat}
        historyList={historyList}
        activeHistoryId={activeHistoryId}
        loadChat={loadChat}
      />

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-4 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md shrink-0 z-10">
          <div className="flex items-center gap-3">
            
            <div className="flex items-center gap-2.5">
              {companion.avatar ? (
                <img src={companion.avatar} alt={companion.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm`}>
                  {avatarLetter}
                </div>
              )}
              <span className="text-white font-medium text-sm">{companion.name}</span>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-slate-400 font-medium uppercase tracking-wider hidden sm:block">
            {companion.expertise}
          </span>
        </header>

        {/* ── Chat Feed / Welcome ── */}
        <main className="flex-1 overflow-y-auto">
          {isNewChat ? (
            /* ═══ NEW CHAT WELCOME ═══ */
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="mb-8">
                {companion.avatar ? (
                  <img src={companion.avatar} alt={companion.name} className="w-20 h-20 rounded-2xl object-cover border border-white/10 shadow-lg shadow-indigo-500/10 mx-auto" />
                ) : (
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-indigo-500/10 mx-auto`}>
                    {avatarLetter}
                  </div>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
                  Hey {firstName || 'there'},
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl font-medium text-slate-500 mb-10">
                What's on your mind today?
              </p>
              {/* Suggested prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {[
                  `Tell me about ${companion.expertise}`,
                  `Help me brainstorm ideas`,
                  `Explain a complex concept`,
                  `Let's have a conversation`,
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => { setInputText(prompt); }}
                    className="text-left px-4 py-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-indigo-500/30 text-slate-300 hover:text-white text-sm transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ═══ EXISTING CHAT FEED ═══ */
            <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-7 pb-36">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={index} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3.5 ${isUser ? 'max-w-[80%] flex-row-reverse' : 'max-w-full flex-row'}`}>
                      {/* AI avatar */}
                      {!isUser && (
                        <div className="shrink-0 mt-1 hidden sm:block">
                          {companion.avatar ? (
                            <img src={companion.avatar} alt={companion.name} className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs`}>
                              {avatarLetter}
                            </div>
                          )}
                        </div>
                      )}
                      <div className={`${isUser
                          ? 'bg-[#131320] border border-white/8 text-slate-100 rounded-2xl rounded-tr-sm px-5 py-3.5'
                          : 'text-slate-200 py-1'
                        }`}>
                        {isUser ? (
                          <p className={`whitespace-pre-wrap leading-7 text-[15px]`}>
                            {msg.text}
                          </p>
                        ) : (
                          <ReactMarkdown
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-indigo-300" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-3 mb-2 text-indigo-300" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-2 mb-1.5 text-indigo-300" {...props} />,
                              h4: ({ node, ...props }) => <h4 className="text-base font-bold mt-2 mb-1 text-indigo-300" {...props} />,
                              h5: ({ node, ...props }) => <h5 className="font-bold text-indigo-300" {...props} />,
                              h6: ({ node, ...props }) => <h6 className="font-bold text-indigo-300" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-semibold text-slate-100" {...props} />,
                              em: ({ node, ...props }) => <em className="italic text-slate-300" {...props} />,
                              p: ({ node, ...props }) => <p className="leading-7 text-[15px] my-2" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
                              li: ({ node, ...props }) => <li className="text-[15px]" {...props} />,
                              code: ({ node, inline, ...props }) => 
                                inline ? (
                                  <code className="bg-white/10 text-amber-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                                ) : (
                                  <code className="bg-white/5 block p-3 rounded-lg text-amber-300 font-mono text-sm overflow-x-auto my-2" {...props} />
                                ),
                              blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-slate-300 my-2" {...props} />,
                              a: ({ node, ...props }) => <a className="text-indigo-400 hover:underline" {...props} />,
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {sending && (
                <div className="flex items-center gap-3">
                  <div className="shrink-0 hidden sm:block">
                    <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs`}>
                      {companion.avatar ? (
                        <img src={companion.avatar} alt={companion.name} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        avatarLetter
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 py-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* ── Input Bar ── */}
        <footer className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/95 to-transparent pt-12 pb-5 px-4 pointer-events-none z-10">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <form
              onSubmit={handleSend}
              className="flex items-end gap-2 bg-[#131320] border border-white/8 focus-within:border-indigo-500/40 rounded-2xl px-2 py-2 shadow-2xl shadow-black/40 transition-all duration-300"
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
                }}
                placeholder={`Message ${companion.name}...`}
                className="flex-1 max-h-[200px] min-h-[44px] bg-transparent text-slate-100 placeholder-slate-500 text-[15px] px-3 py-3 focus:outline-none resize-none leading-relaxed"
                rows={1}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 mb-0.5 mr-0.5 ${inputText.trim() && !sending
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                    : 'bg-white/5 text-slate-600'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
            <p className="text-center text-[11px] text-slate-600 mt-3 tracking-wide">
              AI Companions can make mistakes. Consider verifying important information.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Chat;
