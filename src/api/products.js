import { request } from './client';

const productRequests = new Map();

const productListRequests = new Map();

export function getProducts(filters = {}, signal) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, value);
  });

  const query = params.toString();
  const path = query ? `/api/products?${query}` : '/api/products';
  const key = path;

  if (!productListRequests.has(key)) {
    const productRequest = request(path, {
      headers: { Accept: 'application/json' },
      signal,
    }).then((payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.products)) return payload.products;
      return [];
    }).catch((error) => {
      productListRequests.delete(key);
      throw error;
    });
    productListRequests.set(key, productRequest);
  }

  return productListRequests.get(key);
}

export function getProduct(productId, signal) {
  const key = String(productId);
  if (!productRequests.has(key)) {
    const productRequest = request(`/api/products/${encodeURIComponent(productId)}`, {
      headers: { Accept: 'application/json' },
      signal,
    }).catch((error) => {
      productRequests.delete(key);
      throw error;
    });
    productRequests.set(key, productRequest);
  }
  return productRequests.get(key);
}
