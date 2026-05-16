import React from 'react';
import Breadcrumbs from '../layouts/Breadcrumbs';
import STOREFRONT_THEME from '../core/storefrontTheme';

export function ReusableProductTemplate({
  breadcrumbs = [],
  hero,
  gallery,
  configurator,
  pricing,
  delivery,
  faq,
  related,
  actions,
}) {
  return (
    <div className="bg-[#F7F8FC]">
      <div className={`${STOREFRONT_THEME.container} ${STOREFRONT_THEME.pageSpacing}`}>
        <div className={STOREFRONT_THEME.sectionSpacing}>
          {breadcrumbs.length ? <Breadcrumbs items={breadcrumbs} /> : null}

          {hero ? hero : null}

          <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="space-y-6 lg:sticky lg:top-[126px]">
              {gallery ? gallery : null}
              {faq ? faq : null}
            </div>

            <div className="space-y-6">
              {configurator ? configurator : null}

              <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                {pricing ? pricing : null}
                {delivery ? delivery : null}
              </div>

              {actions ? actions : null}
            </div>
          </section>

          {related ? related : null}
        </div>
      </div>
    </div>
  );
}

export default ReusableProductTemplate;
