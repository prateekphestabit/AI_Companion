import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../auth/auth.js';

const TOTAL_STEPS = 6;

const personalities = ['friendly', 'professional', 'humorous', 'empathetic', 'supportive', 'creative'];
const styles = ['casual', 'formal', 'enthusiastic', 'calm', 'playful'];
const expertises = ['general', 'tech', 'lifestyle', 'wellness', 'education'];

const stepMeta = [
  { title: "Name your companion", subtitle: "Give them a unique identity" },
  { title: "Choose a personality", subtitle: "What defines their character?" },
  { title: "Communication style", subtitle: "How do they talk?" },
  { title: "Area of expertise", subtitle: "What are they best at?" },
  { title: "A short bio", subtitle: "For what you will be using this companion?" },
  { title: "Upload an avatar", subtitle: "A face for your companion (optional)" },
];

const OptionCard = ({ value, selected, onClick, emoji }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all duration-150 ${
      selected
        ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300 shadow-md shadow-indigo-500/10'
        : 'bg-white/4 border-white/8 text-slate-300 hover:bg-white/7 hover:border-white/15'
    }`}
  >
    <span className="mr-2">{emoji}</span>
    {value}
  </button>
);

const emojiMap = {
  // personalities
  friendly: '😊', professional: '💼', humorous: '😄', empathetic: '❤️', supportive: '🤝', creative: '🎨',
  // styles
  casual: '👋', formal: '🎩', enthusiastic: '🚀', calm: '🌊', playful: '🎉',
  // expertises
  general: '🌐', tech: '💻', lifestyle: '✨', wellness: '🌿', education: '📚',
};

const CreateCompanion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    personality: '',
    communicationStyle: '',
    expertise: '',
    description: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    checkAuth().then((auth) => {
      if (!auth.success) {
        navigate('/login', { replace: true });
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
    </div>
  );

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) return alert("Please enter a name");
    if (step === 2 && !formData.personality) return alert("Please select a personality");
    if (step === 3 && !formData.communicationStyle) return alert("Please select a communication style");
    if (step === 4 && !formData.expertise) return alert("Please select expertise");
    if (step === 5 && formData.description.length > 100) return alert("Description must be 100 characters or less");
    setStep(step + 1);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, avatar: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append('name', formData.name);
    data.append('personality', formData.personality);
    data.append('communicationStyle', formData.communicationStyle);
    data.append('expertise', formData.expertise);
    data.append('description', formData.description);
    if (formData.avatar) {
      data.append('avatar', formData.avatar);
    }

    try {
      const res = await fetch(import.meta.env.VITE_CREATE_COMPANION_API_URL, {
        method: 'POST',
        body: data,
        credentials: 'include'
      });
      const result = await res.json();
      if (result.success) {
        navigate('/dashboard');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to create companion:", error);
    }
  };

  const progress = ((step - 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Glows */}
      <div className="fixed top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-15%] right-[-5%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[110px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-white/3 backdrop-blur-md flex-shrink-0">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <span className="text-slate-500 text-xs font-medium">Step {step} of {TOTAL_STEPS}</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 h-0.5 bg-white/5 flex-shrink-0">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-start justify-center pt-10 pb-16 px-4">
        <div className="w-full max-w-lg">
          {/* Step header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i < step ? 'bg-indigo-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{stepMeta[step - 1].title}</h1>
            <p className="text-slate-400 text-sm mt-1">{stepMeta[step - 1].subtitle}</p>
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <input
                id="companionName"
                name="companionName"
                type="text"
                placeholder="e.g. Aria, Max, Nova..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition-all duration-200"
                autoFocus
              />
              <button onClick={handleNext} className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Personality */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {personalities.map(p => (
                  <OptionCard
                    key={p}
                    value={p}
                    emoji={emojiMap[p]}
                    selected={formData.personality === p}
                    onClick={() => setFormData({ ...formData, personality: p })}
                  />
                ))}
              </div>
              <button onClick={handleNext} disabled={!formData.personality} className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5">
                Continue →
              </button>
            </div>
          )}

          {/* Step 3: Communication style */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {styles.map(s => (
                  <OptionCard
                    key={s}
                    value={s}
                    emoji={emojiMap[s]}
                    selected={formData.communicationStyle === s}
                    onClick={() => setFormData({ ...formData, communicationStyle: s })}
                  />
                ))}
              </div>
              <button onClick={handleNext} disabled={!formData.communicationStyle} className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5">
                Continue →
              </button>
            </div>
          )}

          {/* Step 4: Expertise */}
          {step === 4 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {expertises.map(e => (
                  <OptionCard
                    key={e}
                    value={e}
                    emoji={emojiMap[e]}
                    selected={formData.expertise === e}
                    onClick={() => setFormData({ ...formData, expertise: e })}
                  />
                ))}
              </div>
              <button onClick={handleNext} disabled={!formData.expertise} className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5">
                Continue →
              </button>
            </div>
          )}

          {/* Step 5: Description */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  id="companionDescription"
                  name="companionDescription"
                  placeholder="Diet and fitness coach, Code reviewer, Itenary planner, etc..."
                  value={formData.description}
                  maxLength={100}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition-all duration-200 resize-none"
                />
                <span className={`absolute bottom-3 right-3 text-xs ${formData.description.length > 90 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {formData.description.length}/100
                </span>
              </div>
              <button onClick={handleNext} className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5">
                Continue →
              </button>
              <button 
                onClick={() => {
                  setFormData({ ...formData, description: '' });
                  handleNext();
                }} 
                className="w-full text-slate-400 hover:text-slate-300 text-sm py-2 transition-colors duration-150"
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 6: Avatar */}
          {step === 6 && (
            <div className="space-y-5">
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-white/15 rounded-2xl cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200 overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-48 object-cover" />
                ) : (
                  <div className="py-10 flex flex-col items-center gap-3 text-center px-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-300 text-sm font-medium">Click to upload image</p>
                      <p className="text-slate-500 text-xs mt-0.5">PNG or JPEG</p>
                    </div>
                  </div>
                )}
                <input
                  id="avatarUpload"
                  name="avatarUpload"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {avatarPreview && (
                <button onClick={() => { setAvatarPreview(null); setFormData({...formData, avatar: null}); }} className="w-full text-slate-400 hover:text-slate-300 text-sm py-2 transition-colors">
                  Remove image
                </button>
              )}
              <p className="text-slate-500 text-xs text-center">If you skip, we'll use your companion's first letter as an avatar.</p>
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                🎉 Create Companion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCompanion;
