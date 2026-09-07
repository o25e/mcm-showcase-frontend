import { getProductName } from '../../utils/productName';
import { ko } from '../../i18n/ko';

export default function FittingCatalog({ categories, category, products, selectedIndex, language, onCategoryChange, onProductSelect, onRefresh }) {
  return (
    <section className="fitting-page__catalog" aria-label={ko.fitting.catalog}>
      <div className="fitting-page__tabs" role="tablist">
        {categories.map((item) => (
          <button
            className={category === item ? 'active' : ''}
            type="button"
            role="tab"
            aria-selected={category === item}
            onClick={() => onCategoryChange(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <span className="fitting-page__catalog-rule" />
      <div className="fitting-page__product-grid">
        {products.map((product, index) => (
          <button
            className={`fitting-page__product ${selectedIndex === index ? 'selected' : ''}`}
            type="button"
            onClick={() => onProductSelect(index)}
            key={product.productId}
            aria-label={getProductName(product, language)}
          >
            <img src={product.imageUrl} alt={getProductName(product, language)} />
          </button>
        ))}
      </div>
      <span className="fitting-page__product-bottom-rule" />
      <button className="fitting-page__refresh" type="button" onClick={onRefresh}>
        <img src="/assets/figma-fitting-refresh.svg" alt={ko.fitting.refresh} />
      </button>
    </section>
  );
}
