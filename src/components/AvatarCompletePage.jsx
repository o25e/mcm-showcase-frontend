import { useEffect, useState } from 'react';

const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];

export default function AvatarCompletePage({ avatarImage = '/assets/avatar-complete/avatar_f.png', onFinish }) {
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  useEffect(() => {
    if (!isFinishModalOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsFinishModalOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinishModalOpen]);

  return (
    <main className="avatar-complete-page" aria-labelledby="avatar-complete-title">
      <img className="avatar-complete-page__background" src="/assets/ar-background.png" alt="" aria-hidden="true" />
      <div className="avatar-complete-page__shade" aria-hidden="true" />

      <nav className="avatar-complete-page__steps" aria-label="AR fitting progress">
        {steps.map((step) => <span className="active" key={step}>{step}</span>)}
      </nav>
      <div className="avatar-complete-page__track" aria-hidden="true"><span /></div>

      <section className="avatar-complete-page__content">
        <h1 id="avatar-complete-title">오늘의 스타일이 완성됐어요.</h1>
        <img
          className="avatar-complete-page__avatar-background"
          src="/assets/avatar-complete/avatar-background.svg"
          alt=""
          aria-hidden="true"
        />
        <img className="avatar-complete-page__avatar" src={avatarImage} alt="오늘의 아바타" />
      </section>

      <aside className="avatar-complete-page__preview" aria-label="생성된 아바타 미리보기">
        <img className="avatar-complete-page__preview-frame" src="/assets/avatar-complete/preview-frame.png" alt="" aria-hidden="true" />
        <div className="avatar-complete-page__preview-inner">
          <div className="avatar-complete-page__preview-avatar">
            <img src="/assets/avatar-complete/preview-avatar.png" alt="" />
          </div>
          <img className="avatar-complete-page__preview-product" src="/assets/avatar-complete/preview-product.png" alt="MCM" />
        </div>
        <button type="button" onClick={() => setIsFinishModalOpen(true)}>AR 피팅 마치기</button>
      </aside>

      <section className="avatar-complete-page__qr-card" aria-label="피팅 결과 저장 안내">
        <img className="avatar-complete-page__qr-mark" src="/assets/avatar-complete/qr-mark.png" alt="" aria-hidden="true" />
        <p>오늘의 피팅 결과를 저장하고, 다음 쇼핑에서도 이어서 만나보세요.</p>
        <p>QR을 스캔하면 온라인과 다음 MCM 방문에서<br />오늘의 스타일을 다시 확인할 수 있어요.</p>
      </section>

      {isFinishModalOpen && (
        <section className="avatar-complete-finish-modal" role="dialog" aria-modal="true" aria-labelledby="finish-modal-title">
          <button
            className="avatar-complete-finish-modal__backdrop"
            type="button"
            aria-label="종료 안내 닫기"
            onClick={() => setIsFinishModalOpen(false)}
          />
          <div className="avatar-complete-finish-modal__card">
            <img className="avatar-complete-finish-modal__logo" src="/assets/MCM-logo.png" alt="MCM" />
            <span className="avatar-complete-finish-modal__rule" aria-hidden="true" />
            <p id="finish-modal-title">시착을 원하신 상품은 직원이 준비하고 있습니다.</p>
            <p className="avatar-complete-finish-modal__message">
              <span>기다리는 동안 3F 전광판에서</span>
              <strong>MCM의 새로운 쇼케이스를 만나보세요.</strong>
            </p>
            <button className="avatar-complete-finish-modal__confirm" type="button" onClick={onFinish}>
              확인 및 종료하기
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
