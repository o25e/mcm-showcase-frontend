import { getProductName } from '../../utils/productName';
import { ko } from '../../i18n/ko';

export default function FittingHistory({
  history,
  fittingProductIds,
  language,
  onSelect,
  onWishlistToggle,
  onFittingToggle,
}) {
  const visibleHistory = [
    ...history,
    ...Array.from({ length: Math.max(0, 3 - history.length) }, () => null),
  ];

  return (
    <div className="fitting-page__history" aria-label={ko.fitting.history}>
      {visibleHistory.map((item, index) => (
        <button
          className={`fitting-page__history-card ${item ? 'active' : ''}`}
          type="button"
          key={item ? item.id : `history-empty-${index}`}
          onClick={() => onSelect(item)}
          disabled={!item}
        >
          {item && (
            <>
              <img
                className="fitting-page__history-heart"
                src={item.wishlisted ? '/assets/product-detail-heart-click.png' : '/assets/product-detail-heart.png'}
                alt=""
                onClick={(event) => {
                  event.stopPropagation();
                  onWishlistToggle(item);
                }}
              />
              <img
                className="fitting-page__history-hanger"
                src={fittingProductIds.has(item.productId) ? '/assets/icon-cloth-click.png' : '/assets/product-detail-cloth.png'}
                alt=""
                onClick={(event) => {
                  event.stopPropagation();
                  onFittingToggle(item);
                }}
              />
              <img
                className="fitting-page__history-product"
                src={item.imageUrl}
                alt={`${getProductName(item, language)} ${ko.fitting.historyAlt}`}
              />
            </>
          )}
        </button>
      ))}
    </div>
  );
}