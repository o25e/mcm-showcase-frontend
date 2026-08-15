import { useState } from 'react';

const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];
const categories = ['Bags', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];
const products = [
  '/assets/figma-fitting/raw_7.png',
  '/assets/figma-fitting/raw_5.png',
  '/assets/figma-fitting/raw_10.png',
  '/assets/figma-fitting/raw_6.png',
  '/assets/figma-fitting/raw_20.png',
  '/assets/figma-fitting/raw_15.png',
];

const avatar = '/assets/figma-fitting/avatar.png';

export default function FittingPage({ onFinish }) {
  const [category, setCategory] = useState('Bags');
  const [selected, setSelected] = useState(0);

  return (
    <section className="fitting-page" aria-labelledby="fitting-page-title">
      <img className="fitting-page__background" src="/assets/figma-fitting/raw_1.png" alt="" aria-hidden="true" />
      <div className="fitting-page__shade" aria-hidden="true" />

      <nav className="fitting-page__steps" aria-label="AR fitting progress">
        {steps.map((step, index) => <span className={index < 4 ? 'active' : ''} key={step}>{step}</span>)}
      </nav>
      <div className="fitting-page__track" aria-hidden="true"><span /></div>

      <h1 id="fitting-page-title" className="fitting-page__history-title">History</h1>
      <div className="fitting-page__history" aria-label="피팅 기록">
        {[0, 1, 2].map((item) => (
          <button className="fitting-page__history-card" type="button" key={item} aria-label={`피팅 기록 ${item + 1}`}>
            <img className="fitting-page__history-heart" src="/assets/product-detail-heart-small.svg" alt="" />
            <img className="fitting-page__history-hanger" src="/assets/icon-cloth.png" alt="" />
          </button>
        ))}
        <span className="fitting-page__history-rule" aria-hidden="true" />
      </div>

      <div className="fitting-page__comment">
        <h2>Comment</h2>
        <span aria-hidden="true" />
      </div>

      <img className="fitting-page__avatar" src={avatar} alt="피팅 아바타" />

      <button className="fitting-page__finish" type="button" onClick={onFinish}>피팅 종료하기</button>

      <section className="fitting-page__catalog" aria-label="추천 상품">
        <div className="fitting-page__tabs" role="tablist" aria-label="상품 카테고리">
          {categories.map((item) => (
            <button className={category === item ? 'active' : ''} type="button" role="tab" aria-selected={category === item} onClick={() => setCategory(item)} key={item}>
              {item}
            </button>
          ))}
        </div>
        <span className="fitting-page__catalog-rule" aria-hidden="true" />
        <div className="fitting-page__product-grid">
          {products.map((product, index) => (
            <button className={`fitting-page__product ${selected === index ? 'selected' : ''}`} type="button" onClick={() => setSelected(index)} key={product} aria-label={`상품 ${index + 1}`}>
              <img src={product} alt="" />
            </button>
          ))}
        </div>
        <span className="fitting-page__product-bottom-rule" aria-hidden="true" />
        <button className="fitting-page__refresh" type="button" aria-label="새로고침" onClick={() => setSelected((selected + 1) % products.length)}>
          <img src="/assets/figma-fitting-refresh.svg" alt="" />
        </button>
      </section>
    </section>
  );
}
