import { useState } from 'react';
import { loginMember } from '../api/members';
import { storeMember } from '../api/auth';

export default function LoginPanel({ member, onClose, onLoginSuccess, onLogout }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      const member = await loginMember({ loginId, password });

      if (member?.memberId === undefined || member?.memberId === null) {
        throw new Error('로그인 응답을 확인할 수 없습니다.');
      }

      const authenticatedMember = {
        memberId: member.memberId,
        name: member.name || '',
        loginId: member.loginId || loginId,
      };
      // QR 결과 페이지가 새 탭에서 열려도 회원 로그인 상태를 유지합니다.
      storeMember(authenticatedMember);
      await onLoginSuccess?.(authenticatedMember);
      onClose();
    } catch (error) {
      setErrorMessage(
        error.status === 401
          ? error.message
          : error.message || '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (member) {
    return (
      <div className="login-modal" role="presentation">
        <button className="login-modal-backdrop" type="button" aria-label="로그인 창 닫기" onClick={onClose} />

        <aside className="login-drawer" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <button className="login-close" type="button" aria-label="로그인 창 닫기" onClick={onClose}>×</button>

          <div className="login-drawer-content">
            <h2 id="login-title">{member.loginId || member.name || 'USER'}님</h2>
            <div className="login-account-menu" aria-label="회원 메뉴">
              <button type="button" aria-label="회원 정보" title="회원 정보">
                <img src="/assets/figma-user.svg" alt="" />
                <span>회원 정보</span>
              </button>
              <button type="button" aria-label="찜 목록" title="찜 목록">
                <img src="/assets/figma-heart.svg" alt="" />
                <span>찜 목록</span>
              </button>
              <button type="button" aria-label="장바구니" title="장바구니">
                <img src="/assets/figma-bag.svg" alt="" />
                <span>장바구니</span>
              </button>
            </div>
            <button
              className="login-submit"
              type="button"
              onClick={() => {
                onLogout?.();
                onClose();
              }}
            >
              로그아웃
            </button>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="login-modal" role="presentation">
      <button className="login-modal-backdrop" type="button" aria-label="로그인 창 닫기" onClick={onClose} />

      <aside className="login-drawer" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="login-close" type="button" aria-label="로그인 창 닫기" onClick={onClose}>×</button>

        <div className="login-drawer-content">
          <h2 id="login-title">로그인</h2>

          <p className="login-intro">
            <span>회원으로 가입하시면 빠르고 편리하게 이용하실 수 있습니다.</span>
            <a href="#signup">회원가입</a>
          </p>

          <p className="login-required">* 표시가 있는 모든 입력 항목은 필수입니다.</p>
          {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              아이디*
              <input
                type="text"
                name="loginId"
                autoComplete="username"
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                required
              />
            </label>

            <label>
              비밀번호*
              <span className="password-label">표시</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <a className="find-password" href="#find-password">비밀번호를 잊으셨나요?</a>

            <button className="login-submit" type="submit" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="social-login" aria-label="간편 로그인">
            <button type="button" className="naver-login">
              <img className="social-login-icon" src="/assets/icon-naver.png" alt="" />
              <span>네이버 아이디로 로그인</span>
            </button>

            <button type="button" className="kakao-login">
              <img className="social-login-icon" src="/assets/icon-kakaotalk.png" alt="" />
              <span>카카오 로그인</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
