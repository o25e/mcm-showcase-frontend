import { useState } from 'react';

const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];
const categories = ['Bags', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];

const products = [
  {
    productId: 1,
    productCode: 'MWPGALR01BK001',
    name: 'New Liz 엠보스드 모노그램 레더 쇼퍼',
    price: 1490000,
    image: 'https://api.mcm-showcase.com/images/MWPGALR01BK001.jpg',
  },
  {
    productId: 2,
    productCode: 'MWHGAXT03CO001',
    name: 'Tracy 비세토스 호보',
    price: 1690000,
    image: 'https://api.mcm-showcase.com/images/MWHGAXT03CO001.jpg',
  },
  {
    productId: 3,
    productCode: 'MMKGATA01BK001',
    name: 'Aren 다이아몬드 퀼팅 레더 백팩',
    price: 2690000,
    image: 'https://api.mcm-showcase.com/images/MMKGATA01BK001.jpg',
  },
  {
    productId: 4,
    productCode: 'MMVAAVY02BK001',
    name: 'Ottomar 비세토스 위켄더',
    price: 2050000,
    image: 'https://api.mcm-showcase.com/images/MMVAAVY02BK001.jpg',
  },
  {
    productId: 5,
    productCode: 'MWPGSLR024B001',
    name: 'New Liz 비세토스 쇼퍼',
    price: 1090000,
    image: 'https://api.mcm-showcase.com/images/MWPGSLR024B001.jpg',
  },
  {
    productId: 6,
    productCode: 'MMZGSFI01BK001',
    name: 'Fursten 모노그램 나일론 벨트백',
    price: 650000,
    image: 'https://api.mcm-showcase.com/images/MMZGSFI01BK001.jpg',
  },
];

export default function FittingPage({ onFinish }) {
  const [category, setCategory] = useState('Bags');
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);

  const selectedProduct = products[selected];

  return (
    <section className="fitting-page" aria-labelledby="fitting-page-title">
      <img className="fitting-page__background" src="/assets/figma-fitting/raw_1.png" alt="" aria-hidden="true" />
      <div className="fitting-page__shade" />

      <nav className="fitting-page__steps" aria-label="AR fitting progress">
        {steps.map((step, index) => (
          <span className={index < 4 ? 'active' : ''} key={step}>{step}</span>
        ))}
      </nav>
      <div className="fitting-page__track"><span /></div>

      <h1 id="fitting-page-title" className="fitting-page__history-title">History</h1>
      <div className="fitting-page__history">
        {[0, 1, 2].map((item) => (
          <button className="fitting-page__history-card" type="button" key={item}>
            <img src="/assets/product-detail-heart-small.svg" alt="" />
            <img src="/assets/icon-cloth.png" alt="" />
          </button>
        ))}
      </div>

      <div className="fitting-page__comment">
        <h2>Comment</h2>
        <span />
      </div>

      <img className="fitting-page__avatar" src="/assets/figma-fitting/avatar.png" alt="fitting avatar" />
      <button className="fitting-page__finish" type="button" onClick={onFinish}>피팅 종료하기</button>

      <section className="fitting-page__catalog" aria-label="추천 상품">
        <div className="fitting-page__tabs" role="tablist">
          {categories.map((item) => (
            <button className={category === item ? 'active' : ''} type="button" role="tab" aria-selected={category === item} onClick={() => setCategory(item)} key={item}>
              {item}
            </button>
          ))}
        </div>

        <span className="fitting-page__catalog-rule" />

        <div className="fitting-page__product-grid">
          {products.map((product, index) => (
            <button
              className={`fitting-page__product ${selected === index ? 'selected' : ''}`}
              type="button"
              onClick={() => {
                setSelected(index);
                setOpen(true);
              }}
              key={product.productId}
              aria-label={product.name}
            >
              <img src={product.image} alt={product.name} />
            </button>
          ))}
        </div>

        <span className="fitting-page__product-bottom-rule" />

        <button className="fitting-page__refresh" type="button" onClick={() => setSelected((selected + 1) % products.length)}>
          <img src="/assets/figma-fitting-refresh.svg" alt="새로고침" />
        </button>
      </section>

      {open && (
        <div className="fitting-product-frame-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <article className="fitting-product-frame" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button className="fitting-product-frame__close" type="button" onClick={() => setOpen(false)} aria-label="닫기">×</button>

            <img className="fitting-product-frame__image" src={selectedProduct.image} alt={selectedProduct.name} />
            <h2>{selectedProduct.name}</h2>
            <p className="fitting-product-frame__price">₩ {selectedProduct.price.toLocaleString()}</p>
            <p className="fitting-product-frame__color">Color</p>

            <div className="fitting-product-frame__swatches">
              <span />
              <span />
              <span />
              <span />
            </div>

            <button className="fitting-product-frame__fit" type="button" onClick={() => setOpen(false)}>피팅하기</button>
          </article>
        </div>
      )}
    </section>
  );
}