import { useState } from 'react';

const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];
const categories = ['Bags', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];
const products = ['/assets/figma-fitting/raw_7.png', '/assets/figma-fitting/raw_5.png', '/assets/figma-fitting/raw_10.png', '/assets/figma-fitting/raw_6.png', '/assets/figma-fitting/raw_20.png', '/assets/figma-fitting/raw_15.png'];
const details = [['Aren 비세토스 숄더백', '\₩ 1,090,000'], ['Tracy 비세토스 숄더백', '\₩ 1,450,000'], ['S Aren 비세토스 E/W 숄더백', '\₩ 1,090,000'], ['Dessau 비세토스 드로우스트링 백', '\₩ 1,250,000'], ['M Diamant 3D 숄더백', '\₩ 2,050,000'], ['Aren 비세토스 미니 백', '\₩ 890,000']];

export default function FittingPage({ onFinish }) {
  const [category, setCategory] = useState('Bags');
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const detail = details[selected];
  return <section className="fitting-page" aria-labelledby="fitting-page-title">
    <img className="fitting-page__background" src="/assets/figma-fitting/raw_1.png" alt="" aria-hidden="true" /><div className="fitting-page__shade" />
    <nav className="fitting-page__steps" aria-label="AR fitting progress">{steps.map((step, index) => <span className={index < 4 ? 'active' : ''} key={step}>{step}</span>)}</nav><div className="fitting-page__track"><span /></div>
    <h1 id="fitting-page-title" className="fitting-page__history-title">History</h1><div className="fitting-page__history">{[0, 1, 2].map((item) => <button className="fitting-page__history-card" type="button" key={item}><img src="/assets/product-detail-heart-small.svg" alt="" /><img src="/assets/icon-cloth.png" alt="" /></button>)}</div>
    <div className="fitting-page__comment"><h2>Comment</h2><span /></div><img className="fitting-page__avatar" src="/assets/figma-fitting/avatar.png" alt="fitting avatar" /><button className="fitting-page__finish" type="button" onClick={onFinish}>피팅 종료하기</button>
    <section className="fitting-page__catalog" aria-label="추천 상품"><div className="fitting-page__tabs" role="tablist">{categories.map((item) => <button className={category === item ? 'active' : ''} type="button" role="tab" aria-selected={category === item} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><span className="fitting-page__catalog-rule" /><div className="fitting-page__product-grid">{products.map((product, index) => <button className={`fitting-page__product ${selected === index ? 'selected' : ''}`} type="button" onClick={() => { setSelected(index); setOpen(true); }} key={product} aria-label={`상품 ${index + 1}`}><img src={product} alt="" /></button>)}</div><span className="fitting-page__product-bottom-rule" /><button className="fitting-page__refresh" type="button" onClick={() => setSelected((selected + 1) % products.length)}><img src="/assets/figma-fitting-refresh.svg" alt="새로고침" /></button></section>
    {open && <div className="fitting-product-frame-backdrop" role="presentation" onClick={() => setOpen(false)}><article className="fitting-product-frame" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="fitting-product-frame__close" type="button" onClick={() => setOpen(false)} aria-label="닫기">×</button><img className="fitting-product-frame__image" src={products[selected]} alt={detail[0]} /><h2>{detail[0]}</h2><p className="fitting-product-frame__price">{detail[1]}</p><p className="fitting-product-frame__color">Color</p><div className="fitting-product-frame__swatches"><span /><span /><span /><span /></div><button className="fitting-product-frame__fit" type="button" onClick={() => setOpen(false)}>피팅하기</button></article></div>}
  </section>;
}
