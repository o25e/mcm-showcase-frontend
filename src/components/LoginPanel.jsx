export default function LoginPanel({ onClose }) {
  return <div className="login-modal" role="presentation">
    <button className="login-modal-backdrop" type="button" aria-label="로그인 창 닫기" onClick={onClose} />
    <aside className="login-drawer" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <button className="login-close" type="button" aria-label="로그인 창 닫기" onClick={onClose}>×</button>
      <div className="login-drawer-content">
        <h2 id="login-title">로그인</h2>
        <p className="login-intro"><span>회원으로 가입하시면 빠르고 편리하게 이용하실 수 있습니다.</span><a href="#signup">회원가입</a></p>
        <p className="login-required">* 표시가 있는 모든 입력 항목은 필수입니다.</p>
        <form className="login-form" onSubmit={(event) => event.preventDefault()}>
          <label>이메일 주소*<input type="email" name="email" autoComplete="email" required /></label>
          <label>비밀번호*<span className="password-label">표시</span><input type="password" name="password" autoComplete="current-password" required /></label>
          <a className="find-password" href="#find-password">비밀번호를 잊으셨나요?</a>
          <button className="login-submit" type="submit">로그인</button>
        </form>
        <div className="social-login" aria-label="간편 로그인">
          <button type="button" className="naver-login"><img className="social-login-icon" src="/assets/icon-naver.png" alt="" /><span>네이버 아이디로 로그인</span></button>
          <button type="button" className="kakao-login"><img className="social-login-icon" src="/assets/icon-kakaotalk.png" alt="" /><span>카카오 로그인</span></button>
        </div>
      </div>
    </aside>
  </div>;
}
