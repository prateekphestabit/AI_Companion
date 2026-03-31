import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateCompanion from './pages/CreateCompanion';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

const LandingPage = () => {
  return (
    <h1>LandingPage</h1>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/createCompanion" element={<CreateCompanion />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat/:companionId" element={<Chat />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
