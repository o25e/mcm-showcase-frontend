import { getArCopy } from './arCopy';

const steps = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];
const categories = ['Bags', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];
const historyItems = [{ active: true }, {}, {}];
const products = [
  '/assets/figma-fitting/raw_7.png',
  '/assets/figma-fitting/raw_5.png',
  '/assets/figma-fitting/raw_10.png',
  '/assets/figma-fitting/raw_6.png',
  '/assets/figma-fitting/raw_20.png',
  '/assets/figma-fitting/raw_15.png',
];

function Note({ className = '', children }) {
  return <div className={`fitting-help__note ${className}`}>{children}</div>;
}

function Pointer({ className = '' }) {
  return <span className={`fitting-help__pointer ${className}`} aria-hidden="true" />;
}

export default function FittingHelpOverlay({ onClose, language = 'ko' }) {
  const t = getArCopy(language);

  return (
    <section className={`fitting-help ${language === 'en' ? 'fitting-help--en' : ''}`} aria-labelledby="fitting-help-title">
      <img className="fitting-help__background" src="/assets/figma-fitting/raw_1.png" alt="" aria-hidden="true" />
      <div className="fitting-help__veil" aria-hidden="true" />

      <nav className="fitting-help__steps" aria-label="AR fitting progress">
        {steps.map((step, index) => <span className={index < 4 ? 'active' : ''} key={step}>{step}</span>)}
      </nav>
      <div className="fitting-help__track" aria-hidden="true"><span /></div>

      <Note className="fitting-help__note--comment-top">{t.commentTop}</Note>
      <Pointer className="fitting-help__pointer--comment-top" />

      <Note className="fitting-help__note--comment-bottom">{t.commentBottom}</Note>
      <Pointer className="fitting-help__pointer--comment-bottom" />

      <Note className="fitting-help__note--history">{t.history}</Note>
      <Pointer className="fitting-help__pointer--history" />

      <Note className="fitting-help__note--heart">{t.heart}</Note>
      <Pointer className="fitting-help__pointer--heart" />

      <Note className="fitting-help__note--hanger">{t.hanger}</Note>
      <Pointer className="fitting-help__pointer--hanger" />

      <Note className="fitting-help__note--product">{t.product}<br />{t.productDetail}</Note>
      <Pointer className="fitting-help__pointer--product" />

      <Note className="fitting-help__note--refresh">
        {language === 'ko' ? <>새로운 선택을 받고 싶다면<br />새로고침을 눌러주세요.</> : t.refresh}
      </Note>
      <Pointer className="fitting-help__pointer--refresh" />

      <section className="fitting-help__history" aria-labelledby="fitting-history-title">
        <h2 id="fitting-history-title">History</h2>

        <div className="fitting-help__history-list">
          {historyItems.map((item, index) => (
            <article className={`fitting-help__history-card ${item.active ? 'active' : ''}`} key={`history-${index}`}>
              <button className="fitting-help__history-heart" type="button" aria-label="Save product">
                <img src="/assets/product-detail-heart-small.svg" alt="" />
              </button>
              <button className="fitting-help__history-hanger" type="button" aria-label="View product">
                <img src="/assets/icon-cloth.png" alt="" />
              </button>
            </article>
          ))}
        </div>

        <div className="fitting-help__history-line" aria-hidden="true" />
      </section>

      <section className="fitting-help__comment" aria-labelledby="fitting-comment-title">
        <h1 id="fitting-comment-title">Comment</h1>
        <div className="fitting-help__comment-rule" aria-hidden="true" />
      </section>

      <button className="fitting-help__finish" type="button">{t.fittingFinish}</button>

      <section className="fitting-help__catalog" aria-label="Recommended products">
        <div className="fitting-help__tabs">
          {categories.map((category, index) => (
            <span className={index === 0 ? 'active' : ''} key={category}>
              {category}
              {index === 0 && <i className="fitting-help__tab-indicator" aria-hidden="true" />}
            </span>
          ))}
        </div>

        <div className="fitting-help__catalog-rule" aria-hidden="true" />

        <div className="fitting-help__product-grid">
          {products.map((product, index) => (
            <article className="fitting-help__product" key={product}>
              <img src={product} alt={`Recommended product ${index + 1}`} />
            </article>
          ))}
        </div>

        <span className="fitting-help__product-bottom-rule" aria-hidden="true" />
        <button className="fitting-help__refresh" type="button" aria-label="Refresh">
          <img src="/assets/figma-fitting-refresh.svg" alt="" />
        </button>
      </section>

      <button className="fitting-help__close" type="button" onClick={onClose}>{t.close}</button>
    </section>
  );
}