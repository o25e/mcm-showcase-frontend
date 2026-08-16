import { useEffect, useRef, useState } from 'react';
import LoginPanel from './LoginPanel';
import { API_BASE_URL } from '../api/config';

const API_ASSET_BASE_URL = API_BASE_URL || 'https://api.mcm-showcase.com';
import { getMyClosetList, getMyClosetLook, saveLookToMember } from '../api/myCloset';

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

const closetProducts = Array.from({ length: 10 }, () => ({
  name: 'Ottomar 비세토스 위켄더',
  price: '₩2,050,000',
  image: '/assets/figma-product.png',
  url: 'https://kr.mcmworldwide.com/ko_KR/%ED%8A%B8%EB%9E%98%EB%B8%94/%EB%9F%AC%EA%B8%B0%EC%A7%80-%EB%B0%B1/ottomar-%EB%B9%84%EC%84%B8%ED%86%A0%EC%8A%A4-%EC%9C%84%EC%BC%84%EB%8D%94/MMVAAVY02CO001.html',
}));

export default function ClosetPage({ member, sharedStyleProfileId, detailStyleProfileId, onLoginSuccess, onLogout }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [looks, setLooks] = useState([]);
  const [lookError, setLookError] = useState('');
  const sharedLookStorageKey = sharedStyleProfileId
    ? `mcm.shared-look-viewed:${sharedStyleProfileId}`
    : '';
  const [isSharedLookVisible, setIsSharedLookVisible] = useState(() => {
    if (!sharedStyleProfileId || member) return true;

    try {
      return localStorage.getItem(`mcm.shared-look-viewed:${sharedStyleProfileId}`) !== '1';
    } catch {
      return true;
    }
  });
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
    if (!sharedStyleProfileId || member || !isSharedLookVisible) return undefined;

    const markSharedLookAsViewed = () => {
      try {
        localStorage.setItem(sharedLookStorageKey, '1');
      } catch {
        // Storage may be unavailable in private browsing.
      }
    };

    window.addEventListener('pagehide', markSharedLookAsViewed);
    return () => window.removeEventListener('pagehide', markSharedLookAsViewed);
  }, [member, sharedLookStorageKey, sharedStyleProfileId, isSharedLookVisible]);

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
      }
    }).catch((error) => {
      console.error('클로젯 상세 조회 오류:', error);
      if (!cancelled) setLookError('스타일 정보를 불러오지 못했습니다.');
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

      <header className="figma-nav closet-nav">
        <nav aria-label="주 메뉴">
          {navItems.map((item) => (
            <a href={item === 'CLOSET' ? '#closet' : '#top'} className={item === 'CLOSET' ? 'active' : ''} key={item}>
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
      </header>

      <main>
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
              <button type="button" onClick={() => setSelectedRecord(visibleRecords[0])}>
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
                onClick={() => setSelectedRecord(record)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedRecord(record);
                  }
                }}
              >
                <div className="closet-record-image">
                  <img src={record.image} alt="스타일 기록" />
                </div>

                <div className="closet-record-copy">
                  <p>{record.date}</p>
                  <h2>{record.title}</h2>
                  <span><img src="/assets/icon-place.svg" alt="" /> 이태원 플래그십</span>
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
              <img className="closet-detail-avatar" src={selectedRecord.image} alt="선택한 스타일 아바타" />

              <div className="closet-detail-main">
                <header className="closet-detail-header">
                  <p>{selectedRecord.date}</p>
                  <h2 id="closet-detail-title">{selectedRecord.title}</h2>
                  <span><img src="/assets/icon-place.svg" alt="" /> 이태원 플래그십</span>

                  <div className="closet-detail-stats">
                    <span><img src="/assets/icon-cloth.png" alt="" />2</span>
                    <span><img src="/assets/icon-heart-big.png" alt="" />3</span>
                  </div>
                </header>

                <section className="closet-outfit">
                  <h3>오늘의 룩</h3>

                  <div className="closet-product-today">
                    <a className="closet-product-link" href={closetProducts[0].url} target="_blank" rel="noreferrer">
                      <img src={closetProducts[0].image} alt={closetProducts[0].name} />
                    </a>
                    <button type="button" aria-label="상품 찜하기">
                      <img src="/assets/icon-heart-small.png" alt="" />
                    </button>
                    <p>{closetProducts[0].name}</p>
                    <small>{closetProducts[0].price}</small>
                  </div>
                </section>

                <section className="closet-history">
                  <h3>HISTORY</h3>

                  <div className="closet-history-carousel">
                    <div className="closet-history-list" ref={historyRef} onPointerDown={startHistoryDrag}>
                      {closetProducts.map((product, index) => (
                        <article className="closet-history-card" key={index}>
                          <div>
                            <a className="closet-product-link" href={product.url} target="_blank" rel="noreferrer">
                              <img src={product.image} alt={product.name} draggable="false" />
                            </a>
                            <button type="button" aria-label="상품 찜하기">
                              <img src="/assets/icon-heart-small.png" alt="" />
                            </button>
                          </div>
                          <p>{product.name}</p>
                          <small>{product.price}</small>
                        </article>
                      ))}
                    </div>

                    <span className="closet-history-next" aria-hidden="true">
                      <img src="/assets/icon-next.png" alt="" />
                    </span>
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
