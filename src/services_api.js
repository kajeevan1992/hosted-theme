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
  upload: (file) => storefront.artwork?.upload?.(file),
};

export const customer = {
  orders: {
    list: () => storefront.customer?.orders?.list?.(),
    get: (id) => storefront.customer?.orders?.get?.(id),
  }
};
