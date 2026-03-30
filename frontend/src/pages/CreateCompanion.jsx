import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../auth/auth.js';

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

  useEffect(() => {
    checkAuth().then((auth) => {
      if (!auth) {
        navigate('/login', { replace: true });
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  const personalities = ['friendly', 'professional', 'humorous', 'empathetic', 'supportive', 'creative'];
  const styles = ['casual', 'formal', 'enthusiastic', 'calm', 'playful'];
  const expertises = ['general', 'tech', 'lifestyle', 'wellness', 'education'];

  const handleNext = () => {
    if (step === 1 && !formData.name) return alert("Please enter a name");
    if (step === 2 && !formData.personality) return alert("Please select a personality");
    if (step === 3 && !formData.communicationStyle) return alert("Please select a communication style");
    if (step === 4 && !formData.expertise) return alert("Please select expertise");
    if (step === 5 && formData.description.length > 100) return alert("Description must be 100 characters or less");
    
    setStep(step + 1);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, avatar: e.target.files[0] });
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
        alert("Companion created!");
        navigate('/dashboard');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Failed to create companion:", error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Create Your AI Companion</h1>

      {step === 1 && (
        <div>
          <p>Question 1: What is your companion's name?</p>
          <input 
            type="text" 
            placeholder="Name your companion" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          />
          <button onClick={handleNext}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p>Question 2: Select a personality (Required)</p>
          {personalities.map(p => (
            <label key={p} style={{ display: 'block' }}>
              <input 
                type="radio" 
                name="personality" 
                value={p} 
                checked={formData.personality === p}
                onChange={() => setFormData({ ...formData, personality: p })}
              /> {p}
            </label>
          ))}
          <button onClick={handleNext}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <p>Question 3: Select a communication style</p>
          {styles.map(s => (
            <label key={s} style={{ display: 'block' }}>
              <input 
                type="radio" 
                name="style" 
                value={s} 
                checked={formData.communicationStyle === s}
                onChange={() => setFormData({ ...formData, communicationStyle: s })}
              /> {s}
            </label>
          ))}
          <button onClick={handleNext}>Next</button>
        </div>
      )}

      {step === 4 && (
        <div>
          <p>Question 4: What is their area of expertise?</p>
          {expertises.map(e => (
            <label key={e} style={{ display: 'block' }}>
              <input 
                type="radio" 
                name="expertise" 
                value={e} 
                checked={formData.expertise === e}
                onChange={() => setFormData({ ...formData, expertise: e })}
              /> {e}
            </label>
          ))}
          <button onClick={handleNext}>Next</button>
        </div>
      )}

      {step === 5 && (
        <div>
          <p>Question 5: Tell us about your companion (Max 100 characters)</p>
          <textarea 
            placeholder="Helpful, experienced, and always ready to assistant..."
            value={formData.description}
            maxLength={100}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            cols={40}
          />
          <p>{formData.description.length}/100 characters</p>
          <button onClick={handleNext}>Next</button>
        </div>
      )}

      {step === 6 && (
        <div>
          <p>Question 6: Upload an Avatar (Optional)</p>
          <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
          <p>If you skip, we'll use your companion's first letter as an avatar.</p>
          <button onClick={handleSubmit}>Finish & Create</button>
        </div>
      )}
    </div>
  );
};

export default CreateCompanion;
