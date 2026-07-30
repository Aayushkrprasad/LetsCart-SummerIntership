---
name: letscart_learnings
description: Guidelines and documentation of LetsCart DB-driven storefront, layout authorization, same-email switch role flow, and login portal selector.
---
# LetsCart Learnings & Standards

This workspace contains customized logic for role switching, database-driven catalogs, and layout security. When working on this codebase:

## 1. Unified Same-Email Role Switching
- Users can register multiple profiles (e.g. BUYER, SELLER, DELIVERY) under a single email address.
- Instead of logging out to switch profiles, the UI uses `/api/auth/switch-role` to verify their current session, generate a new JWT token for the target role, and switch profiles seamlessly.
- Frontends (both storefront `Navbar.jsx` and seller `StoreNavbar.jsx`) render identical dynamic dropdown options to switch profiles in 1 click.

## 2. Storefront Database Catalog
- The catalog fetched from `/api/products` (and seller store `/api/store/details`) combines database-driven products with dummy assets.
- Ensure optional chaining is used on properties like `product.rating` and `product.store` to avoid runtime crashes when database products lack these relation arrays.

## 3. Account / Portal Redirection
- When a user logs in, they select their role/portal (Customer, Seller, Delivery Partner, Admin) from tabs on the login page (`login/page.jsx`).
- The login API consumes this `role` body parameter and authenticates them directly into the target dashboard profile.
