import { useEffect, useState } from 'react'; 
 
const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR']; 
 
export default function ArPage() { 
  const [language, setLanguage] = useState('ko'); 
  const [screen, setScreen] = useState('intro'); 
  const isIntro = screen === 'intro'; 
  const isMemberLogin = screen === 'member-login'; 
  const isMemberLoading = screen === 'member-loading'; 
  const isConsent = screen === 'consent'; 
  const isConsentForm = screen === 'consent-form'; 
  const isScan = screen === 'scan'; 
  const isScanning = screen === 'scanning'; 
 
  useEffect(() => { 
    if (screen !== 'member-loading') return; 
 
    const timer = setTimeout(() => { 
      setScreen('consent'); 
    }, 7500); 
 
    return () => clearTimeout(timer); 
  }, [screen]); 
 
  useEffect(() => { 
    if (screen !== 'scan') return; 
 
    const timer = setTimeout(() => { 
      setScreen('scanning'); 
    }, 3000); 
 
    return () => clearTimeout(timer); 
  }, [screen]); 
 
  return ( 
    <main className={`ar-page ${isIntro ? 'ar-page--intro' : 'ar-page--flow'} ${isScanning ? 'ar-page--scanning' : ''}`}> 
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
      </section> : <section className="ar-page__flow-content" aria-labelledby={isMemberLoading ? 'loading-message' : isConsent ? 'consent-message' : isConsentForm ? 'consent-form-title' : isScan ? 'scan-title' : isScanning ? 'scanning-title' : 'flow-question'}> 
        <nav className="ar-page__progress" aria-label="AR fitting progress"> 
          {steps.map((label, index) => <span className={index === 0 || (isConsentForm && index === 1) || ((isScan || isScanning) && index <= 2) ? 'active' : ''} key={label}>{index === 0 ? (isMemberLogin || isMemberLoading || isConsent || isConsentForm || isScan || isScanning ? 'LOGIN' : 'GENDER') : label}</span>)} 
        </nav> 
          <div className={`ar-page__progress-track ${isConsentForm ? 'ar-page__progress-track--consent' : ''} ${isScan ? 'ar-page__progress-track--scan' : ''} ${isScanning ? 'ar-page__progress-track--scanning' : ''}`} aria-hidden="true"><span /></div>
        {isMemberLoading ? <> 
          <span className="ar-page__divider ar-page__divider--loading" aria-hidden="true" /> 
          <p id="loading-message" className="ar-page__loading-message">지난번 MCM에서의 쇼핑 여정을 불러오고 있어요.</p> 
          <img className="ar-page__loading-spinner" src="/assets/ar-loading.png" alt="쇼핑 여정을 불러오는 중" /> 
        </> : isConsent ? <> 
          <img className="ar-page__continue-icon" src="/assets/ar-continue-icon.svg" alt="" aria-hidden="true" /> 
          <p id="consent-message" className="ar-page__continue-title">지난번의 쇼핑 여정을 이어서 시작하겠습니다.</p> 
          <p className="ar-page__continue-copy">오늘도 고객님의 스타일에 맞춰<br />새로운 MCM 경험을 준비했어요.</p> 
          <button className="ar-page__continue-button" type="button" onClick={() => setScreen('consent-form')}>계속하기</button> 
        </> : isConsentForm ? <> 
          <span className="ar-page__divider ar-page__divider--consent" aria-hidden="true" /> 
          <p id="consent-form-title" className="ar-page__consent-title">나만을 위한 피팅을 준비할게요.</p> 
          <div className="ar-page__consent-box"> 
            <img className="ar-page__consent-icon" src="/assets/ar-camera-icon.svg" alt="" aria-hidden="true" /> 
            <p className="ar-page__consent-description">카메라를 통해 신체 형태와 현재 착장을 인식해<br />나에게 어울리는 스타일을 확인합니다.</p> 
            <p className="ar-page__consent-question">개인정보 수집 및 이용에 동의하십니까?</p> 
            <button className="ar-page__consent-button" type="button" onClick={() => setScreen('scan')}>동의하고 스캔 시작</button> 
          </div> 
        </> : isScan ? <> 
          <span className="ar-page__divider ar-page__divider--scan" aria-hidden="true" /> 
          <p id="scan-title" className="ar-page__scan-title">스캔을 준비하고 있습니다.</p> 
          <img className="ar-page__scan-guide" src="/assets/ar-scan-guide.png" alt="스캔 자세 가이드" /> 
          <div className="ar-page__scan-description"> 
            <p>바닥의 가이드 라인에 맞춰 서주세요.</p> 
            <p>화면의 실루엣에 맞춰 자연스럽게 정면을 바라봐 주세요.</p> 
          </div> 
        </> : isScanning ? <> 
          <span className="ar-page__divider ar-page__divider--scanning" aria-hidden="true" /> 
          <p id="scanning-title" className="ar-page__scanning-title">당신의 스타일을 살펴보고 있어요.</p> 
          <img className="ar-page__scanning-wave" src="/assets/ar-scanning-wave.png" alt="" aria-hidden="true" /> 
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