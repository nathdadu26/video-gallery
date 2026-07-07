import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Watch from './pages/Watch'

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:id" element={<Watch />} />
        {/* Catch-all */}
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  )
}
