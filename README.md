# Atlantis Print Theme Starter

A React + Vite + Tailwind storefront starter inspired by your Atlantis Print design language.

## Included
- homepage hero
- product pages for business cards, flyers, posters
- booklet landing page
- all-products page
- bespoke quote page
- local cart page
- frontend-only pricing logic
- API-ready structure to connect later to your admin dashboard

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Coolify deploy
Use these values:
- Build command: `npm install && npm run build`
- Start command: `npm run preview`
- Port: `4173`

## Next recommended steps
1. Split `src/App.jsx` into route files and feature folders
2. Replace mock catalog with API fetches
3. Replace local cart with server cart
4. Connect bespoke quote form to your CRM/admin API
5. Add auth, account pages, checkout and CMS-managed content

## Updated demo polish
- wider layout container
- stronger typography hierarchy
- improved spacing and card depth
- sticky pricing column on product pages
- cleaner form and CTA styling


## Final demo pass
- cleaner hero typography and banner mockup
- polished desktop mega menu under All Products
- improved hover states and cards
- stronger product page balance and sticky price block
- cleaner dropdown-like navigation closer to the reference


## Demo v4 polish
- bigger container and stronger page proportions
- refined hero, header and mega menu spacing
- improved product configurator balance
- cleaner placeholder image blocks ready for final assets
- better overall premium feel for client presentation


## Demo v5 polish
- removed hero mockup artwork and replaced it with real slider image slots
- added replaceable image files in `public/images`
- scaled typography, buttons and layout down for a less zoomed-in feel
- tightened mega menu, cards and footer spacing
- switched product visuals to real image placeholders instead of text mockups


## Recreated theme pass
- visual direction tightened to match the uploaded screenshots more closely
- added black utility bar + cleaner white header
- lighter commerce-focused typography and controls
- replaced heavy mockup sections with image-first layouts
- rebuilt product pages with gallery + compact option controls
- rebuilt mega menu and footer with more professional proportions


## Elite UI pass
- added scroll-aware premium header
- refined hero with softer background glow
- improved card/image hover states
- upgraded buttons and product option interactions
- added subtle section reveal motion
- tightened product gallery and summary polish


## Full ecommerce structure pass
- expanded header nav with more categories
- rebuilt mega menu with fuller product/category coverage
- added collection strip, trust cards, featured products, testimonials, FAQ and how-it-works sections
- expanded all-products and footer structure
- updated brand styling to HOLO PRINT with blue, black and white palette


## Next build pass
- rebuilt header nav so every top-level item has a dropdown
- aligned dropdown region across the full header width between logo and cart area
- shifted the background to a softer grey-white tone closer to the references
- expanded section density and category coverage for a more reference-like structure


## Clean rebuild fix
- rebuilt the app structure to remove duplicated sections and broken stacking
- restored a single clean homepage sequence
- kept full dropdown coverage for all top-level nav items
- preserved HOLO PRINT branding and softer grey-white background


## Next build polish
- improved hero proportions and typography
- tightened section rhythm and card shadows
- added storefront stats band for more realism
- refined footer with a legal / utility row


## Next build
- refined dropdown proportions and hero balance
- added client/sector logo-style strip
- added service support cards before FAQ
- improved footer messaging and product summary depth


## Next build 3
- added mega menu utility row for richer dropdowns
- added breadcrumbs and related products to product pages
- added a stronger CTA band before the footer
- refined separators and section polish


## Next build 4
- enriched hero with quick trust chips
- improved mega menu feature card content
- added a comparison/support band under featured products
- added a richer quick-links row in the footer
- slightly increased card and summary polish


## Next build 5
- increased hero presence and card depth
- improved footer quick-link cards with counts
- added another credibility row before the final CTA band
- refined dropdown utility chips and product summary support styling
- softened overall background and section contrast


## Next build 6
- upgraded hero image panel and title scale
- improved collection cards with CTA detail
- added another announcement/support strip before the final CTA band
- added product support tiles below the main product layout
- refined legal row copy and overall contrast


## Next build 7
- improved typography scale further
- enhanced global hover and depth system
- added subtle section dividers
- improved dropdown shadow depth
- refined footer contrast


## Next build 9
- based on the last stable build instead of the risky color patch
- softened the grey-white palette safely
- upgraded hero panel scale and card finishes
- refined mega menu and footer cards with subtle gradients
- kept structure stable while improving visual richness


## Next build 10
- improved mega menu depth and nav typography
- added category promo row under collections
- added business / quote support panels before FAQ
- added trust chips to product pages
- refined overall background and spacing rhythm


## Product page upgrade
- rebuilt product pages to match the reference more closely
- added top tabs, help box, option tiles, pricing matrix and delivery selection
- replaced generic pills with commercial selector layouts
- added accordion content areas for description, specs, guidelines, FAQ and ordering
- fixed broken product support markup from the previous realism pass


## Product page next build
- refined tabs, help box and main image stage
- improved selector card proportions
- strengthened quantity and delivery cards
- upgraded purchase summary hierarchy
- added trust chips below CTAs
- improved accordion polish


## Checkout UX build
- added proper stepper-style checkout route
- added delivery option cards, artwork now/later flow, review and payment steps
- connected checkout submit to orders API service layer
- added customer account route with safe orders fallback
- wired cart proceed button and account navigation into the storefront


## Checkout next build
- upgraded checkout with stronger stepper UX
- added review and payment-step agreement handling
- improved artwork now/later messaging and upload state
- strengthened confirmation page
- upgraded account page with stats cards and safer order rendering


## Checkout/account next build
- added dedicated artwork upload route
- improved account area with artwork and reorder shortcuts
- made checkout/account flow feel more end-to-end for print-commerce handoff


## Frontend 5-point pass
- added standalone-friendly API service with env-based base URL support
- added runtime-safe error boundary and not-found page
- finished billing + delivery address step in checkout
- added order detail route and safer account-to-order flow
- improved artwork handoff to send order-linked metadata and fail gracefully


## Customer flow next build
- refined auth page layout and hierarchy
- improved account dashboard cards and recent-order actions
- tightened order-detail page sections and customer actions
- reduced width/spacing on artwork and checkout pages for a denser portal feel


## Customer flow build 4
- made auth page denser and less template-like
- restructured account page into summary + actions + denser order rows
- improved order detail into a job-management style page with simple progress strip
- tightened checkout/artwork widths for a denser portal feel


## Customer flow build 5
- added a needs-attention strip to account dashboard
- made account summary/actions feel more like job management
- improved order detail next-action panel
- tightened checkout/artwork widths again for a denser portal feel


## Controlled improvement build
- fixed dead top search with working suggestion dropdown
- improved product cards with badges, specs and larger image areas
- added a slightly richer color system while keeping the original structure
- replaced the empty dashboard with an intentional first-order state


## Fix pass
- top logo color restored to the original cyan
- added Same Day Printing to the top nav
- replaced small search popup with a centered full-window search overlay
- split Stationery and Signage onto their own routes so the active nav/filter state is correct
- added nginx.conf with SPA routing support to prevent refresh 404s on nested pages
