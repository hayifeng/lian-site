import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import {
  CircularGallery,
  Carousel3D,
  Bubbles,
  Manage,
  Login,
} from './pages';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<CircularGallery />} />
            <Route path="carousel" element={<Carousel3D />} />
            <Route path="bubbles" element={<Bubbles />} />
            <Route path="manage" element={<Manage />} />
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
