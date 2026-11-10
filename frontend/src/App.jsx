import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import SongsPage from './pages/songs/SongsPage'
import SongFormPage from './pages/songs/SongFormPage'
import SongDetailPage from './pages/songs/SongDetailPage'
import PeoplePage from './pages/people/PeoplePage'
import EventsPage from './pages/events/EventsPage'
import EventFormPage from './pages/events/EventFormPage'
import EventDetailPage from './pages/events/EventDetailPage'
import ScheduleViewPage from './pages/schedules/ScheduleViewPage'
import SettingsPage from './pages/settings/SettingsPage'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard"          element={<DashboardPage />} />

                {/* Canciones */}
                <Route path="/songs"              element={<SongsPage />} />
                <Route path="/songs/new"          element={<SongFormPage />} />
                <Route path="/songs/:id"          element={<SongDetailPage />} />
                <Route path="/songs/:id/edit"     element={<SongFormPage />} />

                {/* Personas */}
                <Route path="/people"             element={<PeoplePage />} />

                {/* Eventos y programaciones */}
                <Route path="/events"                  element={<EventsPage />} />
                <Route path="/events/new"              element={<EventFormPage />} />
                <Route path="/events/:id"              element={<EventDetailPage />} />
                <Route path="/events/:id/edit"         element={<EventFormPage />} />
                <Route path="/events/:id/schedule"     element={<ScheduleViewPage />} />

                {/* Configuración */}
                <Route path="/settings"  element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
