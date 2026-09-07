import { getProductName, getProductNameLines } from '../../utils/productName';
import { ko } from '../../i18n/ko';

export default function FittingProductModal({ product, language, error, isPending, isFitting, onClose, onFit }) {
  if (!product) return null;
  return (
    <div className="fitting-product-frame-backdrop" role="presentation" onClick={onClose}>
      <article
        className="fitting-product-frame"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="fitting-product-frame__close" type="button" onClick={onClose} aria-label={ko.fitting.close}>×</button>
        <img className="fitting-product-frame__image" src={product.imageUrl} alt={getProductName(product, language)} />
        <h2>
          {getProductNameLines(product, language).map((line, index) => (
            <span key={`${line}-${index}`}>
              {index > 0 && <br />}
              {line}
            </span>
          ))}
        </h2>
        <p className="fitting-product-frame__price">₩{Number(product.price || 0).toLocaleString()}</p>
        <p className="fitting-product-frame__color">Color</p>
        <div className="fitting-product-frame__swatches"><span /><span /><span /><span /></div>
        {error && <p role="alert" className="fitting-error">{error}</p>}
        <button className="fitting-product-frame__fit" type="button" onClick={onFit} disabled={isPending}>
          {isFitting ? (language === 'en' ? 'Remove' : ko.fitting.remove) : (language === 'en' ? 'Try on' : ko.fitting.tryOn)}
        </button>
      </article>
    </div>
  );
}
