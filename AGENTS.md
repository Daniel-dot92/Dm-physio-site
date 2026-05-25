# Project Notes

- Do not create, edit, or replace a local booking page for `/book`.
- The public booking route must stay routed to the external booking app at `https://book.dmphysi0.com/book`.
- Keep the supporting rewrites for `/_next/:path*`, `/booking-topbar.js`, `/api/availability`, and `/api/book` pointing to `book.dmphysi0.com`.
- If booking functionality needs changes, make them in the separate booking app project, not in this website repository.
