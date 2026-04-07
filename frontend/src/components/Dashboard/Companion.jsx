import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

const CustomSelect = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div 
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-3 py-2 text-white text-sm cursor-pointer hover:border-indigo-500/50 flex justify-between items-center transition-all shadow-inner"
      >
        <span className="capitalize">{value || "Select..."}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
      
      {open && (
        <div className="absolute z-50 w-full mt-2 bg-[#12121a]/95 backdrop-blur-3xl border border-white/20 rounded-xl p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] shadow-indigo-500/20 animate-in fade-in zoom-in-95 max-h-48 overflow-y-auto custom-scrollbar">
          {options.map((opt) => (
            <div 
              key={opt}
              onClick={(e) => { e.stopPropagation(); onChange(opt); setOpen(false); }}
              className={`px-3 py-2 rounded-lg text-sm cursor-pointer capitalize transition-all ${value === opt ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Companion = ({ companion, onDelete, onRefresh }) => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'edit' or 'duplicate'
  const [formData, setFormData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = (mode) => {
    setModalMode(mode);
    setFormData({
      companionId: companion._id,
      name: companion.name || '',
      personality: companion.personality || '',
      communicationStyle: companion.communicationStyle || '',
      expertise: companion.expertise || '',
      description: companion.description || '',
      systemPrompt: companion.systemPrompt || '',
      avatar: null,
      removeAvatar: false
    });
    setAvatarPreview(companion.avatar || null);
    setIsModalOpen(true);
    setShowOptions(false);
  };

  const handleModalSubmit = async (e) => {
    e.stopPropagation();
    if (!formData.name || !formData.personality || !formData.communicationStyle || !formData.expertise) {
      alert("Please fill in all required fields!");
      return;
    }

    setIsSubmitting(true);
    const baseUrl = import.meta.env.VITE_DELETE_COMPANION_API_URL.replace('/delete', ''); 
    const apiUrl = modalMode === 'edit' ? `${baseUrl}/edit` : `${baseUrl}/duplicate`;

    const data = new FormData();
    data.append('companionId', formData.companionId);
    data.append('name', formData.name);
    data.append('personality', formData.personality);
    data.append('communicationStyle', formData.communicationStyle);
    data.append('expertise', formData.expertise);
    data.append('description', formData.description);
    if (formData.systemPrompt) {
      data.append('systemPrompt', formData.systemPrompt);
    }
    if (formData.avatar) {
      data.append('avatar', formData.avatar);
    }
    if (formData.removeAvatar) {
      data.append('removeAvatar', 'true');
    }

    try {
      const res = await fetch(apiUrl, {
        method: modalMode === 'edit' ? 'PUT' : 'POST',
        body: data,
        credentials: 'include'
      });
      const result = await res.json();
      if (result.success) {
        setIsModalOpen(false);
        if (onRefresh) onRefresh();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(`Failed to ${modalMode} companion:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

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
            className="w-16 h-16 rounded-xl object-cover border border-white/10 flex-shrink-0"
          />
        ) : (
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0`}>
            {avatarLetter}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-white font-semibold text-lg truncate">{companion.name}</h2>
          <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${personalityColor} capitalize`}>
            {companion.personality}
          </span>
        </div>
      </div>

      {/* Description */}
      {companion.description && (
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{companion.description}</p>
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
        {/* Options trigger */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions(!showOptions);
            }}
            className={`w-8 h-8 rounded-xl border transition-all duration-300 flex items-center justify-center ${showOptions ? 'text-white border-indigo-400 bg-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]' : 'border-white/10 text-slate-400 bg-white/5 hover:text-white hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:shadow-[0_0_15px_-5px_rgba(99,102,241,0.3)]'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
          </button>

          {showOptions && (
            <div className="absolute bottom-11 left-0 bg-[#12121a]/95 backdrop-blur-3xl border border-white/20 rounded-2xl p-2 z-30 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] shadow-indigo-500/20 w-44 transform origin-bottom-left transition-all duration-300 animate-in fade-in zoom-in-95">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal('edit');
                }}
                className="w-full flex items-center group text-sm text-slate-300 font-medium px-2 py-2 rounded-xl hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-transparent hover:text-amber-100 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center mr-3 group-hover:bg-amber-500/30 group-hover:border-amber-500/50 text-slate-400 group-hover:text-amber-400 transition-all duration-200 shadow-inner group-hover:shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </div>
                Edit Detail
              </button>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-1"></div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal('duplicate');
                }}
                className="w-full flex items-center group text-sm text-slate-300 font-medium px-2 py-2 rounded-xl hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-transparent hover:text-indigo-100 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center mr-3 group-hover:bg-indigo-500/30 group-hover:border-indigo-500/50 text-slate-400 group-hover:text-indigo-400 transition-all duration-200 shadow-inner group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                </div>
                Duplicate
              </button>
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

      {/* Modal Overlay for Edit/Duplicate */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
        >
          <div 
            className="bg-[#0f0f16] border border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6">
              {modalMode === 'edit' ? 'Edit Companion' : 'Duplicate Companion'}
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-indigo-500/60 outline-none"
                />
              </div>

              {/* Personality */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Personality</label>
                <CustomSelect
                  value={formData.personality}
                  options={['friendly', 'professional', 'humorous', 'empathetic', 'supportive', 'creative']}
                  onChange={(val) => setFormData({...formData, personality: val})}
                />
              </div>

              {/* Communication Style */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Communication Style</label>
                <CustomSelect
                  value={formData.communicationStyle}
                  options={['casual', 'formal', 'enthusiastic', 'calm', 'playful']}
                  onChange={(val) => setFormData({...formData, communicationStyle: val})}
                />
              </div>

              {/* Expertise */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Expertise</label>
                <CustomSelect
                  value={formData.expertise}
                  options={['general', 'tech', 'lifestyle', 'wellness', 'education']}
                  onChange={(val) => setFormData({...formData, expertise: val})}
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Bio (optional)</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-indigo-500/60 outline-none resize-none"
                  rows={2}
                />
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">System Prompt</label>
                <textarea 
                  value={formData.systemPrompt || ''} 
                  onChange={(e) => setFormData({...formData, systemPrompt: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-[13px] font-mono focus:border-indigo-500/60 outline-none resize-y"
                  rows={4}
                />
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Avatar (optional)</label>
                <div className="flex items-center gap-4 mt-2">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-lg shadow-indigo-500/10" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 shadow-inner">
                      ?
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 self-start">
                      Upload New
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg" 
                        className="hidden" 
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({ ...formData, avatar: file, removeAvatar: false });
                            const reader = new FileReader();
                            reader.onloadend = () => setAvatarPreview(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {avatarPreview && (
                      <button
                        onClick={(e) => {
                           e.stopPropagation();
                           setAvatarPreview(null);
                           setFormData({ ...formData, avatar: null, removeAvatar: true });
                        }}
                        className="text-[11px] font-medium text-red-400 hover:text-red-300 px-3 py-1 text-left transition-colors hover:bg-red-500/10 rounded-lg"
                      >
                        Remove Avatar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleModalSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : modalMode === 'edit' ? 'Save' : 'Duplicate'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Companion;
