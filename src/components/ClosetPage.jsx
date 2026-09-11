import { useEffect, useRef, useState } from 'react';
import LoginPanel from './LoginPanel';
import SearchOverlay from './SearchOverlay';
import StoreHeader from './StoreHeader';
import { API_BASE_URL } from '../api/config';

const API_ASSET_BASE_URL = API_BASE_URL || 'https://api.mcm-showcase.com';
import { getMyClosetList, getMyClosetLook, saveLookToMember } from '../api/myCloset';
import { getProductNameLines } from '../utils/productName';
import { ko } from '../i18n/ko';

function resolveLookImage(look) {
  const image = look?.avatarImageUrl || look?.avatarImage || look?.avatarUrl || look?.imageUrl || look?.image;
  if (typeof image !== 'string' || !image.trim()) return '/assets/avatar-complete/avatar_f.png';
  return image.startsWith('/') ? `${API_ASSET_BASE_URL}${image}` : image;
}

function extractLookList(data) {
  if (Array.isArray(data)) return data;
  return [data?.content, data?.items, data?.data, data?.results].find(Array.isArray) || [];
}

function resolveProductImage(product) {
  const image = product?.imageUrl || product?.image;
  if (typeof image !== 'string' || !image.trim()) return '/assets/figma-product.png';
  return image.startsWith('/') ? `${API_ASSET_BASE_URL}${image}` : image;
}

function getProductName(product, language) {
  return language === 'en' ? (product?.nameEn || product?.name || '') : (product?.name || product?.nameEn || '');
}

function formatProductPrice(price) {
  if (typeof price === 'number' && Number.isFinite(price)) return `₩${price.toLocaleString()}`;
  return price || '';
}

function mapProduct(product, language) {
  return {
    productId: product?.productId,
    name: getProductName(product, language),
    price: formatProductPrice(product?.price),
    image: resolveProductImage(product),
    url: product?.productUrl || '#',
    // This is the immutable snapshot from the AR fitting that created the
    // avatar. It is intentionally separate from the current wishlist.
    historicalWishlisted: product?.isWishlisted === true,
    raw: product,
  };
}

