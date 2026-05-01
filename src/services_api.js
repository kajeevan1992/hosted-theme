// Hosted theme service layer (internal SaaS)
const storefront = window.storefront || {};

export const products = {
  list: () => storefront.products?.list?.(),
  get: (id) => storefront.products?.get?.(id),
  search: (q) => storefront.products?.search?.(q),
};

export const cart = {
  get: () => storefront.cart?.get?.(),
  add: (item) => storefront.cart?.add?.(item),
  update: (item) => storefront.cart?.update?.(item),
  remove: (id) => storefront.cart?.remove?.(id),
};

export const checkout = {
  createOrder: (data) => storefront.checkout?.createOrder?.(data),
};

export const artwork = {
  upload: (file, meta = {}) => storefront.artwork?.upload?.({ file, ...meta }),
};

export const customer = {
  orders: {
    list: () => storefront.customer?.orders?.list?.(),
    get: (id) => storefront.customer?.orders?.get?.(id),
  }
};

// Backward-compatible named exports used by existing theme screens.
export const createOrder = (data) => checkout.createOrder(data);
export const uploadArtwork = (file, meta = {}) => artwork.upload(file, meta);
export const listProducts = (params) => products.list(params);
export const getProduct = (id) => products.get(id);
export const getCart = () => cart.get();
export const addToCart = (item) => cart.add(item);
export const updateCart = (item) => cart.update(item);
export const removeFromCart = (id) => cart.remove(id);
