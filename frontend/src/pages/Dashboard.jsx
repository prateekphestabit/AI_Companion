import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuth } from '../auth/auth.js';
import Companion from '../components/Companion.jsx';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companions, setCompanions] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        navigate('/login', { replace: true });
      } else {
        try {
          const res = await fetch(import.meta.env.VITE_GET_COMPANIONS_API_URL, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            credentials: "include"
          });
          const data = await res.json();
          if (data.success) setCompanions(data.companions);
        } catch (error) {
          console.error("Failed to load companions:", error);
        }
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  
  async function Logout(e) {
    if (e) e.preventDefault();
    try {
      await fetch(import.meta.env.VITE_LOGOUT_API_URL, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        credentials: "include"
      });
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      navigate('/login');
    }
  }

  async function DeleteAccount(e) {
    if (e) e.preventDefault();
    try {
      await fetch(import.meta.env.VITE_DELETE_ACCOUNT_API_URL, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        credentials: "include"
      });
      navigate('/signup');
    } catch (error) {
      console.error("Account deletion failed:", error);
      navigate('/signup');
    }
  }

  const handleDeleteCompanion = async (companionId) => {
    if (!window.confirm("Are you sure you want to delete this companion?")) return;

    try {
      const res = await fetch(import.meta.env.VITE_DELETE_COMPANION_API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companionId }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setCompanions(prev => prev.filter(c => c._id !== companionId));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Delete companion failed:", error);
    }
  };


  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={Logout}>Logout</button>
      <button onClick={DeleteAccount}>Delete Account</button>

      <div className="companions-section">
        <hr />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2>My Companions</h2>
          <button onClick={() => navigate("/createCompanion")}>Add Companion</button>
        </div>
        {companions.length === 0 ? (
          <p><strong>Ready to meet your AI squad?</strong> Create your first companion today!</p>
        ) : (
          companions.map((comp, index) => (
            <Companion 
              key={comp._id || index} 
              companion={comp} 
              onDelete={handleDeleteCompanion} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