export default function ClosetPage({ member, sharedStyleProfileId, detailStyleProfileId, onLoginSuccess, onLogout, onWishlistOpen, onCartOpen, language = 'ko' }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [looks, setLooks] = useState([]);
  const [lookError, setLookError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [historyPage, setHistoryPage] = useState(0);
  const savedSharedMemberIdRef = useRef(null);
  // A shared QR result must be available on every scan, including on the
  // same device after the guest has left the page. It is not a saved closet
  // record until the guest logs in and the result is linked to the member.
  const isSharedLookVisible = true;
  const historyRef = useRef(null);
  const historyDragRef = useRef(null);
  const isModalOpen = isLoginOpen || isSearchOpen || selectedRecord !== null;

  useEffect(() => {
    if (!sharedStyleProfileId || !isSharedLookVisible) return undefined;
    let cancelled = false;
    getMyClosetLook(sharedStyleProfileId).then((look) => {
      if (!cancelled) setLooks([look]);
    }).catch((error) => {
      console.error(ko.errors.sharedLookLog, error);
      if (!cancelled) setLookError(ko.errors.sharedLook);
    });
    return () => { cancelled = true; };
  }, [sharedStyleProfileId, isSharedLookVisible]);

  useEffect(() => {
    const hasMemberId = member?.memberId !== undefined
      && member?.memberId !== null
      && member?.memberId !== '';
    if (!sharedStyleProfileId || !hasMemberId) return undefined;
    if (savedSharedMemberIdRef.current === String(member.memberId)) return undefined;

    let cancelled = false;
    savedSharedMemberIdRef.current = String(member.memberId);
    saveLookToMember(sharedStyleProfileId, member.memberId)
      .then(() => {
        if (!cancelled) window.location.replace('/my-closet');
      })
      .catch((error) => {
        savedSharedMemberIdRef.current = null;
        console.error(ko.errors.saveLookLog, error);
        if (!cancelled) setLookError(ko.errors.saveLook);
      });

    return () => { cancelled = true; };
  }, [member?.memberId, sharedStyleProfileId]);

  async function handleSharedPageLogin(authenticatedMember) {
    const memberId = authenticatedMember?.memberId;
    const hasMemberId = memberId !== undefined && memberId !== null && memberId !== '';

    if (sharedStyleProfileId && hasMemberId) {
      try {
        // Complete the link before changing the route. This avoids losing the
        // shared profile when login and redirect happen in the same render.
        await saveLookToMember(sharedStyleProfileId, memberId);
        savedSharedMemberIdRef.current = String(memberId);
      } catch (error) {
        savedSharedMemberIdRef.current = null;
        setLookError(ko.errors.saveLook);
        throw error;
      }
    }

    await onLoginSuccess?.(authenticatedMember);

    if (sharedStyleProfileId) {
      window.location.replace('/my-closet');
    }
  }

  useEffect(() => {
    if (!detailStyleProfileId) return undefined;
    let cancelled = false;
    setDetailLoading(true);
    setDetailError('');
    getMyClosetLook(detailStyleProfileId).then((look) => {
      if (!cancelled) {
        setLooks([look]);
        setSelectedRecord({
          styleProfileId: look.styleProfileId,
          image: resolveLookImage(look),
          date: look.createdAt ? new Date(look.createdAt).toLocaleDateString('ko-KR') : ko.common.today,
          title: look.styleIdentityTitle || ko.closet.defaultTitle,
          raw: look,
        });
        setDetailLoading(false);
      }
    }).catch((error) => {
      console.error(ko.errors.detailLog, error);
      if (!cancelled) {
        setDetailError(ko.errors.detail);
        setDetailLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [detailStyleProfileId]);

  useEffect(() => {
    const closetMemberId = member?.memberId;
    const hasMemberId = closetMemberId !== undefined && closetMemberId !== null && closetMemberId !== '';
    if (!hasMemberId || sharedStyleProfileId || detailStyleProfileId) return undefined;
    let cancelled = false;
    getMyClosetList(closetMemberId).then((data) => {
      if (!cancelled) setLooks(extractLookList(data));
    }).catch((error) => {
      console.error(ko.errors.listLog, error);
      if (!cancelled) setLookError(ko.errors.list);
    });
    return () => { cancelled = true; };
  }, [member?.memberId, sharedStyleProfileId, detailStyleProfileId]);

  const toRecord = (look) => ({
    styleProfileId: look.styleProfileId,
    image: resolveLookImage(look),
    date: look.createdAt ? new Date(look.createdAt).toLocaleDateString('ko-KR') : ko.common.today,
    title: look.styleIdentityTitle || ko.closet.defaultTitle,
    raw: look,
  });
  const visibleRecords = sharedStyleProfileId
    ? (isSharedLookVisible ? looks.map(toRecord) : [])
    : detailStyleProfileId
      ? looks.map(toRecord)
      : (member ? looks.map(toRecord) : []);

  async function handleRecordSelect(record) {
    setSelectedRecord(record);
    setDetailLoading(true);
    setDetailError('');

    if (!record?.styleProfileId) {
      setDetailLoading(false);
      return;
    }

    try {
      const look = await getMyClosetLook(record.styleProfileId);
      setSelectedRecord(toRecord(look));
    } catch (error) {
      console.error('Closet detail request failed:', error);
      setDetailError(ko.errors.detail);
    } finally {
      setDetailLoading(false);
    }
  }

  const closeSelectedRecord = () => {
    if (detailStyleProfileId) {
      window.location.replace('/my-closet');
      return;
    }

    setSelectedRecord(null);
  };

  useEffect(() => {
    if (!isModalOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsLoginOpen(false);
        setSelectedRecord(null);
      }
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isModalOpen]);

  const startHistoryDrag = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    event.preventDefault();

    const list = historyRef.current;
    if (!list) return;

    historyDragRef.current = { lastX: event.clientX };
    list.classList.add('dragging');

    const dragHistory = (moveEvent) => {
      const drag = historyDragRef.current;
      if (!drag) return;

      moveEvent.preventDefault();
      const distance = drag.lastX - moveEvent.clientX;
      list.scrollLeft += distance;
      drag.lastX = moveEvent.clientX;
    };

    const endHistoryDrag = () => {
      list.classList.remove('dragging');
      historyDragRef.current = null;
      window.removeEventListener('pointermove', dragHistory, true);
      window.removeEventListener('pointerup', endHistoryDrag, true);
    };

    window.addEventListener('pointermove', dragHistory, true);
    window.addEventListener('pointerup', endHistoryDrag, true);
  };

  const selectedLook = selectedRecord?.raw || {};
  const todayProducts = Array.isArray(selectedLook.todayLook?.products)
    ? selectedLook.todayLook.products.map((product) => mapProduct(product, language)).map((product) => ({
        ...product,
        isWishlisted: product.historicalWishlisted,
      }))
    : [];
  const historyProducts = Array.isArray(selectedLook.fittingHistory)
    ? selectedLook.fittingHistory.map((product) => mapProduct(product, language)).map((product) => ({
        ...product,
        isWishlisted: product.historicalWishlisted,
      }))
    : [];
  const historyPageCount = Math.max(1, Math.ceil(historyProducts.length / 5));
  const historyEmptySlotCount = historyProducts.length > 0
    ? (5 - (historyProducts.length % 5)) % 5
    : 0;
  const wishlistCount = new Set(
    [...todayProducts, ...historyProducts]
      .filter((product) => product.historicalWishlisted)
      .map((product) => String(product.productId)),
  ).size;

  useEffect(() => {
    setHistoryPage(0);
    if (historyRef.current) historyRef.current.scrollLeft = 0;
  }, [selectedRecord?.styleProfileId, historyProducts.length]);

  const getClosestHistoryPage = () => {
    const list = historyRef.current;
    const cards = list ? Array.from(list.children) : [];
    if (!list || cards.length === 0) return 0;

    const firstOffset = cards[0].offsetLeft;
    let closestPage = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (let page = 0; page < historyPageCount; page += 1) {
      const pageStartCard = cards[page * 5];
      if (!pageStartCard) break;

      const distance = Math.abs(list.scrollLeft - (pageStartCard.offsetLeft - firstOffset));
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPage = page;
      }
    }

    return closestPage;
  };

  const syncHistoryPageFromScroll = () => {
    const nextPage = getClosestHistoryPage();
    setHistoryPage((currentPage) => (currentPage === nextPage ? currentPage : nextPage));
  };

  const moveHistoryPage = (direction) => {
    const list = historyRef.current;
    const cards = list ? Array.from(list.children) : [];
    if (!list || cards.length === 0) return;

    const targetPage = Math.min(
      historyPageCount - 1,
      Math.max(0, getClosestHistoryPage() + direction),
    );
    const targetCard = cards[targetPage * 5];
    if (!targetCard) return;

    list.scrollTo({
      left: targetCard.offsetLeft - cards[0].offsetLeft,
      behavior: 'smooth',
    });
    setHistoryPage(targetPage);
  };

  return (
    <div className={`closet-page${member ? ' is-authenticated' : ''}`} id="top">
      <StoreHeader
        activePage="closet"
        onLoginOpen={() => setIsLoginOpen(true)}
        onWishlistOpen={onWishlistOpen}
        onCartOpen={onCartOpen}
        onSearchOpen={() => setIsSearchOpen(true)}
      />

      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}

      <main>
        {detailError && !selectedRecord && <p role="alert">{detailError}</p>}
        <section className="closet-hero" aria-labelledby="closet-title">
          <img className="closet-hero-overlay" src="/assets/closet-hero-overlay.png" alt={ko.closet.heroAlt} />

          <div className="closet-hero-copy">
            <h1 id="closet-title">CLOSET</h1>
            <p>{ko.closet.heroDescription}</p>
          </div>

        </section>

        {!member && <section className="closet-login" aria-label={ko.closet.loginLabel}>
          <p>
            {ko.closet.loginMessage}<br />
            {ko.closet.loginMessageContinue}
          </p>
          <button type="button" onClick={() => setIsLoginOpen(true)}>{ko.closet.login}</button>
        </section>}

        {sharedStyleProfileId && isSharedLookVisible && (
          <section className="closet-shared-result" aria-live="polite">
            {lookError ? <p>{lookError}</p> : visibleRecords[0] ? (
              <button type="button" onClick={() => handleRecordSelect(visibleRecords[0])}>
                <img src={visibleRecords[0].image} alt={ko.closet.qrAvatarAlt} />
                <span>{visibleRecords[0].title}</span>
              </button>
            ) : <p>{ko.closet.loadingAvatar}</p>}
          </section>
        )}

        <section className="closet-records" id="closet-records" aria-label={ko.closet.records}>
          <div className="closet-record-grid">
            {visibleRecords.map((record, index) => (
              <article
                className="closet-record"
                key={index}
                role="button"
                tabIndex={0}
                onClick={() => handleRecordSelect(record)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleRecordSelect(record);
                  }
                }}
              >
                <div className="closet-record-image">
                  <img src={record.image} alt={ko.common.styleRecord} />
                </div>

                <div className="closet-record-copy">
                  <p>{record.date}</p>
                  <h2>{record.title}</h2>
                  <span><img src="/assets/icon-place.svg" alt="" /> {ko.common.location}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {isLoginOpen && (
        <LoginPanel
          member={member}
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleSharedPageLogin}
          onLogout={onLogout}
          onWishlistOpen={onWishlistOpen}
          onCartOpen={onCartOpen}
        />
      )}

      {selectedRecord && (
        <div className="closet-detail-modal" role="presentation">
          <button
            className="closet-detail-backdrop"
            type="button"
            aria-label={ko.closet.detailClose}
            onClick={closeSelectedRecord}
          />

          <aside className="closet-detail-sheet" role="dialog" aria-modal="true" aria-labelledby="closet-detail-title">
            <button
              className="closet-detail-handle"
              type="button"
              aria-label={ko.closet.detailClose}
              onClick={closeSelectedRecord}
            >
              <span />
            </button>

            <button
              className="closet-detail-close"
              type="button"
              aria-label={ko.closet.detailClose}
              onClick={closeSelectedRecord}
            >
              ×
            </button>

            <div className="closet-detail-content">
              {detailLoading && <p role="status">{ko.closet.loadingDetail}</p>}
              {detailError && <p role="alert">{detailError}</p>}
              <img className="closet-detail-avatar" src={selectedRecord.image} alt={ko.closet.selectedAvatarAlt} />

              <div className="closet-detail-main">
                <header className="closet-detail-header">
                  <p>{selectedRecord.date}</p>
                  <h2 id="closet-detail-title">{selectedRecord.title}</h2>
                  <span><img src="/assets/icon-place.svg" alt="" /> {ko.common.location}</span>

                  <div className="closet-detail-stats">
                    <span><img src="/assets/icon-heart-big.png" alt="" />{wishlistCount}</span>
                  </div>
                </header>

                <section className="closet-outfit">
                  <h3>{ko.closet.todayLook}</h3>

                  <div className="closet-outfit-list">
                    {todayProducts.map((product) => (
                      <div className="closet-product-today" key={product.productId}>
                        <a className="closet-product-link" href={product.url} target="_blank" rel="noreferrer">
                          <img src={product.image} alt={product.name} />
                        </a>
                        <button type="button" aria-label={ko.common.productWishlist} aria-pressed={product.isWishlisted} disabled>
                          <img src={product.isWishlisted ? '/assets/icon-heart-small-click.svg' : '/assets/icon-heart-small.svg'} alt="" />
                        </button>
                        <p>
                          {getProductNameLines(product, language).map((line, index) => (
                            <span key={`${line}-${index}`}>
                              {index > 0 && <br />}
                              {line}
                            </span>
                          ))}
                        </p>
                        <small>{product.price}</small>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="closet-history">
                  <h3>HISTORY</h3>

                  <div className="closet-history-carousel">
                    <button
                      className="closet-history-nav closet-history-prev"
                      type="button"
                      aria-label={language === 'en' ? 'Previous history products' : '이전 히스토리 상품'}
                      onClick={() => moveHistoryPage(-1)}
                      disabled={historyPage === 0 || historyPageCount <= 1}
                    >
                      <img src="/assets/icon-next.png" alt="" />
                    </button>

                    <div
                      className="closet-history-list"
                      ref={historyRef}
                      onPointerDown={startHistoryDrag}
                      onScroll={syncHistoryPageFromScroll}
                    >
                      {historyProducts.map((product) => (
                        <article className="closet-history-card" key={product.productId}>
                          <div>
                            <a className="closet-product-link" href={product.url} target="_blank" rel="noreferrer">
                              <img src={product.image} alt={product.name} draggable="false" />
                            </a>
                            <button type="button" aria-label={ko.common.productWishlist} aria-pressed={product.isWishlisted} disabled>
                              <img src={product.isWishlisted ? '/assets/icon-heart-small-click.svg' : '/assets/icon-heart-small.svg'} alt="" />
                            </button>
                          </div>
                          <p>
                            {getProductNameLines(product, language).map((line, index) => (
                              <span key={`${line}-${index}`}>
                                {index > 0 && <br />}
                                {line}
                              </span>
                            ))}
                          </p>
                          <small>{product.price}</small>
                        </article>
                      ))}
                      {Array.from({ length: historyEmptySlotCount }, (_, index) => (
                        <article
                          className="closet-history-card closet-history-card--empty"
                          aria-hidden="true"
                          key={`history-empty-${index}`}
                        >
                          <div />
                        </article>
                      ))}
                    </div>

                    <button
                      className="closet-history-nav closet-history-next"
                      type="button"
                      aria-label={language === 'en' ? 'Next history products' : '다음 히스토리 상품'}
                      onClick={() => moveHistoryPage(1)}
                      disabled={historyPage >= historyPageCount - 1 || historyPageCount <= 1}
                    >
                      <img src="/assets/icon-next.png" alt="" />
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
