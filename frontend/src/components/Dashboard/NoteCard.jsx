import { useNavigate } from 'react-router-dom';

const NoteCard = ({ note, onDelete }) => {
  const navigate = useNavigate();

  const gradients = [
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-violet-500 to-purple-600',
    'from-sky-500 to-blue-600',
    'from-indigo-500 to-violet-600',
  ];
  const gradient = gradients[note.title ? note.title.charCodeAt(0) % gradients.length : 0];

  return (
    <div
      onClick={() => navigate(`/note/${note._id}`)}
      className="group relative bg-white/4 hover:bg-white/6 border border-white/8 hover:border-amber-500/30 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col gap-4 cursor-pointer"
    >
      {/* Icon + Title */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h2 className="text-white font-semibold text-base truncate">{note.title}</h2>
          <span className="text-slate-500 text-xs">
            {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Preview */}
      {note.preview && (
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{note.preview}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
        <span className="text-[11px] text-slate-600">
          {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note._id);
          }}
          className="text-xs text-red-400/70 hover:text-red-400 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
