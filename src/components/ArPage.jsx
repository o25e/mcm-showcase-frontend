import { useEffect, useState } from 'react';
import FittingHelpOverlay from './FittingHelpOverlay';
import FittingPage from './FittingPage';
import AvatarCompletePage from './AvatarCompletePage';
import { getArCopy } from './arCopy';

const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];

export default function ArPage() {
  const [language, setLanguage] = useState('ko');
  const [screen, setScreen] = useState('intro');
  const [completedAvatar, setCompletedAvatar] = useState('/assets/avatar-complete/avatar.png');
  const t = getArCopy(language);
  const isIntro = screen === 'intro';
  const isMemberLogin = screen === 'member-login';
  const isMemberLoading = screen === 'member-loading';
  const isConsent = screen === 'consent';
  const isConsentForm = screen === 'consent-form';
  const isScan = screen === 'scan';
  const isScanning = screen === 'scanning';
  const isFittingHelp = screen === 'fitting-help';
  const isFitting = screen === 'fitting';
  const isAvatarComplete = screen === 'avatar-complete';

  useEffect(() => {
    if (screen !== 'member-loading') return undefined;
    const timer = setTimeout(() => setScreen('consent'), 7500);
    return () => clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'scan') return undefined;
    const timer = setTimeout(() => setScreen('scanning'), 3000);
    return () => clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'scanning') return undefined;
    const timer = setTimeout(() => setScreen('fitting-help'), 3000);
    return () => clearTimeout(timer);
  }, [screen]);

  if (isFittingHelp) return <FittingHelpOverlay language={language} onClose={() => setScreen('fitting')} />;
  if (isFitting) return <FittingPage language={language} onFinish={() => { setCompletedAvatar('/assets/avatar-complete/avatar.png'); setScreen('avatar-complete'); }} />;
  if (isAvatarComplete) return <AvatarCompletePage language={language} avatarImage={completedAvatar} onFinish={() => setScreen('intro')} />;

  return <main className={`ar-page ${isIntro ? 'ar-page--intro' : 'ar-page--flow'} ${isScanning ? 'ar-page--scanning' : ''} ${language === 'en' ? 'ar-page--en' : ''}`}>
    <img className="ar-page__background" src="/assets/ar-background.png" alt="MCM 매장 이미지" />
    <div className="ar-page__shade" aria-hidden="true" />
    {isIntro ? <>
      <img className="ar-page__mask" src="/assets/ar-mask.svg" alt="" aria-hidden="true" />
      <h1 className="ar-page__title">AR FITTING</h1>
      <section className="ar-page__content" aria-labelledby="ar-intro">
        <span className="ar-page__logo" aria-label="MCM"><img src="/assets/ar-mcm-logo.png" alt="" /></span>
        <p id="ar-intro">{t.intro}</p>
        <button className="ar-page__start" type="button" onClick={() => setScreen('member-check')}>START</button>
      </section>
      <div className="ar-page__language" role="group" aria-label="언어 선택"><button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button><button type="button" className={language === 'ko' ? 'active' : ''} onClick={() => setLanguage('ko')}>한국어</button></div>
    </> : screen === 'member-check' ? <section className="ar-page__choice" aria-labelledby="member-question">
      <img className="ar-page__mask" src="/assets/ar-mask.svg" alt="" aria-hidden="true" /><h1 className="ar-page__title">AR FITTING</h1><span className="ar-page__divider" aria-hidden="true" />
      <p id="member-question" className="ar-page__question">{t.memberQuestion}</p><div className="ar-page__choices"><button type="button" onClick={() => setScreen('member-login')}>{t.yes}</button><button type="button" onClick={() => setScreen('guest-gender')}>{t.no}</button></div>
    </section> : <section className="ar-page__flow-content" aria-labelledby={isMemberLoading ? 'loading-message' : isConsent ? 'consent-message' : isConsentForm ? 'consent-form-title' : isScan ? 'scan-title' : isScanning ? 'scanning-title' : 'flow-question'}>
      <nav className="ar-page__progress" aria-label="AR fitting progress">{steps.map((label, index) => <span className={index === 0 || (isConsentForm && index === 1) || ((isScan || isScanning) && index <= 2) ? 'active' : ''} key={label}>{index === 0 ? (isMemberLogin || isMemberLoading || isConsent || isConsentForm || isScan || isScanning ? 'LOGIN' : 'GENDER') : label}</span>)}</nav>
      <div className={`ar-page__progress-track ${isConsentForm ? 'ar-page__progress-track--consent' : ''} ${isScan ? 'ar-page__progress-track--scan' : ''} ${isScanning ? 'ar-page__progress-track--scanning' : ''}`} aria-hidden="true"><span /></div>
      {isMemberLoading ? <><span className="ar-page__divider ar-page__divider--loading" aria-hidden="true" /><p id="loading-message" className="ar-page__loading-message">{t.loadingJourney}</p><img className="ar-page__loading-spinner" src="/assets/ar-loading.png" alt="" /></> : isConsent ? <><img className="ar-page__continue-icon" src="/assets/ar-continue-icon.svg" alt="" aria-hidden="true" /><p id="consent-message" className="ar-page__continue-title">{t.continueTitle}</p><p className="ar-page__continue-copy">{t.continueCopy1}<br />{t.continueCopy2}</p><button className="ar-page__continue-button" type="button" onClick={() => setScreen('consent-form')}>{t.continue}</button></> : isConsentForm ? <><span className="ar-page__divider ar-page__divider--consent" aria-hidden="true" /><p id="consent-form-title" className="ar-page__consent-title">{t.consentTitle}</p><div className="ar-page__consent-box"><img className="ar-page__consent-icon" src="/assets/ar-camera-icon.svg" alt="" aria-hidden="true" /><p className="ar-page__consent-description">{t.consentDescription1}<br />{t.consentDescription2}</p><p className="ar-page__consent-question">{t.consentQuestion}</p><button className="ar-page__consent-button" type="button" onClick={() => setScreen('scan')}>{t.consentButton}</button></div></> : isScan ? <><span className="ar-page__divider ar-page__divider--scan" aria-hidden="true" /><p id="scan-title" className="ar-page__scan-title">{t.scanTitle}</p><img className="ar-page__scan-guide" src="/assets/ar-scan-guide.png" alt="" /><div className="ar-page__scan-description"><p>{t.scanLine1}</p><p>{t.scanLine2}</p></div></> : isScanning ? <><span className="ar-page__divider ar-page__divider--scanning" aria-hidden="true" /><p id="scanning-title" className="ar-page__scanning-title">{t.scanning}</p><img className="ar-page__scanning-wave" src="/assets/ar-scanning-wave.png" alt="" aria-hidden="true" /></> : <><span className="ar-page__divider" aria-hidden="true" /><p id="flow-question" className="ar-page__question">{isMemberLogin ? t.memberLogin : t.gender}</p>{isMemberLogin ? <><img className="ar-page__qr" src="/assets/ar-login-qr.png" alt="MCM member login QR code" /><p className="ar-page__qr-copy">{t.qrLine1}<br />{t.qrLine2}</p><button className="ar-page__login-test" type="button" onClick={() => setScreen('member-loading')}>{t.loginDone}</button></> : <div className="ar-page__choices"><button type="button" onClick={() => setScreen('consent-form')}>{t.female}</button><button type="button" onClick={() => setScreen('consent-form')}>{t.male}</button></div>}</>}
    </section>}
  </main>;
}
