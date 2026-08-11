import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ClosetApp from './ClosetApp';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode><ClosetApp /></StrictMode>,
);
