import React, { useState } from 'react';
import DynamicStorefrontHome from './DynamicStorefrontHome';
import DynamicProductPage from './DynamicProductPage';
import DynamicCheckoutPage from './DynamicCheckoutPage';

export default function App() {
  const [route, setRoute] = useState({ type: 'home' });

  const openProduct = (slug) => {
    setRoute({ type: 'product', slug });
    window.scrollTo(0, 0);
  };

  const openCheckout = () => {
    setRoute({ type: 'checkout' });
    window.scrollTo(0, 0);
  };

  if (route.type === 'product') {
    return <DynamicProductPage slug={route.slug} />;
  }

  if (route.type === 'checkout') {
    return <DynamicCheckoutPage />;
  }

  return (
    <DynamicStorefrontHome
      onOpenProduct={openProduct}
      onOpenCheckout={openCheckout}
    />
  );
}
