import { useNavigate } from 'react-router-dom';
import NoteCard from './NoteCard';

const NoteGrid = ({ notes, onDelete }) => {
  const navigate = useNavigate();

  return (
    notes.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-white/10 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">No notes yet</h2>
        <p className="text-slate-400 text-sm mb-5 max-w-xs">Capture your thoughts and ideas in notes.</p>
        <button
          onClick={() => navigate("/createNote")}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-200 hover:shadow-amber-500/40 hover:-translate-y-0.5 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create First Note
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {notes.map((note, index) => (
          <NoteCard
            key={note._id || index}
            note={note}
            onDelete={onDelete}
          />
        ))}
      </div>
    )
  );
};

export default NoteGrid;
