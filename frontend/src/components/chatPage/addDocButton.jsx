import { Paperclip } from 'lucide-react';

const AddDocButton = ({ setFile }) => {

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        setFile(file);
    };

    return (
        <div className="relative flex items-center justify-center">
            <input
                id="uploadButton"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.txt, .docx"
            />
            <button
                type="button"
                onClick={() => {
                    document.getElementById("uploadButton").click();
                }}
                className={`
          group relative flex items-center justify-center w-10 h-10 
          rounded-xl border border-white/5 bg-white/5 
          transition-all duration-300 ease-out
          hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:scale-105
          active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
          cursor-pointer overflow-hidden
        `}
                title="Upload Document"
            >
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/0 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <Paperclip
                    size={18}
                    className="text-slate-400 group-hover:text-indigo-400 transition-colors duration-300"
                />
            </button>
        </div>
    );
};

export default AddDocButton;
