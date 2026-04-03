import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateCompanion from './pages/CreateCompanion';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import CreateList from './pages/CreateList';
import CreateNote from './pages/CreateNote';
import ListDetail from './pages/ListDetail';
import NoteDetail from './pages/NoteDetail';
import LandingPage from './pages/landingPage'
import Analytics from './pages/Analytics'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/createCompanion" element={<CreateCompanion />} />
        <Route path="/createList" element={<CreateList />} />
        <Route path="/createNote" element={<CreateNote />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat/:companionId" element={<Chat />} />
        <Route path="/list/:listId" element={<ListDetail />} />
        <Route path="/note/:noteId" element={<NoteDetail />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

