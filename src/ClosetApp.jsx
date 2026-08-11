import { useEffect, useState } from 'react';
import ClosetPage from './components/ClosetPage';
import App from './App';

export default function ClosetApp() {
  const [showCloset, setShowCloset] = useState(() => window.location.hash === '#closet');

  useEffect(() => {
    const syncPage = () => setShowCloset(window.location.hash === '#closet');
    const openCloset = (event) => {
      const link = event.target.closest('a');
      if (link?.textContent.trim() === 'CLOSET') {
        event.preventDefault();
        window.location.hash = 'closet';
      }
    };
    window.addEventListener('hashchange', syncPage);
    document.addEventListener('click', openCloset);
    return () => {
      window.removeEventListener('hashchange', syncPage);
      document.removeEventListener('click', openCloset);
    };
  }, []);

  return showCloset ? <ClosetPage /> : <App />;
}
