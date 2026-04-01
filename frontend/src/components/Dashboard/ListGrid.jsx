import { useNavigate } from 'react-router-dom';
import ListCard from './ListCard';

const ListGrid = ({ lists, onDelete }) => {
  const navigate = useNavigate();

  return (
    lists.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-white/10 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">No to-do lists yet</h2>
        <p className="text-slate-400 text-sm mb-5 max-w-xs">Create your first list to start tracking tasks.</p>
        <button
          onClick={() => navigate("/createList")}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 hover:-translate-y-0.5 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create First List
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {lists.map((list, index) => (
          <ListCard
            key={list._id || index}
            list={list}
            onDelete={onDelete}
          />
        ))}
      </div>
    )
  );
};

export default ListGrid;
