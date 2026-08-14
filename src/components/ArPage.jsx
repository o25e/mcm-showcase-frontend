import { useEffect, useState } from 'react'; 
 
const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR']; 
 
export default function ArPage() { 
  const [language, setLanguage] = useState('ko'); 
  const [screen, setScreen] = useState('intro'); 
  const isIntro = screen === 'intro'; 
  const isMemberLogin = screen === 'member-login'; 
  const isMemberLoading = screen === 'member-loading'; 
  const isConsent = screen === 'consent'; 
 
  useEffect(() => { 
    if (screen !== 'member-loading') return; 
 
    const timer = setTimeout(() => { 
      setScreen('consent'); 
    }, 3500); 
 
    return () => clearTimeout(timer); 
  }, [screen]); 
 
  return ( 
    <main className={`ar-page ${isIntro ? 'ar-page--intro' : 'ar-page--flow'}`}> 
      <img className="ar-page__background" src="/assets/ar-background.png" alt="MCM 매장 내부" /> 
      <div className="ar-page__shade" aria-hidden="true" /> 
 
      {isIntro ? <> 
        <img className="ar-page__mask" src="/assets/ar-mask.svg" alt="" aria-hidden="true" /> 
        <h1 className="ar-page__title">AR FITTING</h1> 
        <section className="ar-page__content" aria-labelledby="ar-intro"> 
          <span className="ar-page__logo" aria-label="MCM"><img src="/assets/ar-mcm-logo.png" alt="" /></span> 
          <p id="ar-intro">{language === 'ko' ? '나만의 MCM 스타일을 만나보세요.' : 'Discover your own MCM style.'}</p> 
          <button className="ar-page__start" type="button" onClick={() => setScreen('member-check')}>START</button> 
        </section> 
        <div className="ar-page__language" role="group" aria-label="언어 선택"> 
          <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button> 
          <button type="button" className={language === 'ko' ? 'active' : ''} onClick={() => setLanguage('ko')}>한국어</button> 
        </div> 
      </> : screen === 'member-check' ? <section className="ar-page__choice" aria-labelledby="member-question"> 
        <img className="ar-page__mask" src="/assets/ar-mask.svg" alt="" aria-hidden="true" /> 
        <h1 className="ar-page__title">AR FITTING</h1> 
        <span className="ar-page__divider" aria-hidden="true" /> 
        <p id="member-question" className="ar-page__question">MCM 회원이신가요?</p> 
        <div className="ar-page__choices"> 
          <button type="button" onClick={() => setScreen('member-login')}>네</button> 
          <button type="button" onClick={() => setScreen('guest-gender')}>아니요</button> 
        </div> 
      </section> : <section className="ar-page__flow-content" aria-labelledby={isMemberLoading ? 'loading-message' : isConsent ? 'consent-message' : 'flow-question'}> 
        <nav className="ar-page__progress" aria-label="AR fitting progress"> 
          {steps.map((label, index) => <span className={index === 0 ? 'active' : ''} key={label}>{index === 0 ? (isMemberLogin || isMemberLoading || isConsent ? 'LOGIN' : 'GENDER') : label}</span>)} 
        </nav> 
        <div className="ar-page__progress-track" aria-hidden="true"><span /></div> 
        {isMemberLoading ? <> 
          <span className="ar-page__divider ar-page__divider--loading" aria-hidden="true" /> 
          <p id="loading-message" className="ar-page__loading-message">지난번 MCM에서의 쇼핑 여정을 불러오고 있어요.</p> 
          <img className="ar-page__loading-spinner" src="/assets/ar-loading.png" alt="쇼핑 여정을 불러오는 중" /> 
        </> : isConsent ? <> 
          <img className="ar-page__continue-icon" src="/assets/ar-continue-icon.svg" alt="" aria-hidden="true" /> 
          <p id="consent-message" className="ar-page__continue-title">지난번의 쇼핑 여정을 이어서 시작하겠습니다.</p> 
          <p className="ar-page__continue-copy">오늘도 고객님의 스타일에 맞춰<br />새로운 MCM 경험을 준비했어요.</p> 
          <button className="ar-page__continue-button" type="button" onClick={() => setScreen('consent-form')}>계속하기</button> 
        </> : <> 
          <span className="ar-page__divider" aria-hidden="true" /> 
          <p id="flow-question" className="ar-page__question">{isMemberLogin ? 'MCM 회원 로그인을 진행해주세요.' : '당신의 성별을 선택해주세요.'}</p> 
          {isMemberLogin ? <> 
            <img className="ar-page__qr" src="/assets/ar-login-qr.png" alt="MCM 회원 로그인 QR 코드" /> 
            <p className="ar-page__qr-copy">QR을 스캔하면<br />나의 쇼핑 여정을 불러올 수 있어요.</p> 
            <button className="ar-page__login-test" type="button" onClick={() => setScreen('member-loading')}>로그인 완료</button> 
          </> : <div className="ar-page__choices"><button type="button">여성</button><button type="button">남성</button></div>} 
        </>} 
      </section>} 
    </main> 
  ); 
}