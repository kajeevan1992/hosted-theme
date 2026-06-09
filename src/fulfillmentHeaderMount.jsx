import React from 'react';
import { createRoot } from 'react-dom/client';
import FulfillmentSelector from './components/FulfillmentSelector';

const MOUNT_ATTR = 'data-holo-fulfilment-mount';

function findHeaderActionBars() {
  if (typeof document === 'undefined') return [];
  return Array.from(document.querySelectorAll('#root header .ml-auto.flex.items-center.gap-2'));
}

function mountIntoBar(bar) {
  if (!bar || bar.querySelector(`[${MOUNT_ATTR}]`)) return false;
  const mount = document.createElement('span');
  mount.setAttribute(MOUNT_ATTR, 'true');
  mount.className = 'hidden md:inline-flex';
  bar.insertBefore(mount, bar.firstChild);
  createRoot(mount).render(<FulfillmentSelector compact />);
  return true;
}

export function installFulfillmentHeaderMount() {
  if (typeof document === 'undefined') return;

  const run = () => {
    findHeaderActionBars().forEach(mountIntoBar);
  };

  run();
  window.setTimeout(run, 50);
  window.setTimeout(run, 250);
  window.setTimeout(run, 1000);

  const observer = new MutationObserver(run);
  const root = document.getElementById('root') || document.body;
  observer.observe(root, { childList: true, subtree: true });

  window.addEventListener('locationchange', run);
  window.addEventListener('popstate', run);
}
