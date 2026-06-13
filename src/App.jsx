import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Fifa2026 from './pages/Fifa2026';
import M3UPlayer from './pages/M3u8player';
export default function App(){

  return(
    <BrowserRouter>
      <Routes>        
        <Route path='/' element={<M3UPlayer />} />
        <Route path='/fifa2026' element={<Fifa2026 />} />
      </Routes>        
    </BrowserRouter>    
  )
}