import React from 'react';
import PageRenderer from '../renderers/PageRenderer';
import { homePagePayload } from '../data/homePagePayload';

export function HomePageRenderer({ payload = homePagePayload }) {
  return <PageRenderer page={payload} context={{ pageType: 'home' }} />;
}

export default HomePageRenderer;
