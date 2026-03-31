import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkAuth } from '../auth/auth.js';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const authData = await checkAuth();
      if (!authData.success) {
        navigate('/login', { replace: true });
      } else {
        try{
          const rest = await fetch(import.meta.env.VITE_GET_USER_API_URL,{
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
          });
          const data = await rest.json();
          const User = data.user;
          setUser(User);
        }
        catch(error){
          console.error("Failed to load user data:", error);
        }
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
      </div>
    </div>
  );

  async function Logout(e) {
    if (e) e.preventDefault();
    try {
      await fetch(import.meta.env.VITE_LOGOUT_API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      navigate('/signup');
    } catch (error) {
      console.error("Account deletion failed:", error);
      navigate('/signup');
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch(import.meta.env.VITE_UPLOAD_AVATAR_API_URL, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        alert("Avatar uploaded successfully! It will be visible across the app.");
        navigate('/dashboard');
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      {/* Topbar */}
      <header className="relative z-10 border-b border-white/5 bg-white/3 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <span className="text-white font-semibold tracking-tight">Profile Settings</span>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12">

        {/* Account Info Card (TBD) */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-[#0a0a0f] shadow-lg shadow-indigo-500/20 overflow-hidden shrink-0">
            {user && user.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-semibold text-3xl">
                {user && user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Account</h1>
            <p className="text-slate-400 text-sm">Manage your profile and active sessions</p>
          </div>
        </div>

        <div className="bg-[#131320] border border-white/5 rounded-2xl p-8 mb-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h2 className="text-xl font-bold text-white mb-2 relative z-10">Account Actions</h2>
          <p className="text-slate-400 text-sm mb-8 relative z-10">Manage your profile, upload a picture, or sign out.</p>

          <div className="flex flex-wrap gap-4 relative z-10">
            <button
              onClick={() => document.getElementById('avatarUpload').click()}
              className="flex items-center gap-3 py-3 px-5 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 transition-all duration-200"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <div className="text-left">
                <p className="text-white font-medium text-sm">Upload Avatar</p>
              </div>
            </button>
            <input
              type="file"
              id="avatarUpload"
              name="avatarUpload"
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={handleAvatarUpload}
            />

            <button
              onClick={Logout}
              className="flex items-center gap-3 py-3 px-5 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 transition-all duration-200"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <div className="text-left">
                <p className="text-white font-medium text-sm">Sign Out</p>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8 shadow-xl mt-12">
          <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
          <p className="text-red-400/80 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm"
          >
            Delete Account
          </button>
        </div>
      </main>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131320] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Delete Account</h3>
                <p className="text-slate-400 text-xs">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-6">Are you sure you want to permanently delete your account and all your companions?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 text-slate-300 hover:text-white font-medium py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-150 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={DeleteAccount}
                className="flex-1 bg-red-500/80 hover:bg-red-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-150 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
