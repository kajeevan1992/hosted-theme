import React from 'react';

export function AnnouncementBar({ data = {} }) {
  if (data.enabled === false) return null;

  return (
    <div
      className="border-b border-white/10 px-4 py-2 text-center text-sm font-bold"
      style={{
        background: data.background || '#18A7D0',
        color: data.textColor || '#ffffff',
      }}
    >
      <span>{data.message || 'Same day printing available across London.'}</span>
    </div>
  );
}

export default AnnouncementBar;
