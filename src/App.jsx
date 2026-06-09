import { BrowserRouter, Routes, Route } from 'react-router-dom';
import M3UPlayer from './pages/M3u8player';
export default function App(){

  return(
    <BrowserRouter>
      <Routes>        
        <Route path='/' element={<M3UPlayer />} />
      </Routes>        
    </BrowserRouter>    
  )
}