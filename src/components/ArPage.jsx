import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { API_BASE_URL } from '../api/config';
import FittingHelpOverlay from './FittingHelpOverlay';
import FittingPage from './FittingPage';
import AvatarCompletePage from './AvatarCompletePage';
import { getArCopy } from './arCopy';

const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];

function normalizeGender(value) {
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toUpperCase();
  if (['MALE', 'M', '남성', '남자'].includes(normalized)) return 'MALE';
  if (['FEMALE', 'F', '여성', '여자'].includes(normalized)) return 'FEMALE';
  return null;
}

export default function ArPage() {
  const [language, setLanguage] = useState('ko');
  const [screen, setScreen] = useState('intro');
  const [arSessionId, setArSessionId] = useState(null);
  const [gender, setGender] = useState(null);
  const [completedAvatar, setCompletedAvatar] = useState('/assets/avatar-complete/avatar_f.png');
  const [completedAvatarLook, setCompletedAvatarLook] = useState(null);
  const [completedMemberId, setCompletedMemberId] = useState(null);
  const t = getArCopy(language);
  const memberLoginBaseUrl = import.meta.env.VITE_MEMBER_LOGIN_URL || import.meta.env.VITE_PUBLIC_APP_URL || window.location.origin;
  const memberLoginUrl = Number.isFinite(arSessionId)
    ? `${memberLoginBaseUrl}${memberLoginBaseUrl.includes('?') ? '&' : '?'}arLogin=1&arSessionId=${arSessionId}`
    : memberLoginBaseUrl;

  const isIntro = screen === 'intro';
  const isMemberLogin = screen === 'member-login';
  const isMemberLoading = screen === 'member-loading';
  const isConsent = screen === 'consent';
  const isConsentForm = screen === 'consent-form';
  const isScan = screen === 'scan';
  const isScanning = screen === 'scanning';

  async function handleStart() {
    try {
      let authenticatedMember = null;
      try {
        authenticatedMember = JSON.parse(sessionStorage.getItem('mcm.member'));
      } catch {
        authenticatedMember = null;
      }

      const response = await fetch(`${API_BASE_URL}/api/ar-sessions`, {
        method: 'POST',
        headers: { Accept: '*/*', 'Content-Type': 'application/json' },
        body: JSON.stringify(authenticatedMember?.memberId ? { memberId: authenticatedMember.memberId } : {}),
      });

      if (!response.ok) throw new Error(`AR session creation failed (${response.status})`);

      const data = await response.json();
      setArSessionId(data.arSessionId);
      if (authenticatedMember?.memberId !== undefined && authenticatedMember?.memberId !== null) {
        setCompletedMemberId(authenticatedMember.memberId);
        const storedGender = normalizeGender(authenticatedMember.gender);
        if (storedGender) setGender(storedGender);
      }
      setScreen('member-check');
    } catch (error) {
      console.error('AR 세션 생성 오류:', error);
    }
  }

  async function handleGenderSelect(nextGender) {
    if (!Number.isFinite(arSessionId)) {
      console.error('AR Session ID가 없습니다.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/ar-sessions/${arSessionId}/gender`, {
        method: 'PATCH',
        headers: { Accept: '*/*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender: nextGender }),
      });

      if (!response.ok) throw new Error(`Gender update failed (${response.status})`);

      setGender(nextGender);
      setScreen('consent-form');
    } catch (error) {
      console.error('성별 저장 오류:', error);
    }
  }

  useEffect(() => {
    if (screen !== 'member-loading') return undefined;

    const timer = window.setTimeout(() => setScreen('consent'), 7500);
    return () => window.clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'member-login' || !Number.isFinite(arSessionId)) return undefined;

    let isActive = true;
    let isRequesting = false;

    const checkMemberLogin = async () => {
      if (!isActive || isRequesting) return;
      isRequesting = true;

      try {
        const response = await fetch(`${API_BASE_URL}/api/ar-sessions/${arSessionId}`, {
          headers: { Accept: '*/*' },
        });

        if (!response.ok) throw new Error(`AR session lookup failed (${response.status})`);

        const data = await response.json();
        if (data.memberId !== null && data.memberId !== undefined) {
          let linkedMember = null;
          try {
            linkedMember = JSON.parse(localStorage.getItem(`mcm.ar-member.${arSessionId}`));
          } catch {
            linkedMember = null;
          }

          let storedMember = null;
          try {
            storedMember = JSON.parse(sessionStorage.getItem('mcm.member'));
          } catch {
            storedMember = null;
          }

          const memberGender = normalizeGender(
            data.gender
              ?? data.memberGender
              ?? data.member?.gender
              ?? linkedMember?.gender
              ?? storedMember?.gender,
          );
          const authenticatedMember = {
            ...(storedMember || {}),
            memberId: data.memberId,
            name: data.name || storedMember?.name || '',
            ...(memberGender ? { gender: memberGender } : {}),
          };
          sessionStorage.setItem('mcm.member', JSON.stringify(authenticatedMember));
          setCompletedMemberId(data.memberId);
          if (memberGender && isActive) setGender(memberGender);
          if (isActive) setScreen('member-loading');
        }
      } catch (error) {
        console.error('AR 회원 로그인 상태 확인 오류:', error);
      } finally {
        isRequesting = false;
      }
    };

    checkMemberLogin();
    const intervalId = window.setInterval(checkMemberLogin, 1000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [arSessionId, screen]);

  useEffect(() => {
    if (screen !== 'scan') return undefined;

    const timer = window.setTimeout(() => setScreen('scanning'), 3000);
    return () => window.clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    if (screen !== 'scanning') return undefined;

    const timer = window.setTimeout(() => setScreen('fitting-help'), 3000);
    return () => window.clearTimeout(timer);
  }, [screen]);

  if (screen === 'fitting-help') {
    return <FittingHelpOverlay language={language} onClose={() => setScreen('fitting')} />;
  }

  if (screen === 'fitting') {
    return (
      <FittingPage
        language={language}
        arSessionId={arSessionId}
        gender={gender}
        onFinish={(avatarLook) => {
          setCompletedAvatar(avatarLook.avatarImageUrl);
          setCompletedAvatarLook(avatarLook);
          setScreen('avatar-complete');
        }}
      />
    );
  }

  if (screen === 'avatar-complete') {
    return (
      <AvatarCompletePage
        language={language}
        avatarImage={completedAvatar}
        avatarLook={completedAvatarLook}
        memberId={completedMemberId}
        onFinish={() => setScreen('intro')}
      />
    );
  }

  return (
    <main className={`ar-page ${isIntro ? 'ar-page--intro' : 'ar-page--flow'} ${isScanning ? 'ar-page--scanning' : ''} ${language === 'en' ? 'ar-page--en' : ''}`}>
      <img className="ar-page__background" src="/assets/ar-background.png" alt="MCM 매장 내부" />
      <div className="ar-page__shade" aria-hidden="true" />

      {isIntro ? (
        <>
          <img className="ar-page__mask" src="/assets/ar-mask.svg" alt="" aria-hidden="true" />
          <h1 className="ar-page__title">AR FITTING</h1>

          <section className="ar-page__content" aria-labelledby="ar-intro">
            <span className="ar-page__logo" aria-label="MCM">
              <img src="/assets/ar-mcm-logo.png" alt="" />
            </span>
            <p id="ar-intro">{t.intro}</p>
            <button className="ar-page__start" type="button" onClick={handleStart}>START</button>
          </section>

          <div className="ar-page__language" role="group" aria-label="언어 선택">
            <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button>
            <button type="button" className={language === 'ko' ? 'active' : ''} onClick={() => setLanguage('ko')}>한국어</button>
          </div>
        </>
      ) : screen === 'member-check' ? (
        <section className="ar-page__choice" aria-labelledby="member-question">
          <img className="ar-page__mask" src="/assets/ar-mask.svg" alt="" aria-hidden="true" />
          <h1 className="ar-page__title">AR FITTING</h1>
          <span className="ar-page__divider" aria-hidden="true" />

          <p id="member-question" className="ar-page__question">{t.memberQuestion}</p>

          <div className="ar-page__choices">
            <button type="button" onClick={() => setScreen('member-login')}>{t.yes}</button>
            <button type="button" onClick={() => setScreen('guest-gender')}>{t.no}</button>
          </div>
        </section>
      ) : (
        <section
          className="ar-page__flow-content"
          aria-labelledby={
            isMemberLoading ? 'loading-message'
              : isConsent ? 'consent-message'
              : isConsentForm ? 'consent-form-title'
              : isScan ? 'scan-title'
              : isScanning ? 'scanning-title'
              : 'flow-question'
          }
        >
          <nav className="ar-page__progress" aria-label="AR fitting progress">
            {steps.map((label, index) => (
              <span
                className={index === 0 || (isConsentForm && index === 1) || ((isScan || isScanning) && index <= 2) ? 'active' : ''}
                key={label}
              >
                {index === 0
                  ? (isMemberLogin || isMemberLoading || isConsent || isConsentForm || isScan || isScanning ? 'LOGIN' : 'GENDER')
                  : label}
              </span>
            ))}
          </nav>

          <div
            className={`ar-page__progress-track ${isConsentForm ? 'ar-page__progress-track--consent' : ''} ${isScan ? 'ar-page__progress-track--scan' : ''} ${isScanning ? 'ar-page__progress-track--scanning' : ''}`}
            aria-hidden="true"
          >
            <span />
          </div>

          {isMemberLoading ? (
            <>
              <span className="ar-page__divider ar-page__divider--loading" aria-hidden="true" />
              <p id="loading-message" className="ar-page__loading-message">{t.loadingJourney}</p>
              <img className="ar-page__loading-spinner" src="/assets/ar-loading.png" alt="" />
            </>
          ) : isConsent ? (
            <>
              <img className="ar-page__continue-icon" src="/assets/ar-continue-icon.svg" alt="" aria-hidden="true" />
              <p id="consent-message" className="ar-page__continue-title">{t.continueTitle}</p>
              <p className="ar-page__continue-copy">{t.continueCopy1}<br />{t.continueCopy2}</p>
              <button className="ar-page__continue-button" type="button" onClick={() => setScreen('consent-form')}>{t.continue}</button>
            </>
          ) : isConsentForm ? (
            <>
              <span className="ar-page__divider ar-page__divider--consent" aria-hidden="true" />
              <p id="consent-form-title" className="ar-page__consent-title">{t.consentTitle}</p>

              <div className="ar-page__consent-box">
                <img className="ar-page__consent-icon" src="/assets/ar-camera-icon.svg" alt="" aria-hidden="true" />
                <p className="ar-page__consent-description">{t.consentDescription1}<br />{t.consentDescription2}</p>
                <p className="ar-page__consent-question">{t.consentQuestion}</p>
                <button className="ar-page__consent-button" type="button" onClick={() => setScreen('scan')}>{t.consentButton}</button>
              </div>
            </>
          ) : isScan ? (
            <>
              <span className="ar-page__divider ar-page__divider--scan" aria-hidden="true" />
              <p id="scan-title" className="ar-page__scan-title">{t.scanTitle}</p>
              <img className="ar-page__scan-guide" src="/assets/ar-scan-guide.png" alt="" />

              <div className="ar-page__scan-description">
                <p>{t.scanLine1}</p>
                <p>{t.scanLine2}</p>
              </div>
            </>
          ) : isScanning ? (
            <>
              <span className="ar-page__divider ar-page__divider--scanning" aria-hidden="true" />
              <p id="scanning-title" className="ar-page__scanning-title">{t.scanning}</p>
              <img className="ar-page__scanning-wave" src="/assets/ar-scanning-wave.png" alt="" aria-hidden="true" />
            </>
          ) : (
            <>
              <span className="ar-page__divider" aria-hidden="true" />
              <p id="flow-question" className="ar-page__question">{isMemberLogin ? t.memberLogin : t.gender}</p>

              {isMemberLogin ? (
                <>
                  <QRCodeSVG className="ar-page__qr" value={memberLoginUrl} size={159} level="H" aria-label="MCM member login QR code" />
                  <p className="ar-page__qr-copy">{t.qrLine1}<br />{t.qrLine2}</p>
                </>
              ) : (
                <div className="ar-page__choices">
                  <button type="button" onClick={() => handleGenderSelect('FEMALE')}>{t.female}</button>
                  <button type="button" onClick={() => handleGenderSelect('MALE')}>{t.male}</button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
