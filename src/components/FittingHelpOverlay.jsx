const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];
const categories = ['Bags', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];
// The Figma help screen uses empty translucent history cards; these are not
// product thumbnails, so keep them free of image content.
const historyItems = [{ active: true }, {}, {}];
const products = ['/assets/figma-fitting/raw_7.png', '/assets/figma-fitting/raw_5.png', '/assets/figma-fitting/raw_10.png', '/assets/figma-fitting/raw_6.png', '/assets/figma-fitting/raw_20.png', '/assets/figma-fitting/raw_15.png'];

function Note({ className = '', children }) { return <div className={`fitting-help__note ${className}`}>{children}</div>; }
function Pointer({ className = '' }) { return <span className={`fitting-help__pointer ${className}`} aria-hidden="true" />; }

export default function FittingHelpOverlay({ onClose }) {
  return <section className="fitting-help" aria-labelledby="fitting-help-title">
    <img className="fitting-help__background" src="/assets/figma-fitting/raw_1.png" alt="" aria-hidden="true" /><div className="fitting-help__veil" aria-hidden="true" />
    <nav className="fitting-help__steps" aria-label="AR fitting progress">{steps.map((step, index) => <span className={index < 4 ? 'active' : ''} key={step}>{step}</span>)}</nav><div className="fitting-help__track" aria-hidden="true"><span /></div>
    <Note className="fitting-help__note--comment-top">선택에 따라 달라지는 쇼핑 코멘트를 확인해보세요.</Note><Pointer className="fitting-help__pointer--comment-top" />
    <Note className="fitting-help__note--comment-bottom">피팅을 마치고 나만의 스타일을 확인해보세요.</Note><Pointer className="fitting-help__pointer--comment-bottom" />
    <Note className="fitting-help__note--history">지금까지 피팅한 상품을 확인해보세요.</Note><Pointer className="fitting-help__pointer--history" />
    <Note className="fitting-help__note--heart">마음에 드는 상품은 하트로 저장하세요.</Note><Pointer className="fitting-help__pointer--heart" />
    <Note className="fitting-help__note--hanger">직접 보고 싶은 상품은 옷걸이를 눌러보세요.</Note><Pointer className="fitting-help__pointer--hanger" />
    <Note className="fitting-help__note--product">원하는 MCM 아이템을 선택해보세요.<br />상품 상세를 확인하고 피팅할 수 있어요.</Note><Pointer className="fitting-help__pointer--product" />
    <Note className="fitting-help__note--refresh">새로운 선택을 받고 싶다면<br />새로고침을 눌러주세요.</Note><Pointer className="fitting-help__pointer--refresh" />
    <section className="fitting-help__history" aria-labelledby="fitting-history-title"><h2 id="fitting-history-title">History</h2><div className="fitting-help__history-list">{historyItems.map((item, index) => <article className={`fitting-help__history-card ${item.active ? 'active' : ''}`} key={`history-${index}`}><button className="fitting-help__history-heart" type="button" aria-label="상품 저장"><img src="/assets/product-detail-heart-small.svg" alt="" /></button><button className="fitting-help__history-hanger" type="button" aria-label="상품 보기"><img src="/assets/icon-cloth.png" alt="" /></button></article>)}</div><div className="fitting-help__history-line" aria-hidden="true" /></section>
    <section className="fitting-help__comment" aria-labelledby="fitting-comment-title"><h1 id="fitting-comment-title">Comment</h1><div className="fitting-help__comment-rule" aria-hidden="true" /></section><button className="fitting-help__finish" type="button">피팅 종료하기</button>
    <section className="fitting-help__catalog" aria-label="추천 상품"><div className="fitting-help__tabs">{categories.map((category, index) => <span className={index === 0 ? 'active' : ''} key={category}>{category}{index === 0 && <i className="fitting-help__tab-indicator" aria-hidden="true" />}</span>)}</div><div className="fitting-help__catalog-rule" aria-hidden="true" /><div className="fitting-help__product-grid">{products.map((product, index) => <article className="fitting-help__product" key={product}><img src={product} alt={`추천 상품 ${index + 1}`} /></article>)}</div><span className="fitting-help__product-bottom-rule" aria-hidden="true" /><button className="fitting-help__refresh" type="button" aria-label="새로고침"><img src="/assets/figma-fitting-refresh.svg" alt="" /></button></section>
    <button className="fitting-help__close" type="button" onClick={onClose}>닫기</button>
  </section>;
}
