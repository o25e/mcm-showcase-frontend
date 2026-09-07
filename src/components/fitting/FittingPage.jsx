import { useEffect, useState } from 'react';
import { getArCopy } from '../arCopy';
import { useRecommendations, FITTING_CATEGORIES } from '../../hooks/useRecommendations';
import { useFittingInteractions } from '../../hooks/useFittingInteractions';
import { useAvatarGeneration } from '../../hooks/useAvatarGeneration';
import FittingCatalog from './FittingCatalog';
import FittingHistory from './FittingHistory';
import FittingProductModal from './FittingProductModal';
import AvatarPreview from './AvatarPreview';
import FittingErrorModal from './FittingErrorModal';

const STEPS = ['LOGIN', 'CONSENT', 'SCAN', 'FITTING', 'AVATAR'];
const AVATAR_BY_GENDER = {
  FEMALE: '/assets/figma-fitting/model_f.png',
  MALE: '/assets/figma-fitting/model_m.png',
};

function AvatarGeneratingView({ message }) {
  return (
    <main className="avatar-generating-page" aria-labelledby="avatar-generating-title">
      <img className="avatar-generating-page__background" src="/assets/ar-background.png" alt="" aria-hidden="true" />
      <div className="avatar-generating-page__shade" />
      <nav className="ar-page__progress" aria-label="AR fitting progress">
        {STEPS.map((step) => <span className="active" key={step}>{step}</span>)}
      </nav>
      <div className="ar-page__progress-track ar-page__progress-track--avatar" aria-hidden="true"><span /></div>
      <span className="avatar-generating-page__divider" aria-hidden="true" />
      <p id="avatar-generating-title" className="avatar-generating-page__message">{message}</p>
      <img className="avatar-generating-page__wave" src="/assets/ar-scanning-wave.png" alt="" aria-hidden="true" />
    </main>
  );
}

export default function FittingPage({ onFinish, arSessionId, gender, memberId = null, language = 'ko' }) {
  const t = getArCopy(language);
  const [avatarImage, setAvatarImage] = useState(
    AVATAR_BY_GENDER[gender] ?? AVATAR_BY_GENDER.FEMALE,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const recommendations = useRecommendations(arSessionId);
  const interactions = useFittingInteractions({
    arSessionId,
    gender,
    language,
    memberId,
    avatarImage,
    setAvatarImage,
  });
  const generation = useAvatarGeneration({ arSessionId, onFinish, language });

  useEffect(() => {
    setAvatarImage(AVATAR_BY_GENDER[gender] ?? AVATAR_BY_GENDER.FEMALE);
  }, [gender]);

  const selectProduct = (index) => {
    recommendations.selectProduct(index);
    setIsModalOpen(true);
  };

  if (generation.isGenerating) {
    return <AvatarGeneratingView message={t.avatarGenerating} />;
  }

  const selectedIsFitting = recommendations.selectedProduct
    && interactions.history.some(
      (item) => item.productId === recommendations.selectedProduct.productId
        && item.active !== false,
    );
  const fittingError = recommendations.error || interactions.error || generation.error;

  return (
    <section
      className={`fitting-page ${language === 'en' ? 'fitting-page--en' : ''}`}
      aria-labelledby="fitting-page-title"
    >
      <img className="fitting-page__background" src="/assets/figma-fitting/raw_1.png" alt="" aria-hidden="true" />
      <div className="fitting-page__shade" />
      <nav className="fitting-page__steps" aria-label="AR fitting progress">
        {STEPS.map((step, index) => (
          <span className={index < 4 ? 'active' : ''} key={step}>{step}</span>
        ))}
      </nav>
      <div className="fitting-page__track"><span /></div>
      <h1 id="fitting-page-title" className="fitting-page__history-title">History</h1>

      <FittingHistory
        history={interactions.history}
        fittingProductIds={interactions.fittingProductIds}
        language={language}
        onSelect={interactions.selectHistory}
        onWishlistToggle={interactions.toggleWishlist}
        onFittingToggle={interactions.requestFitting}
      />
      <span className="fitting-page__history-rule" aria-hidden="true" />

      <div className="fitting-page__comment">
        <h2>Comment</h2>
        <p>
          {interactions.comment.split('\n').map((line, index) => (
            <span key={`${line}-${index}`}>
              {index > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      </div>
      <span className="fitting-page__comment-rule" aria-hidden="true" />

      <AvatarPreview src={avatarImage} gender={gender} />
      <button
        className={`fitting-page__finish ${language === 'en' ? 'fitting-page__finish--english' : ''}`}
        type="button"
        onClick={generation.startGeneration}
      >
        {t.fittingFinish}
      </button>

      <FittingCatalog
        categories={FITTING_CATEGORIES}
        category={recommendations.category}
        products={recommendations.products}
        selectedIndex={recommendations.selectedIndex}
        language={language}
        onCategoryChange={(category) => {
          recommendations.selectCategory(category);
          setIsModalOpen(false);
        }}
        onProductSelect={selectProduct}
        onRefresh={recommendations.refresh}
      />
      <FittingProductModal
        product={isModalOpen ? recommendations.selectedProduct : null}
        language={language}
        error={fittingError}
        isPending={interactions.isInteractionPending}
        isFitting={selectedIsFitting}
        onClose={() => setIsModalOpen(false)}
        onFit={async () => {
          const done = await interactions.fitProduct(
            recommendations.selectedProduct,
            recommendations.category,
          );
          if (done) setIsModalOpen(false);
        }}
      />
      <FittingErrorModal
        product={interactions.noAvatarProduct}
        onClose={() => interactions.setNoAvatarProduct(null)}
      />
    </section>
  );
}
