import { useState } from 'react';
import Header from './components/Header';
import Accordion from './components/Accordion';
import ProductCard from './components/ProductCard';
import ProductGallery from './components/ProductGallery';
import { product, recommendations } from './data/product';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(product.images[1]);
  const [selectedColour, setSelectedColour] = useState(product.colours[0]);
  const [isWished, setIsWished] = useState(false);
  const [toast, setToast] = useState('');
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2200); };

  return <div id="top">
    <Header />
    <main>
      <section className="product" aria-label="상품 상세">
        <ProductGallery images={product.images} selectedImage={selectedImage} onSelect={setSelectedImage} />
        <div className="details">
          <p className="breadcrumb">{product.category}</p><h1>{product.name}</h1><p className="price">{product.price}</p><div className="rule" />
          <div className="colors"><p>컬러 — <strong>{selectedColour.name}</strong></p><div className="swatches" role="group" aria-label="색상 선택">
            {product.colours.map((colour) => <button className={`swatch ${colour.name === selectedColour.name ? 'selected' : ''}`} type="button" key={colour.name} style={{ '--swatch': colour.hex }} onClick={() => setSelectedColour(colour)} aria-label={colour.name} />)}
          </div></div>
          <p className="description">{product.description}</p><Accordion items={product.details} />
          <button className="cart-button" type="button" onClick={() => notify('장바구니에 상품을 담았습니다.')}>장바구니 담기</button>
          <button className={`wish-button ${isWished ? 'saved' : ''}`} type="button" onClick={() => { setIsWished(!isWished); notify(!isWished ? '찜 목록에 저장했습니다.' : '찜 목록에서 제거했습니다.'); }}>
            <img src="/assets/icon-heart-small.svg" alt="" /><span>{isWished ? '찜 완료' : '찜하기'}</span>
          </button>
        </div>
      </section>
      <section className="recommendations" aria-labelledby="recommend-title"><h2 id="recommend-title">함께 보면 좋은 상품</h2><div className="recommendation-grid">
        {recommendations.map((item) => <ProductCard key={item.name} {...item} />)}
      </div></section>
    </main>
    <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
  </div>;
}
