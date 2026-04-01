import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Companion = ({ companion, onDelete }) => {
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();

  // Avatar: use image if available, else first letter
  const avatarLetter = companion.name ? companion.name[0].toUpperCase() : '?';
  const gradients = [
    'from-indigo-500 to-violet-600',
    'from-pink-500 to-rose-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-sky-500 to-blue-600',
    'from-purple-500 to-fuchsia-600',
  ];
  const gradientIndex = companion.name
    ? companion.name.charCodeAt(0) % gradients.length
    : 0;
  const gradient = gradients[gradientIndex];

  const tagColors = {
    friendly: 'bg-green-500/15 text-green-400 border-green-500/20',
    professional: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    humorous: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    empathetic: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
    supportive: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
    creative: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    casual: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    formal: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
    enthusiastic: 'bg-red-500/15 text-red-400 border-red-500/20',
    calm: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    playful: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  };
  const personalityColor = tagColors[companion.personality] || 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20';

  return (
    <div 
      onClick={() => navigate(`/chat/${companion._id}`)}
      className="group relative bg-white/4 hover:bg-white/6 border border-white/8 hover:border-indigo-500/30 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col gap-4 cursor-pointer"
    >
      {/* Avatar + Name */}
      <div className="flex items-center gap-3">
        {companion.avatar ? (
          <img
            src={companion.avatar}
            alt={companion.name}
            className="w-12 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
          />
        ) : (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
            {avatarLetter}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-white font-semibold text-base truncate">{companion.name}</h2>
          <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${personalityColor} capitalize`}>
            {companion.personality}
          </span>
        </div>
      </div>

      {/* Description */}
      {companion.description && (
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{companion.description}</p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {companion.communicationStyle}
        </span>
        <span className="text-slate-700">·</span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {companion.expertise}
        </span>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
        {/* Info tooltip trigger */}
        <div className="relative">
          <button
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-150 text-xs font-bold"
          >
            i
          </button>
          {showInfo && (
            <div className="absolute bottom-9 left-0 bg-[#131320] border border-white/10 rounded-xl p-3 z-20 shadow-xl shadow-black/50 w-44 text-xs">
              <p className="text-slate-300 mb-1"><span className="text-slate-500">Personality:</span> <span className="capitalize">{companion.personality}</span></p>
              <p className="text-slate-300 mb-1"><span className="text-slate-500">Style:</span> <span className="capitalize">{companion.communicationStyle}</span></p>
              <p className="text-slate-300"><span className="text-slate-500">Expertise:</span> <span className="capitalize">{companion.expertise}</span></p>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(companion._id);
          }}
          className="text-xs text-red-400/70 hover:text-red-400 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Companion;
