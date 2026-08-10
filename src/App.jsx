import { useState } from 'react';
import ProductDetail from './components/ProductDetail';

const categories = ['신상품', '가방', '지갑', '슈즈', '벨트', '악세서리', '카테고리상품', 'MCM-LXXVI', '신용 제안', 'MCM 소개', 'CLOSET'];

const arrivals = [
  { image: '/assets/mcm-aren.png', eyebrow: '모던 클래식의 재해석', title: 'AREN 컬렉션', href: '/product' },
  { image: '/assets/mcm-new-arrivals.png', eyebrow: '2024 FW 신상품', title: '뉴 아리베' },
  { image: '/assets/product-black.png', eyebrow: '1976 헤리티지 에디션', title: 'MCM LXXVI' },
];

const navIcons = [
  ['검색', '/assets/icon-search.svg'],
  ['마이 페이지', '/assets/icon-user.svg'],
  ['위시리스트', '/assets/icon-heart-outline.svg'],
  ['쇼핑백', '/assets/icon-bag.svg'],
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState('CLOSET');
  const [notice, setNotice] = useState('무료 배송 · 무료 반품 서비스 안내');
  const [menuOpen, setMenuOpen] = useState(false);
  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice('무료 배송 · 무료 반품 서비스 안내'), 2200);
  };

  if (window.location.pathname === '/product') return <ProductDetail />;

  return (
    <div className="storefront" id="top">
      <div className="announcement-bar">
        <button type="button" aria-label="이전 공지" onClick={() => showNotice('신규 가입 시 첫 구매 혜택을 확인하세요.')}>←</button>
        <p>{notice}</p>
        <button type="button" aria-label="다음 공지" onClick={() => showNotice('MCM 공식 온라인 스토어에 오신 것을 환영합니다.')}>→</button>
      </div>

      <header className="main-nav">
        <div className="nav-left">
          <button className="asset-button menu-button" type="button" aria-label="메뉴 열기" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            <img src="/assets/icon-menu.svg" alt="" />
          </button>
          <a className="mcm-logo" href="#top" aria-label="MCM 홈">MCM</a>
        </div>
        <div className="nav-tools">
          {navIcons.map(([label, asset]) => <button className="asset-button" type="button" key={label} aria-label={label} onClick={() => showNotice(`${label} 기능을 준비 중입니다.`)}><img src={asset} alt="" /></button>)}
          <button className="locale" type="button" onClick={() => showNotice('대한민국 / 한국어가 선택되어 있습니다.')}>KRW / KO</button>
        </div>
        {menuOpen && <nav className="menu-popover" aria-label="전체 메뉴">{categories.slice(0, 8).map((item) => <a href="#new-arrivals" key={item} onClick={() => setMenuOpen(false)}>{item}</a>)}</nav>}
      </header>

      <nav className="category-nav" aria-label="상품 카테고리">
        <div className="category-list">{categories.map((category) => <button type="button" className={activeCategory === category ? 'active' : ''} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
      </nav>

      <main>
        <section className="hero" aria-label="MCM LXXVI 컬렉션">
          <div className="hero-title"><strong>MCM</strong><em>LXXVI</em><span>1976</span></div>
          <div className="hero-copy"><p>다리미 달달매의 바이론</p><a href="#new-arrivals">AREN 둘러보기 <img src="/assets/icon-arrow.svg" alt="" /></a></div>
          <button className="chat-button" type="button" aria-label="고객 상담 열기" onClick={() => showNotice('무엇을 도와드릴까요?')}><img src="/assets/icon-chat.svg" alt="" /></button>
        </section>

        <section className="featured" id="new-arrivals" aria-labelledby="arrivals-title">
          <div className="section-heading"><h1 id="arrivals-title">신상품</h1><a href="#top">전체 보기</a></div>
          <div className="arrival-grid">
            {arrivals.map((item) => <a href={item.href || '#top'} className="arrival-card" key={item.title}>
              <div className="arrival-image"><img src={item.image} alt={item.title} /></div>
              <p>{item.eyebrow}</p><h2>{item.title}</h2>
            </a>)}
          </div>
        </section>
      </main>
    </div>
  );
}
