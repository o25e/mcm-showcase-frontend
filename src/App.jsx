import ProductDetail from './components/ProductDetail';

const navigation = ['신상품', '가방', '여성', '남성', '트래블', '라이프스타일', 'MCM ICONS', '선물 제안', 'MCM 소개', 'CLOSET'];

const utilities = [
  ['검색', '/assets/figma-search.svg'],
  ['마이 페이지', '/assets/figma-user.svg'],
  ['위시리스트', '/assets/figma-heart.svg'],
  ['쇼핑백', '/assets/figma-bag.svg'],
];

const products = Array.from({ length: 4 }, (_, index) => ({
  id: index,
  name: 'Ottomar 비세토스 위켄더',
  price: '₩2,050,000',
}));

export default function App() {
  if (window.location.pathname === '/product') return <ProductDetail />;

  return (
    <div className="figma-home" id="top">
      <div className="figma-announcement">
        <img className="announcement-mark" src="/assets/figma-announcement.svg" alt="" />
        <span>MCM 아이콘 |</span>
        <a href="#collection">Aren 이스트 웨스트 숄더백을 만나보세요</a>
        <div className="announcement-links"><a href="#collection">배송조회</a><a href="#collection">1:1 고객 문의</a><a href="#collection">KR()/KO</a><a href="#collection">매장</a></div>
      </div>

      <header className="figma-nav">
        <nav aria-label="주 메뉴">
          {navigation.map((item) => <a href="#collection" key={item}>{item}</a>)}
        </nav>
        <a className="figma-logo" href="#top" aria-label="MCM 홈"><img src="/assets/figma-logo.png" alt="MCM" /></a>
        <div className="figma-tools">
          {utilities.map(([label, src]) => <button type="button" aria-label={label} key={label}><img src={src} alt="" /></button>)}
        </div>
      </header>

      <main>
        <section className="figma-hero" aria-label="MCM 신규 컬렉션">
          <img className="hero-image" src="/assets/figma-hero.png" alt="MCM 신규 컬렉션" />
          <div className="hero-detail"><img src="/assets/figma-hero-detail.png" alt="컬렉션 상세 이미지" /></div>
          <a className="collection-link" href="#collection"><strong>→</strong> 컬렉션 쇼핑하기</a>
        </section>

        <section className="figma-collection" id="collection" aria-labelledby="collection-title">
          <h1 id="collection-title">신규 컬렉션</h1>
          <div className="figma-product-grid">
            {products.map((product) => <article className="figma-product" key={product.id}>
              <div className="figma-product-image"><img src="/assets/figma-product.png" alt={product.name} /><button type="button" aria-label={`${product.name} 찜하기`}><img src="/assets/figma-heart-small.svg" alt="" /></button></div>
              <h2>{product.name}</h2><p>{product.price}</p>
            </article>)}
          </div>
        </section>
      </main>
    </div>
  );
}
