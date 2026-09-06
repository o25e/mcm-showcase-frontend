import { useState } from 'react';
import { ko } from '../i18n/ko';
import Header from './Header';
import Accordion from './Accordion';
import ProductCard from './ProductCard';
import ProductGallery from './ProductGallery';
import { product as defaultProduct, recommendations } from '../data/product';

export default function ProductDetail({ product = defaultProduct }) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColour, setSelectedColour] = useState(product.colours[0]);
  const [isWished, setIsWished] = useState(false);

  return (
    <div className="product-page" id="top">
      <Header />

      <main>
        <section className="product" aria-label={ko.product.detail}>
          <ProductGallery images={product.images} selectedImage={selectedImage} onSelect={setSelectedImage} />

          <div className="details">
            <p className="breadcrumb">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="price">{product.price}</p>
            <div className="rule" />

            <div className="colors">
                    <p>{ko.product.color} <strong>{selectedColour.name}</strong></p>

              <div className="swatches" role="group" aria-label={ko.product.colorSelect}>
                {product.colours.map((colour) => (
                  <button
                    className={`swatch ${colour.name === selectedColour.name ? 'selected' : ''}`}
                    type="button"
                    key={colour.name}
                    style={{ '--swatch': colour.hex }}
                    onClick={() => setSelectedColour(colour)}
                    aria-label={colour.name}
                  />
                ))}
              </div>
            </div>

            <p className="description">{product.description}</p>
            <Accordion items={product.details} />
            <button className="cart-button" type="button">{ko.product.addCart}</button>

            <button className={`wish-button ${isWished ? 'saved' : ''}`} type="button" onClick={() => setIsWished(!isWished)}>
              <img src="/assets/product-detail-heart-small.svg" alt="" />
              <span>{isWished ? ko.product.wished : ko.product.wish}</span>
            </button>
          </div>
        </section>

        <section className="recommendations" aria-labelledby="recommend-title">
          <h2 id="recommend-title">{ko.product.recommendations}</h2>
          <div className="recommendation-grid">
            {recommendations.map((item) => <ProductCard key={item.name} {...item} />)}
          </div>
        </section>
      </main>
    </div>
  );
}
