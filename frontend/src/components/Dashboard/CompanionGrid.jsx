import { useNavigate } from 'react-router-dom';
import Companion from './Companion';

const CompanionGrid = ({ companions, onDelete }) => {
    const navigate = useNavigate();

    return (
        /* Companions grid */
        companions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-white/10 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Ready to meet your AI squad?</h2>
                <p className="text-slate-400 text-sm mb-6 max-w-xs">Create your first companion and start building your personal AI team.</p>
                <button
                    onClick={() => navigate("/createCompanion")}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:-translate-y-0.5 text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create First Companion
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {companions.map((comp, index) => (
                    <Companion
                        key={comp._id || index}
                        companion={comp}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        )
    );
}

export default CompanionGrid;