import React from 'react';

export function BlockRenderer({ blocks = [], registry = {}, context = {} }) {
  return (
    <>
      {blocks.map((blockKey) => {
        const Component = registry?.[blockKey];

        if (!Component) {
          return null;
        }

        return <Component key={blockKey} context={context} />;
      })}
    </>
  );
}

export default BlockRenderer;
