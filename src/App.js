import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import Tweet from './pages/Tweet'; // Import the Tweet page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Home />} />
        <Route path="/users/:user_id" element={<UserProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/tweet/:id" element={<Tweet />} /> {/* Add the Tweet page route */}
      </Routes>
    </Router>
  );
}

export default App;
