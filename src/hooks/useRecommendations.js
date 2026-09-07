import { useCallback, useEffect, useRef, useState } from 'react';
import { getRecommendations, refreshRecommendations } from '../api/recommendations';
import { ko } from '../i18n/ko';

export const FITTING_CATEGORIES = ['Bags', 'Tops', 'Bottoms', 'Shoes', 'Accessories'];
export const CATEGORY_CODE_MAP = {
  Bags: 'bag',
  Tops: 'top',
  Bottoms: 'bottom',
  Shoes: 'shoes',
  Accessories: 'accessories',
};

export function useRecommendations(arSessionId) {
  const [category, setCategory] = useState('Bags');
  const [products, setProducts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState('');
  const cacheRef = useRef(new Map());
  const requestNoRef = useRef(0);
  const categoryRef = useRef('Bags');
  const sessionRef = useRef(arSessionId);
  const controllerRef = useRef(null);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const load = useCallback(async (categoryName, { refresh = false } = {}) => {
    const categoryCode = CATEGORY_CODE_MAP[categoryName];
    if (!Number.isFinite(arSessionId) || !categoryCode) return;

    const requestNo = ++requestNoRef.current;
    abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setError('');
      const data = refresh
        ? await refreshRecommendations(arSessionId, categoryCode, controller.signal)
        : await getRecommendations(arSessionId, categoryCode, controller.signal);
      if (sessionRef.current !== arSessionId) return;

      const nextProducts = Array.isArray(data.products) ? [...data.products] : [];
      if (!Array.isArray(data.products) && refresh) throw new Error('Invalid recommendation list');
      cacheRef.current.set(categoryName, nextProducts);
      if (requestNo !== requestNoRef.current || categoryRef.current !== categoryName) return;

      setProducts(nextProducts);
      setSelectedIndex(0);
    } catch (requestError) {
      if (requestError?.name === 'AbortError') return;
      console.error(refresh ? ko.errors.recommendationRefreshLog : ko.errors.recommendationLog, requestError);
      if (requestNo !== requestNoRef.current || categoryRef.current !== categoryName) return;
      setError(refresh ? ko.errors.recommendationRefresh : ko.errors.recommendation);
      if (!refresh) setProducts([]);
    }
  }, [abort, arSessionId]);

  useEffect(() => {
    sessionRef.current = arSessionId;
    cacheRef.current = new Map();
    requestNoRef.current += 1;
    categoryRef.current = 'Bags';
    setCategory('Bags');
    setProducts([]);
    setSelectedIndex(0);
  }, [arSessionId]);

  useEffect(() => {
    if (Number.isFinite(arSessionId)) load('Bags');
  }, [arSessionId, load]);

  useEffect(() => () => abort(), [abort]);

  const selectCategory = useCallback((nextCategory) => {
    abort();
    categoryRef.current = nextCategory;
    setCategory(nextCategory);
    setSelectedIndex(0);
    setError('');
    if (cacheRef.current.has(nextCategory)) {
      setProducts(cacheRef.current.get(nextCategory));
      requestNoRef.current += 1;
      return;
    }
    setProducts([]);
    load(nextCategory);
  }, [abort, load]);

  const refresh = useCallback(
    () => load(category, { refresh: true }),
    [category, load],
  );

  return {
    category,
    products,
    selectedIndex,
    selectedProduct: products[selectedIndex] ?? null,
    error,
    setError,
    selectCategory,
    selectProduct: (index) => {
      setSelectedIndex(index);
      setError('');
    },
    refresh,
  };
}
