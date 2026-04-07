import { Routes, Route } from 'react-router-dom'
import Library from './pages/Library'
import Viewer from './pages/Viewer'
import Editor from './pages/Editor'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/guide/:id" element={<Viewer />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:id" element={<Editor />} />
      </Routes>
    </div>
  )
}
