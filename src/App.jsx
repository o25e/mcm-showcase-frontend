const navigation = ['신상품', '가방', '여성', '남성', '트래블', '라이프스타일', 'MCM ICONS', '선물 제안', 'MCM 소개', 'CLOSET'];

const utilities = [
  ['검색', '/assets/figma-search.svg'],
  ['마이 페이지', '/assets/figma-user.svg'],
  ['위시리스트', '/assets/figma-heart.svg'],
  ['쇼핑백', '/assets/figma-bag.svg'],
];

const products = [
  {
    id: 1,
    image: 'https://images.mcmworldwide.com/i/mcmworldwide/MWHGAXT03CO001_01/MWHGAXT03CO001/Tracy%20%EB%B9%84%EC%84%B8%ED%86%A0%EC%8A%A4%20%ED%98%B8%EB%B3%B4?%24large%24=&fmt=auto&qlt=default',
    name: 'Tracy 비세토스 호보', price: '₩1,690,000',
    detailUrl: 'https://kr.mcmworldwide.com/ko_KR/%EA%B0%80%EB%B0%A9/%EB%AA%A8%EB%91%90%EB%B3%B4%EA%B8%B0/tracy-%EB%B9%84%EC%84%B8%ED%86%A0%EC%8A%A4-%ED%98%B8%EB%B3%B4/MWHGAXT03CO001.html?cgid=bags-all-bags',
  },
  {
    id: 2,
    image: 'https://images.mcmworldwide.com/i/mcmworldwide/MWSGAXT03CO001_01/MWSGAXT03CO001/Tracy%20%EB%B9%84%EC%84%B8%ED%86%A0%EC%8A%A4%20%EC%88%84%EB%8D%94%EB%B0%B1?%24large%24=&fmt=auto&qlt=default',
    name: 'Tracy 비세토스 숄더백', price: '₩1,450,000',
    detailUrl: 'https://kr.mcmworldwide.com/ko_KR/%EA%B0%80%EB%B0%A9/%EB%AA%A8%EB%91%90%EB%B3%B4%EA%B8%B0/tracy-%EB%B9%84%EC%84%B8%ED%86%A0%EC%8A%A4-%EC%88%84%EB%8D%94%EB%B0%B1/MWSGAXT03CO001.html?cgid=bags-all-bags',
  },
  {
    id: 3,
    image: 'https://images.mcmworldwide.com/i/mcmworldwide/MWDGADU01CO001_01/MWDGADU01CO001/Dessau%20%EB%B9%84%EC%84%B8%ED%86%A0%EC%8A%A4%20%EB%93%9C%EB%A1%9C%EC%9A%B0%EC%8A%A4%ED%8A%B8%EB%A7%81%20%EB%B0%B1?%24large%24=&fmt=auto&qlt=default',
    name: '미니 Dessau 비세토스 드로우스트링 백', price: '₩1,250,000',
    detailUrl: 'https://kr.mcmworldwide.com/ko_KR/%EA%B0%80%EB%B0%A9/%EB%AA%A8%EB%91%90%EB%B3%B4%EA%B8%B0/dessau-%EB%B9%84%EC%84%B8%ED%86%A0%EC%8A%A4-%EB%93%9C%EB%A1%9C%EC%9A%B0%EC%8A%A4%ED%8A%B8%EB%A7%81-%EB%B0%B1/MWDGADU01CO001.html?cgid=bags-all-bags',
  },
  {
    id: 4,
    image: 'https://images.mcmworldwide.com/i/mcmworldwide/MWSGAAK02MT001_01/MWSGAAK02MT001/Diamant%203D%20%EB%8B%A4%EC%9D%B4%EC%95%84%EB%AA%AC%EB%93%9C%20%EC%9E%90%EC%B9%B4%EB%93%9C%20%EC%88%84%EB%8D%94%EB%B0%B1?%24large%24=&fmt=auto&qlt=default',
    name: 'M Diamant 3D 다이아몬드 자카드 숄더백', price: '₩2,050,000',
    detailUrl: 'https://kr.mcmworldwide.com/ko_KR/%EA%B0%80%EB%B0%A9/%EB%AA%A8%EB%91%90%EB%B3%B4%EA%B8%B0/diamant-3d-%EB%8B%A4%EC%9D%B4%EC%95%84%EB%AA%AC%EB%93%9C-%EC%9E%90%EC%B9%B4%EB%93%9C-%EC%88%84%EB%8D%94%EB%B0%B1/MWSGAAK02MT001.html?cgid=bags-all-bags',
  },
];

export default function App() {
  return <div className="figma-home" id="top">
    <div className="figma-announcement">
      <img className="announcement-mark" src="/assets/figma-announcement.svg" alt="" />
      <span>MCM 아이콘 |</span><a href="#collection">Aren 비세토스 컬렉션을 만나보세요</a>
      <div className="announcement-links"><a href="#collection">배송조회</a><a href="#collection">1:1 고객 문의</a><a href="#collection">KR(₩)/KO</a><a href="#collection">매장</a></div>
    </div>
    <header className="figma-nav">
      <nav aria-label="주 메뉴">{navigation.map((item) => <a href="#collection" key={item}>{item}</a>)}</nav>
      <a className="figma-logo" href="#top" aria-label="MCM 홈"><img src="/assets/figma-logo.png" alt="MCM" /></a>
      <div className="figma-tools">{utilities.map(([label, src]) => <button type="button" aria-label={label} key={label}><img src={src} alt="" /></button>)}</div>
    </header>
    <main>
      <section className="figma-hero" aria-label="MCM 신규 컬렉션">
        <img className="hero-image" src="/assets/figma-hero.png" alt="MCM 신규 컬렉션" />
        <div className="hero-detail"><img src="/assets/figma-hero-detail.png" alt="컬렉션 상세 이미지" /></div>
        <a className="collection-link" href="#collection"><img src="/assets/icon-arrow.svg" alt="arrow" /> 컬렉션 쇼핑하기</a>
      </section>
      <section className="figma-collection" id="collection" aria-labelledby="collection-title">
        <h1 id="collection-title">신규 컬렉션</h1>
        <div className="figma-product-grid">{products.map((product) => <article className="figma-product" key={product.id}>
          <div className="figma-product-image"><a href={product.detailUrl} target="_blank" rel="noreferrer" aria-label={`${product.name} 공식 상세 보기`}><img src={product.image} alt={product.name} /></a><button type="button" aria-label={`${product.name} 찜하기`}><img src="/assets/figma-heart-small.svg" alt="" /></button></div>
          <h2>{product.name}</h2><p>{product.price}</p>
        </article>)}</div>
      </section>
    </main>
  </div>;
}
