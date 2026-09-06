import { useState } from 'react';
import { loginMember } from '../api/members';
import { storeMember } from '../api/auth';
import { ko } from '../i18n/ko';

export default function LoginPanel({ member, onClose, onLoginSuccess, onLogout }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
        throw new Error(ko.errors.invalidLoginResponse);
      }

      const authenticatedMember = {
        ...member,
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
          : error.message || ko.errors.loginFailed
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (member) {
    return (
      <div className="login-modal" role="presentation">
        <button className="login-modal-backdrop" type="button" aria-label={ko.auth.close} onClick={onClose} />

        <aside className="login-drawer" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <button className="login-close" type="button" aria-label={ko.auth.close} onClick={onClose}>×</button>

          <div className="login-drawer-content">
            <h2 id="login-title">{member.loginId || member.name || 'USER'}님</h2>
            <div className="login-account-menu" aria-label={ko.auth.memberMenu}>
              <button type="button" aria-label={ko.auth.memberInfo} title={ko.auth.memberInfo}>
                <img src="/assets/figma-user.svg" alt="" />
                <span>{ko.auth.memberInfo}</span>
              </button>
              <button type="button" aria-label={ko.auth.wishlist} title={ko.auth.wishlist}>
                <img src="/assets/figma-heart.svg" alt="" />
                <span>{ko.auth.wishlist}</span>
              </button>
              <button type="button" aria-label={ko.auth.cart} title={ko.auth.cart}>
                <img src="/assets/figma-bag.svg" alt="" />
                <span>{ko.auth.cart}</span>
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
              {ko.auth.logout}
            </button>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="login-modal" role="presentation">
      <button className="login-modal-backdrop" type="button" aria-label={ko.auth.close} onClick={onClose} />

      <aside className="login-drawer" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="login-close" type="button" aria-label={ko.auth.close} onClick={onClose}>×</button>

        <div className="login-drawer-content">
          <h2 id="login-title">{ko.auth.login}</h2>

          <p className="login-intro">
            <span>{ko.auth.welcome}</span>
            <a href="#signup">{ko.auth.signup}</a>
          </p>

          <p className="login-required">{ko.auth.required}</p>
          {errorMessage && <p className="login-error" role="alert">{errorMessage}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              {ko.auth.id}
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
              {ko.auth.password}
              <button
                className="password-label"
                type="button"
                aria-label={isPasswordVisible ? ko.auth.passwordHide : ko.auth.passwordShow}
                aria-pressed={isPasswordVisible}
                onClick={() => setIsPasswordVisible((visible) => !visible)}
              >
                {isPasswordVisible ? ko.auth.passwordHideShort : ko.auth.passwordShowShort}
              </button>
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <a className="find-password" href="#find-password">{ko.auth.forgotPassword}</a>

            <button className="login-submit" type="submit" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? ko.auth.loading : ko.auth.login}
            </button>
          </form>

          <div className="social-login" aria-label={ko.auth.easyLogin}>
            <button type="button" className="naver-login">
              <img className="social-login-icon" src="/assets/icon-naver.png" alt="" />
              <span>{ko.auth.naver}</span>
            </button>

            <button type="button" className="kakao-login">
              <img className="social-login-icon" src="/assets/icon-kakaotalk.png" alt="" />
              <span>{ko.auth.kakao}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
