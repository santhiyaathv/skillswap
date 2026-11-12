
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/home'
import Auth from './pages/Auth'
import Dashboard from './pages/dashboard'
import Messages from './pages/Messages'
import MessagesShortcut from './components/MessagesShortcut'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <>
              <Dashboard />
              <MessagesShortcut />
            </>
          }
        />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
