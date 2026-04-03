import { useNavigate } from 'react-router-dom';

const ListCard = ({ list, onDelete }) => {
  const navigate = useNavigate();

  const total = list.tasks ? list.tasks.length : (list.taskCount || 0);
  const done = list.tasks ? list.tasks.filter(t => t.state).length : (list.doneCount || 0);
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const gradients = [
    'from-emerald-500 to-teal-600',
    'from-sky-500 to-blue-600',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-violet-600',
  ];
  const gradient = gradients[list.title ? list.title.charCodeAt(0) % gradients.length : 0];

  return (
    <div
      onClick={() => navigate(`/list/${list._id}`)}
      className="group relative bg-white/4 hover:bg-white/6 border border-white/8 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col gap-4 cursor-pointer"
    >
      {/* Icon + Title */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="min-w-0">
          <h2 className="text-white font-semibold text-base truncate">{list.title}</h2>
          <span className="text-slate-500 text-xs">
            {total === 0 ? 'No tasks' : `${done}/${total} tasks done`}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="w-full">
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">{progress}% complete</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
        <span className="text-[11px] text-slate-600">
          {new Date(list.updatedAt || list.createdAt).toLocaleDateString()}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(list._id);
          }}
          className="text-xs text-red-400/70 hover:text-red-400 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ListCard;
