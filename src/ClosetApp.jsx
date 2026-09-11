import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import ClosetPage from './components/ClosetPage';
import { ko } from './i18n/ko';
import ArPage from './components/ArPage';
import App from './App';
import { linkMemberToArSession } from './api/arSessions';
import { clearMember, getStoredMember } from './api/auth';

function ClosetRoute({ member, onLoginSuccess, onLogout, onWishlistOpen, onCartOpen, shared = false }) {
  const { profileId } = useParams();

  return (
    <ClosetPage
      member={member}
      sharedStyleProfileId={shared ? profileId : undefined}
      detailStyleProfileId={shared ? undefined : profileId}
      onLoginSuccess={onLoginSuccess}
      onLogout={onLogout}
      onWishlistOpen={onWishlistOpen}
      onCartOpen={onCartOpen}
    />
  );
}

export default function ClosetApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const arLoginSessionId = Number(searchParams.get('arSessionId'));
  const isArLogin = Number.isFinite(arLoginSessionId) && searchParams.get('arLogin') === '1';
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
    navigate('/', { replace: true });
  }

  function handleWishlistOpen() {
    navigate('/wishlist');
  }

  function handleCartOpen() {
    navigate('/cart');
  }

  const appProps = {
    member,
    onLoginSuccess: handleLoginSuccess,
    onLogout: handleLogout,
    autoOpenLogin: isArLogin && !member,
  };

  return (
    <Routes>
      <Route path="/ar" element={<ArPage />} />
      <Route path="/my-closet" element={<ClosetRoute member={member} onLoginSuccess={setMember} onLogout={handleLogout} onWishlistOpen={handleWishlistOpen} onCartOpen={handleCartOpen} />} />
      <Route path="/my-closet/share/:profileId" element={<ClosetRoute shared member={member} onLoginSuccess={setMember} onLogout={handleLogout} onWishlistOpen={handleWishlistOpen} onCartOpen={handleCartOpen} />} />
      <Route path="/my-closet/:profileId" element={<ClosetRoute member={member} onLoginSuccess={setMember} onLogout={handleLogout} onWishlistOpen={handleWishlistOpen} onCartOpen={handleCartOpen} />} />
      <Route path="/cart" element={<App {...appProps} page="cart" />} />
      <Route path="/wishlist" element={<App {...appProps} page="wishlist" />} />
      <Route path="/search" element={<App {...appProps} page="search" />} />
      <Route path="/" element={<App {...appProps} page="home" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
