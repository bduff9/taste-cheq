# TasteCheq Overview

## Purpose
TasteCheq is a mobile-first Progressive Web App (PWA) that empowers users to scan, record, and rate menu items from restaurants, bars, cafes, and more. By leveraging OCR technology, users can quickly digitize menus, add new venues, and track their culinary experiences. The platform is designed for flexibility, supporting food, drinks, desserts, and any menu-based items, with a focus on user-generated content and community-driven discovery.

## User Stories & Personas
- **Foodie Explorer**: Wants to remember and rate dishes they've tried at various places.
- **Adventurous Drinker**: Tracks cocktails and drinks sampled at bars, rating and marking favorites.
- **Dessert Lover**: Scans dessert menus and keeps a log of sweet treats tried.
- **Admin (You)**: Cleans up data, manages venues, and ensures quality.

## High-Level Feature List
- User authentication (sign up, sign in, avatars, home location)
- Scan and digitize menus using OCR (client-side, with fallback to server-side if needed)
- Add new restaurants/bars, with Google Maps integration and location-based suggestions
- Flat menu item lists with support for categories and custom fields
- Rate menu items (star ratings, optional text reviews, future photo uploads)
- Mark items as "tried"
- View personal history and lists of tried/rated items
- Admin dashboard for data cleanup (initially for you only)
- Responsive, mobile-first design (PWA)
- Cheap, scalable file storage for menu images and user avatars
- Testing: Storybook for UI, Vite for unit/integration
- Future support for notifications and native app expansion
