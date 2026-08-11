import { useEffect, useState } from 'react';

const navItems = ['신상품', '가방', '여성', '남성', '트래블', '라이프스타일', 'MCM ICONS', '선물 제안', 'MCM 소개', 'CLOSET'];

const records = [
  { image: '/assets/closet-card-1.png', date: '2026.01.12', title: '스타일 분석 명사구' },
  { image: '/assets/closet-card-1.png', date: '2026.01.12', title: '스타일 분석 명사구' },
  { image: '/assets/closet-card-4.png', date: '2026.01.12', title: '스타일 분석 명사구' },
  { image: '/assets/closet-card-1.png', date: '2026.01.12', title: '스타일 분석 명사구' },
  { image: '/assets/closet-card-4.png', date: '2026.01.12', title: '스타일 분석 명사구' },
  { image: '/assets/closet-card-1.png', date: '2026.01.12', title: '스타일 분석 명사구' },
];

export default function ClosetPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  useEffect(() => {
    if (!isLoginOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsLoginOpen(false);
    };
    document.body.classList.add('modal-open');
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isLoginOpen]);

  return <div className="closet-page" id="top">
    <div className="figma-announcement closet-announcement">
      <img className="announcement-mark" src="/assets/figma-announcement.svg" alt="" />
      <span>MCM 아이콘 |</span><a href="#closet-records">Aren 이스트 웨스트 숄더백을 만나보세요</a>
      <div className="announcement-links"><a href="#closet-records">배송조회</a><a href="#closet-records">1:1 고객 문의</a><a href="#closet-records">KR(₩)/KO</a><a href="#closet-records">매장</a></div>
    </div>
    <header className="figma-nav closet-nav">
      <nav aria-label="주 메뉴">{navItems.map((item) => <a href={item === 'CLOSET' ? '#closet' : '#top'} className={item === 'CLOSET' ? 'active' : ''} key={item}>{item}</a>)}</nav>
      <a className="figma-logo" href="#top" aria-label="MCM 홈"><img src="/assets/figma-logo.png" alt="MCM" /></a>
      <div className="figma-tools">
        {[['검색', 'figma-search.svg'], ['마이 페이지', 'figma-user.svg'], ['위시리스트', 'figma-heart.svg'], ['쇼핑백', 'figma-bag.svg']].map(([label, icon]) => <button type="button" aria-label={label} key={label}><img src={`/assets/${icon}`} alt="" /></button>)}
      </div>
    </header>
    <main>
      <section className="closet-hero" aria-labelledby="closet-title">
        <img className="closet-hero-image" src="/assets/closet-hero.png" alt="MCM Closet 아바타" />
        <img className="closet-hero-overlay" src="/assets/closet-hero-overlay.png" alt="" />
        <div className="closet-hero-copy"><h1 id="closet-title">CLOSET</h1><p>내 스타일에 맞는 MCM 아바타를 저장해보세요</p></div>
        <button className="closet-arrow closet-arrow-left" type="button" aria-label="이전 아바타">‹</button>
        <button className="closet-arrow closet-arrow-right" type="button" aria-label="다음 아바타">›</button>
      </section>
      <section className="closet-login" aria-label="로그인 안내"><p>오늘의 스타일을 이어가세요.<br />로그인하면 이 Avatar를 저장하고 다음 쇼핑에서도 나만의 MCM Closet을 이어갈 수 있어요.</p><button type="button" onClick={() => setIsLoginOpen(true)}>로그인 하기</button></section>
      <section className="closet-records" id="closet-records" aria-label="스타일 기록"><div className="closet-record-grid">{records.map((record, index) => <article className="closet-record" key={index}><div className="closet-record-image"><img src={record.image} alt="스타일 기록" /><button type="button" className='closet-record-wish' aria-label="스타일 기록 저장"><img src="/assets/figma-heart-small.svg" alt=""></img></button></div><div className="closet-record-copy"><p>{record.date}</p><h2>{record.title}</h2><span><img src="/assets/icon-place.svg"></img> 이태원 플래그십</span></div></article>)}</div></section>
    </main>
    {isLoginOpen && <div className="login-modal" role="presentation">
      <button className="login-modal-backdrop" type="button" aria-label="로그인 창 닫기" onClick={() => setIsLoginOpen(false)} />
      <aside className="login-drawer" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="login-close" type="button" aria-label="로그인 창 닫기" onClick={() => setIsLoginOpen(false)}>×</button>
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
    </div>}
  </div>;
}
