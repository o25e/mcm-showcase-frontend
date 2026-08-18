import { useEffect, useRef, useState } from 'react';
import LoginPanel from './LoginPanel';
import { API_BASE_URL } from '../api/config';

const API_ASSET_BASE_URL = API_BASE_URL || 'https://api.mcm-showcase.com';
import { getMyClosetList, getMyClosetLook, saveLookToMember } from '../api/myCloset';
import { getProductNameLines } from '../utils/productName';

function resolveLookImage(look) {
  const image = look?.avatarImageUrl || look?.avatarImage || look?.avatarUrl || look?.imageUrl || look?.image;
  if (typeof image !== 'string' || !image.trim()) return '/assets/avatar-complete/avatar_f.png';
  return image.startsWith('/') ? `${API_ASSET_BASE_URL}${image}` : image;
}

function extractLookList(data) {
  if (Array.isArray(data)) return data;
  return [data?.content, data?.items, data?.data, data?.results].find(Array.isArray) || [];
}

const navItems = ['신상품', '가방', '여성', '남성', '트래블', '라이프스타일', 'MCM ICONS', '선물 제안', 'MCM 소개', 'CLOSET'];

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
    isWishlisted: product?.isWishlisted === true,
    raw: product,
  };
}

export default function ClosetPage({ member, sharedStyleProfileId, detailStyleProfileId, onLoginSuccess, onLogout, language = 'ko' }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [looks, setLooks] = useState([]);
  const [lookError, setLookError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  // A shared QR result must be available on every scan, including on the
  // same device after the guest has left the page. It is not a saved closet
  // record until the guest logs in and the result is linked to the member.
  const isSharedLookVisible = true;
  const historyRef = useRef(null);
  const historyDragRef = useRef(null);
  const isModalOpen = isLoginOpen || selectedRecord !== null;

  useEffect(() => {
    if (!sharedStyleProfileId || !isSharedLookVisible) return undefined;
    let cancelled = false;
    getMyClosetLook(sharedStyleProfileId).then((look) => {
      if (!cancelled) setLooks([look]);
    }).catch((error) => {
      console.error('공유 아바타 조회 오류:', error);
      if (!cancelled) setLookError('아바타 정보를 불러오지 못했습니다. QR 코드를 다시 스캔해 주세요.');
    });
    return () => { cancelled = true; };
  }, [sharedStyleProfileId, isSharedLookVisible]);

  useEffect(() => {
    if (!sharedStyleProfileId || !member?.memberId) return undefined;

    let cancelled = false;
    saveLookToMember(sharedStyleProfileId, member.memberId)
      .then(() => {
        if (!cancelled) window.location.replace('/my-closet');
      })
      .catch((error) => {
        console.error('QR 아바타 회원 연결 오류:', error);
        if (!cancelled) setLookError('아바타를 회원 클로젯에 저장하지 못했습니다.');
      });

    return () => { cancelled = true; };
  }, [member?.memberId, sharedStyleProfileId]);

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
          date: look.createdAt ? new Date(look.createdAt).toLocaleDateString('ko-KR') : '오늘',
          title: look.styleIdentityTitle || '오늘의 스타일',
          raw: look,
        });
        setDetailLoading(false);
      }
    }).catch((error) => {
      console.error('클로젯 상세 조회 오류:', error);
      if (!cancelled) {
        setDetailError('상세 정보를 불러오지 못했습니다.');
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
      console.error('클로젯 목록 조회 오류:', error);
      if (!cancelled) setLookError('저장된 스타일을 불러오지 못했습니다.');
    });
    return () => { cancelled = true; };
  }, [member?.memberId, sharedStyleProfileId, detailStyleProfileId]);

  const toRecord = (look) => ({
    styleProfileId: look.styleProfileId,
    image: resolveLookImage(look),
    date: look.createdAt ? new Date(look.createdAt).toLocaleDateString('ko-KR') : '오늘',
    title: look.styleIdentityTitle || '오늘의 스타일',
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
      setDetailError('상세 정보를 불러오지 못했습니다.');
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
    ? selectedLook.todayLook.products.map((product) => mapProduct(product, language))
    : [];
  const historyProducts = Array.isArray(selectedLook.fittingHistory)
    ? selectedLook.fittingHistory.map((product) => mapProduct(product, language))
    : [];
  const wishlistCount = new Map(
    [...todayProducts, ...historyProducts]
      .filter((product) => product.isWishlisted)
      .map((product) => [product.productId, product]),
  ).size;

  return (
    <div className={`closet-page${member ? ' is-authenticated' : ''}`} id="top">
      <div className="figma-announcement closet-announcement">
        <img className="announcement-mark" src="/assets/figma-announcement.svg" alt="" />
        <span>MCM 아이콘 |</span>
        <a href="#closet-records">Aren 이스트 웨스트 숄더백을 만나보세요</a>

        <div className="announcement-links">
          <a href="#closet-records">배송조회</a>
          <a href="#closet-records">1:1 고객 문의</a>
          <a href="#closet-records">KR(₩)/KO</a>
          <a href="#closet-records">매장</a>
        </div>
      </div>

      <header className={`figma-nav closet-nav${isMobileMenuOpen ? ' is-mobile-menu-open' : ''}`}>
        <button
          className="mobile-menu-button"
          type="button"
          aria-label="메뉴 열기"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
        >
          <img src="/assets/icon-menu.svg" alt="" />
        </button>
        <button className="mobile-search-button" type="button" aria-label="검색">
          <img src="/assets/figma-search.svg" alt="" />
        </button>
        <nav aria-label="주 메뉴">
          {navItems.map((item) => (
            <a href={item === 'CLOSET' ? '#closet' : '#top'} className={item === 'CLOSET' ? 'active' : ''} key={item} onClick={() => setIsMobileMenuOpen(false)}>
              {item}
            </a>
          ))}
        </nav>

        <a className="figma-logo" href="#top" aria-label="MCM 홈">
          <img src="/assets/figma-logo.png" alt="MCM" />
        </a>

        <div className="figma-tools">
          {[
            ['검색', 'figma-search.svg'],
            ['마이 페이지', 'figma-user.svg'],
            ['위시리스트', 'figma-heart.svg'],
            ['쇼핑백', 'figma-bag.svg'],
          ].map(([label, icon]) => (
            <button
              type="button"
              aria-label={label}
              key={label}
              onClick={label === '마이 페이지' ? () => setIsLoginOpen(true) : undefined}
            >
              <img src={`/assets/${icon}`} alt="" />
            </button>
          ))}
        </div>
        {isMobileMenuOpen && <button className="mobile-menu-backdrop" type="button" aria-label="메뉴 닫기" onClick={() => setIsMobileMenuOpen(false)} />}
      </header>

      <main>
        {detailError && !selectedRecord && <p role="alert">{detailError}</p>}
        <section className="closet-hero" aria-labelledby="closet-title">
          <img className="closet-hero-overlay" src="/assets/closet-hero-overlay.png" alt="MCM Closet 아바타" />

          <div className="closet-hero-copy">
            <h1 id="closet-title">CLOSET</h1>
            <p>내 스타일에 맞는 MCM 아바타를 저장해보세요</p>
          </div>

          <button className="closet-arrow closet-arrow-left" type="button" aria-label="이전 아바타">‹</button>
          <button className="closet-arrow closet-arrow-right" type="button" aria-label="다음 아바타">›</button>
        </section>

        {!member && <section className="closet-login" aria-label="로그인 안내">
          <p>
            오늘의 스타일을 이어가세요.<br />
            로그인하면 이 Avatar를 저장하고 다음 쇼핑에서도 나만의 MCM Closet을 이어갈 수 있어요.
          </p>
          <button type="button" onClick={() => setIsLoginOpen(true)}>로그인 하기</button>
        </section>}

        {sharedStyleProfileId && isSharedLookVisible && (
          <section className="closet-shared-result" aria-live="polite">
            {lookError ? <p>{lookError}</p> : visibleRecords[0] ? (
              <button type="button" onClick={() => handleRecordSelect(visibleRecords[0])}>
                <img src={visibleRecords[0].image} alt="QR로 불러온 나의 아바타" />
                <span>{visibleRecords[0].title}</span>
              </button>
            ) : <p>나의 아바타를 불러오는 중입니다...</p>}
          </section>
        )}

        <section className="closet-records" id="closet-records" aria-label="스타일 기록">
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
                  <img src={record.image} alt="스타일 기록" />
                </div>

                <div className="closet-record-copy">
                  <p>{record.date}</p>
                  <h2>{record.title}</h2>
                  <span><img src="/assets/icon-place.svg" alt="" /> 청담 플래그십</span>
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
          onLoginSuccess={onLoginSuccess}
          onLogout={onLogout}
        />
      )}

      {selectedRecord && (
        <div className="closet-detail-modal" role="presentation">
          <button
            className="closet-detail-backdrop"
            type="button"
            aria-label="스타일 상세 닫기"
            onClick={closeSelectedRecord}
          />

          <aside className="closet-detail-sheet" role="dialog" aria-modal="true" aria-labelledby="closet-detail-title">
            <button
              className="closet-detail-handle"
              type="button"
              aria-label="스타일 상세 닫기"
              onClick={closeSelectedRecord}
            >
              <span />
            </button>

            <button
              className="closet-detail-close"
              type="button"
              aria-label="스타일 상세 닫기"
              onClick={closeSelectedRecord}
            >
              ×
            </button>

            <div className="closet-detail-content">
              {detailLoading && <p role="status">상세 정보를 불러오는 중입니다...</p>}
              {detailError && <p role="alert">{detailError}</p>}
              <img className="closet-detail-avatar" src={selectedRecord.image} alt="선택한 스타일 아바타" />

              <div className="closet-detail-main">
                <header className="closet-detail-header">
                  <p>{selectedRecord.date}</p>
                  <h2 id="closet-detail-title">{selectedRecord.title}</h2>
                  <span><img src="/assets/icon-place.svg" alt="" /> 청담 플래그십</span>

                  <div className="closet-detail-stats">
                    <span><img src="/assets/icon-heart-big.png" alt="" />{wishlistCount}</span>
                  </div>
                </header>

                <section className="closet-outfit">
                  <h3>오늘의 룩</h3>

                  <div className="closet-outfit-list">
                    {todayProducts.map((product) => (
                      <div className="closet-product-today" key={product.productId}>
                        <a className="closet-product-link" href={product.url} target="_blank" rel="noreferrer">
                          <img src={product.image} alt={product.name} />
                        </a>
                        <button type="button" aria-label="상품 찜하기">
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
                    <div className="closet-history-list" ref={historyRef} onPointerDown={startHistoryDrag}>
                      {historyProducts.map((product) => (
                        <article className="closet-history-card" key={product.productId}>
                          <div>
                            <a className="closet-product-link" href={product.url} target="_blank" rel="noreferrer">
                              <img src={product.image} alt={product.name} draggable="false" />
                            </a>
                            <button type="button" aria-label="상품 찜하기">
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
                    </div>

                    {historyProducts.length >= 5 && (
                      <span className="closet-history-next" aria-hidden="true">
                        <img src="/assets/icon-next.png" alt="" />
                      </span>
                    )}
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
