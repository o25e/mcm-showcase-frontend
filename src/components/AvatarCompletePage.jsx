import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../api/config';
import { getArCopy } from './arCopy';

const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];

export default function AvatarCompletePage({ avatarImage = '/assets/avatar-complete/avatar_f.png', arSessionId, onFinish, language = 'ko' }) {
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [avatarLook, setAvatarLook] = useState(null);
  const hasCreatedAvatarLook = useRef(false);
  const t = getArCopy(language);

  useEffect(() => {
    if (!Number.isFinite(arSessionId) || hasCreatedAvatarLook.current) return;
    hasCreatedAvatarLook.current = true;

    async function createAvatarLook() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/recommendations/avatar-look/${arSessionId}`, { method: 'POST', headers: { Accept: '*/*' } });
        if (!response.ok) throw new Error(`Avatar look request failed (${response.status})`);
        setAvatarLook(await response.json());
      } catch (error) {
        console.error('아바타 룩 생성 오류:', error);
      }
    }

    createAvatarLook();
  }, [arSessionId]);

  useEffect(() => {
    if (!isFinishModalOpen) return undefined;
    const handleKeyDown = (event) => { if (event.key === 'Escape') setIsFinishModalOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinishModalOpen]);

  return <main className={`avatar-complete-page ${language === 'en' ? 'avatar-complete-page--en' : ''}`} aria-labelledby="avatar-complete-title">
    <img className="avatar-complete-page__background" src="/assets/ar-background.png" alt="" aria-hidden="true" /><div className="avatar-complete-page__shade" aria-hidden="true" />
    <nav className="avatar-complete-page__steps" aria-label="AR fitting progress">{steps.map((step) => <span className="active" key={step}>{step}</span>)}</nav><div className="avatar-complete-page__track" aria-hidden="true"><span /></div>
    <section className="avatar-complete-page__content"><h1 id="avatar-complete-title">{avatarLook?.styleIdentityTitle || t.completeTitle}</h1><img className="avatar-complete-page__avatar-background" src="/assets/avatar-complete/avatar-background.svg" alt="" aria-hidden="true" /><img className="avatar-complete-page__avatar" src={avatarImage} alt="Today's avatar" /></section>
    <aside className="avatar-complete-page__preview" aria-label="Generated avatar preview"><img className="avatar-complete-page__preview-frame" src="/assets/avatar-complete/preview-frame.png" alt="" aria-hidden="true" /><div className="avatar-complete-page__preview-inner"><div className="avatar-complete-page__preview-avatar"><img src="/assets/avatar-complete/preview-avatar.png" alt="" /></div><img className="avatar-complete-page__preview-product" src="/assets/avatar-complete/preview-product.png" alt="MCM" /></div><button type="button" onClick={() => setIsFinishModalOpen(true)}>{t.finishAr}</button></aside>
    <section className="avatar-complete-page__qr-card" aria-label="Fitting result information"><img className="avatar-complete-page__qr-mark" src="/assets/avatar-complete/qr-mark.png" alt="" aria-hidden="true" /><p>{t.qr1}</p>{language === 'en' ? <p><span className="qr-line">Scan the QR code to revisit today's style online</span><span className="qr-line">or on your next visit to MCM.</span></p> : <p><span className="qr-line">QR을 스캔하면 온라인과 다음 MCM 방문에서</span><span className="qr-line">오늘의 스타일을 다시 확인할 수 있어요.</span></p>}</section>
    {isFinishModalOpen && <section className="avatar-complete-finish-modal" role="dialog" aria-modal="true" aria-labelledby="finish-modal-title"><button className="avatar-complete-finish-modal__backdrop" type="button" aria-label="Close finish information" onClick={() => setIsFinishModalOpen(false)} /><div className="avatar-complete-finish-modal__card"><img className="avatar-complete-finish-modal__logo" src="/assets/MCM-logo.png" alt="MCM" /><span className="avatar-complete-finish-modal__rule" aria-hidden="true" /><p id="finish-modal-title">{t.tryout}</p><p className="avatar-complete-finish-modal__message">{language === 'en' ? <span>{t.showcase}</span> : <><span className="finish-line">기다리는 동안 3F 전광판에서</span><strong className="finish-line finish-line--bold">MCM의 새로운 쇼케이스를 만나보세요.</strong></>}</p><button className="avatar-complete-finish-modal__confirm" type="button" onClick={onFinish}>{t.confirmFinish}</button></div></section>}
  </main>;
}
