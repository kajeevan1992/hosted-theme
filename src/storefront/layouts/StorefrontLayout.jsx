import React from 'react';
import { StorefrontChrome } from '../../components/StorefrontChrome';

export function StorefrontLayout({ currentPath = '/', children }) {
  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#161A22]">
      <StorefrontChrome currentPath={currentPath}>
        {children}
      </StorefrontChrome>
    </div>
  );
}

export default StorefrontLayout;
