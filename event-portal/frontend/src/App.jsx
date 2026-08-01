import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import Navbar from './components/Navbar';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/organizer/Dashboard';
import BrowseEvents from './pages/attendee/BrowseEvents';
import MyRegistrations from './pages/attendee/MyRegistrations';
import Tasks from './pages/volunteer/Tasks';
import ScanQR from './pages/volunteer/ScanQR';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowed={['ORGANIZER']} />}>
              <Route path="/organizer/dashboard" element={<Dashboard />} />
            </Route>

            <Route element={<RoleRoute allowed={['ATTENDEE']} />}>
              <Route path="/attendee/events" element={<BrowseEvents />} />
              <Route path="/attendee/registrations" element={<MyRegistrations />} />
            </Route>

            <Route element={<RoleRoute allowed={['VOLUNTEER']} />}>
              <Route path="/volunteer/tasks" element={<Tasks />} />
              <Route path="/volunteer/scan" element={<ScanQR />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
