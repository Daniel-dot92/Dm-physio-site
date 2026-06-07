# Project Notes

- Do not create, edit, or replace a local booking page for `/book`.
- The public booking route must stay routed to the external booking app at `https://book.dmphysi0.com/book`.
- Keep the supporting rewrites for `/_next/:path*`, `/booking-topbar.js`, `/api/availability`, and `/api/book` pointing to `book.dmphysi0.com`.
- If booking functionality needs changes, make them in the separate booking app project, not in this website repository.

# Site Writing and UX Notes

- For every page, section, CTA, SEO text, or UX change, use the local project guidance extracted from the two user-provided documents: StoryBrand and Don't Make Me Think.
- Also consult the user-provided SEO analysis (`SEO.docx`) before text, SEO, structure, navigation, metadata, sitemap, internal-linking, or conversion changes. Treat its distilled rules below as project instructions.
- Patient is the hero; DM Physio is the guide. Start from the patient's pain, confusion, fear, or desired movement, not from brand praise.
- Every page should answer quickly: what is offered, how it helps, and what the next step is.
- Default path: pain or uncertainty -> choose body area or start with functional assessment -> understand likely cause -> see how DM Physio works -> book an appointment.
- Do not make patients choose a procedure blindly. When unsure, guide them toward functional assessment.
- Prefer direct CTAs: `Запази час`, `Започни с функционална оценка`, `Избери къде те боли`, `Виж как работим`.
- Avoid vague CTAs and filler such as `Научи повече`, `Виж още`, `професионална грижа`, `индивидуален подход`, unless the sentence explains exactly what happens.
- Keep copy short, scannable, mobile-first, and written in clear Bulgarian. Use concrete headings, short paragraphs, obvious buttons, and patient-facing language.
- Explain medical or anatomy terms in plain language. Do not promise guaranteed cure or 100% results.
- For DM Physio messaging, emphasize clarity, cause, plan, movement, functional assessment, therapy, exercises, habits, and reducing the risk that pain returns.

# SEO Analysis Notes

- Preserve the project focus as a local health/service site: human-first content, local intent, trust, clear next steps, and no keyword stuffing.
- Above-the-fold content should pass the 5-second test: what DM Physio offers, for whom, in Sofia/local context, what result the patient is seeking, and what to do next.
- Pain pages are high-priority SEO landing pages. When editing them, build useful symptom-to-cause content: what the person feels, common contributing factors, mistakes to avoid, when to seek assessment, how DM Physio approaches it, and the next step.
- Procedure/service pages should explain who the service is for, what happens during the session, what to expect, contraindications or caution notes where relevant, FAQ, CTA, and links to related pain/symptom pages.
- Use descriptive internal anchors instead of generic labels. Prefer anchors such as `Виж как протича функционалната оценка`, `Кинезитерапия при болка в кръста`, `Запази час за оценка`, or `Разбери коя процедура е подходяща`.
- Metadata rules: keep titles unique and locally relevant; write unique meta descriptions for home, service, pain, procedure, contact, and booking-related pages; avoid mass rewrites when an existing title already matches intent.
- Technical SEO rules: important indexable pages should have self-referencing absolute HTTPS canonicals, correct robots meta, sitemap inclusion, clear breadcrumbs, and no broken internal links.
- Sitemaps: `/book`, all procedure pages, all condition pages, and all main pain pages are priority. Video pages are not priority pages; keep them in the video sitemap rather than the priority sitemap.
- Booking rules: `/book` is a priority public entry point and must remain routed to the external booking app. Track the distinction between `www.dmphysi0.com/book` and `book.dmphysi0.com/book`; do not change booking architecture without explicit confirmation.
- Structured data: use LocalBusiness/MedicalBusiness only when the business/legal/professional status supports it; use BreadcrumbList and safe Service schema where accurate. Do not add fake ratings, fake reviews, unverified credentials, or self-serving review rich-result markup.
- Health/YMYL caution: avoid unverified outcomes, aggressive medical claims, percentages, `излекувани пациенти`, `гарантираме`, `живот без болка`, `болката ще изчезне`, or similar claims unless explicitly verified and legally safe. Prefer balanced language about assessment, factors, plan, movement, and support.
- For audits, mark unknown analytics, Search Console, GBP, backlinks, Core Web Vitals, or PageSpeed data as `unspecified` instead of guessing.
- Local SEO priorities: NAP consistency, Google Business Profile alignment, real review workflow without incentives, local service descriptions, photos, hours, map/directions, and click-to-call/contact/booking tracking.
- Accessibility and UX checks matter for SEO work: mobile parity, heading order, form labels and error states, focus states, tap targets, image alt by purpose, and clear CTA hierarchy.
