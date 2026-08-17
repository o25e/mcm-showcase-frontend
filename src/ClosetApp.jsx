import { useEffect, useState } from 'react';
import ClosetPage from './components/ClosetPage';
import ArPage from './components/ArPage';
import App from './App';
import { API_BASE_URL } from './api/config';
import { clearMember, getStoredMember } from './api/auth';

export default function ClosetApp() {
  const isArPage = window.location.pathname.toLowerCase() === '/ar';
  const arLoginSessionId = Number(new URLSearchParams(window.location.search).get('arSessionId'));
  const isArLogin = Number.isFinite(arLoginSessionId) && new URLSearchParams(window.location.search).get('arLogin') === '1';
  const sharedProfileMatch = window.location.pathname.match(/^\/my-closet\/share\/([^/]+)\/?$/i);
  const detailProfileMatch = window.location.pathname.match(/^\/my-closet\/([^/]+)\/?$/i);
  const isMyCloset = window.location.pathname.toLowerCase() === '/my-closet';
  const [showCloset, setShowCloset] = useState(() => window.location.hash === '#closet' || Boolean(sharedProfileMatch) || Boolean(detailProfileMatch) || isMyCloset);
  const [member, setMember] = useState(getStoredMember);

  useEffect(() => {
    const syncPage = () => setShowCloset(window.location.hash === '#closet');

    const openCloset = (event) => {
      const link = event.target.closest('a');

      if (link?.textContent.trim() === 'CLOSET') {
        event.preventDefault();
        // A detail view can leave `/my-closet/:styleProfileId` in the URL.
        // Clear that detail route when returning through the CLOSET menu so
        // the detail panel is opened only after an explicit record click.
        if (/^\/my-closet\/[^/]+\/?$/i.test(window.location.pathname)) {
          window.history.replaceState({}, '', '/my-closet#closet');
          setShowCloset(true);
        } else {
          window.location.hash = 'closet';
        }
      }
    };

    window.addEventListener('hashchange', syncPage);
    document.addEventListener('click', openCloset);

    return () => {
      window.removeEventListener('hashchange', syncPage);
      document.removeEventListener('click', openCloset);
    };
  }, []);

  async function handleLoginSuccess(authenticatedMember) {
    if (isArLogin) {
      const gender = typeof authenticatedMember.gender === 'string'
        ? authenticatedMember.gender.trim().toUpperCase()
        : null;
      const response = await fetch(`${API_BASE_URL}/api/ar-sessions/${arLoginSessionId}/member`, {
        method: 'PATCH',
        headers: { Accept: '*/*', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: authenticatedMember.memberId,
          ...(gender ? { gender } : {}),
        }),
      });

      if (!response.ok) throw new Error(`AR member link failed (${response.status})`);
    }

    setMember(authenticatedMember);
  }

  function handleLogout() {
    clearMember();
    setMember(null);
    window.history.replaceState({}, '', '/');
    setShowCloset(false);
  }

  if (isArPage) return <ArPage />;

  return showCloset
    ? <ClosetPage
        member={member}
        sharedStyleProfileId={sharedProfileMatch?.[1]}
        detailStyleProfileId={detailProfileMatch?.[1]}
        onLoginSuccess={setMember}
        onLogout={handleLogout}
      />
    : <App
        member={member}
        autoOpenLogin={isArLogin}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />;
}
