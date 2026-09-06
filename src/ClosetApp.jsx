import { useEffect, useRef, useState } from 'react';
import ClosetPage from './components/ClosetPage';
import { ko } from './i18n/ko';
import ArPage from './components/ArPage';
import App from './App';
import { linkMemberToArSession } from './api/arSessions';
import { clearMember, getStoredMember } from './api/auth';

export default function ClosetApp() {
  const isArPage = window.location.pathname.toLowerCase() === '/ar';
  const arLoginSessionId = Number(new URLSearchParams(window.location.search).get('arSessionId'));
  const isArLogin = Number.isFinite(arLoginSessionId) && new URLSearchParams(window.location.search).get('arLogin') === '1';
  const sharedProfileMatch = window.location.pathname.match(/^\/my-closet\/share\/([^/]+)\/?$/i);
  const detailProfileMatch = window.location.pathname.match(/^\/my-closet\/([^/]+)\/?$/i);
  const isMyCloset = window.location.pathname.toLowerCase() === '/my-closet';
  const [showCloset, setShowCloset] = useState(() => window.location.hash === '#closet' || Boolean(sharedProfileMatch) || Boolean(detailProfileMatch) || isMyCloset);
  const [openWishlistPage, setOpenWishlistPage] = useState(false);
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
        await linkMemberToArSession(arLoginSessionId, {
          memberId: existingMember.memberId,
          gender,
        });
      } catch (error) {
        if (isActive) console.error(ko.errors.memberSession, error);
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
      await linkMemberToArSession(arLoginSessionId, {
        memberId: authenticatedMember.memberId,
        gender,
      });
    }

    setMember(authenticatedMember);
  }

  function handleLogout() {
    clearMember();
    setMember(null);
    window.history.replaceState({}, '', '/');
    setShowCloset(false);
  }

  function handleWishlistOpen() {
    window.history.pushState({}, '', '/');
    setOpenWishlistPage(true);
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
        onWishlistOpen={handleWishlistOpen}
      />
    : <App
        member={member}
        autoOpenLogin={isArLogin && !member}
        autoOpenWishlist={openWishlistPage}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />;
}
