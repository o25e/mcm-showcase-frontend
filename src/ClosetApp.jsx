import { useEffect, useRef, useState } from 'react';
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
  const initialArMember = useRef(member);

  useEffect(() => {
    const existingMember = initialArMember.current;
    if (!isArLogin || existingMember?.memberId === undefined || existingMember?.memberId === null) return undefined;

    let isActive = true;

    async function linkExistingMemberToArSession() {
      try {
        const gender = typeof existingMember.gender === 'string'
          ? existingMember.gender.trim().toUpperCase()
          : null;
        const response = await fetch(`${API_BASE_URL}/api/ar-sessions/${arLoginSessionId}/member`, {
          method: 'PATCH',
          headers: { Accept: '*/*', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: existingMember.memberId,
            ...(gender ? { gender } : {}),
          }),
        });

        if (!response.ok) throw new Error(`AR member link failed (${response.status})`);
      } catch (error) {
        if (isActive) console.error('기존 회원 AR 세션 연결 오류:', error);
      }
    }

    linkExistingMemberToArSession();
    return () => {
      isActive = false;
    };
  }, [arLoginSessionId, isArLogin]);

  useEffect(() => {
    const isClosetRoute = () => /^\/my-closet(?:\/|$)/i.test(window.location.pathname);
    const syncPage = () => setShowCloset(window.location.hash === '#closet' || isClosetRoute());

    const openCloset = (event) => {
      const link = event.target.closest('a');

      if (link?.textContent.trim() === 'CLOSET') {
        event.preventDefault();
        // Return to the closet list route when navigating through the menu.
        window.history.pushState({}, '', '/my-closet');
        setShowCloset(true);
      }
    };

    window.addEventListener('hashchange', syncPage);
    window.addEventListener('popstate', syncPage);
    document.addEventListener('click', openCloset);

    return () => {
      window.removeEventListener('hashchange', syncPage);
      window.removeEventListener('popstate', syncPage);
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
        autoOpenLogin={isArLogin && !member}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />;
}
