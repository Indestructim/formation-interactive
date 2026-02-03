import { Routes, Route } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import { SessionProvider } from './context/SessionContext'
import Home from './pages/Home'
import SessionManager from './pages/SessionManager'
import PresenterDashboard from './pages/PresenterDashboard'
import ParticipantView from './pages/ParticipantView'
import PresentationMode from './pages/PresentationMode'

function App() {
  return (
    <SocketProvider>
      <SessionProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sessions" element={<SessionManager />} />
            <Route path="/presenter/:sessionCode" element={<PresenterDashboard />} />
            <Route path="/participant/:sessionCode" element={<ParticipantView />} />
            <Route path="/present/:sessionCode" element={<PresentationMode />} />
          </Routes>
        </div>
      </SessionProvider>
    </SocketProvider>
  )
}

export default App
