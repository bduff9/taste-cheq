# Database Schema

## Entity Relationship Diagram (ERD)

```
User ─────┬─────────────┐
         │             │
         │             │
         ▼             ▼
   Rating           TriedItem
         ▲             ▲
         │             │
         └─────┬───────┘
               │
               ▼
           MenuItem
               ▲
               │
               ▼
         Restaurant
```

## Table Definitions

### users
- id (PK)
- email (unique)
- password_hash
- name
- avatar_url
- home_city
- home_state
- is_admin (boolean)
- created (timestamp)
- created_by (FK → users.id, nullable)
- updated (timestamp, nullable)
- updated_by (FK → users.id, nullable)
- deleted (timestamp, nullable)
- deleted_by (FK → users.id, nullable)

### restaurants
- id (PK)
- name
- address
- google_place_id
- latitude
- longitude
- created (timestamp)
- created_by (FK → users.id, nullable)
- updated (timestamp, nullable)
- updated_by (FK → users.id, nullable)
- deleted (timestamp, nullable)
- deleted_by (FK → users.id, nullable)

### menu_items
- id (PK)
- restaurant_id (FK → restaurants.id)
- name
- description
- category (nullable)
- price (nullable, numeric/string)
- custom_fields (JSONB)
- image_url (nullable)
- created (timestamp)
- created_by (FK → users.id, nullable)
- updated (timestamp, nullable)
- updated_by (FK → users.id, nullable)
- deleted (timestamp, nullable)
- deleted_by (FK → users.id, nullable)

### ratings
- id (PK)
- user_id (FK → users.id)
- menu_item_id (FK → menu_items.id)
- stars (int, 1-5)
- text (nullable)
- image_url (nullable, for future photo uploads)
- created (timestamp)
- created_by (FK → users.id, nullable)
- updated (timestamp, nullable)
- updated_by (FK → users.id, nullable)
- deleted (timestamp, nullable)
- deleted_by (FK → users.id, nullable)

### tried_items
- id (PK)
- user_id (FK → users.id)
- menu_item_id (FK → menu_items.id)
- created (timestamp)
- created_by (FK → users.id, nullable)
- updated (timestamp, nullable)
- updated_by (FK → users.id, nullable)
- deleted (timestamp, nullable)
- deleted_by (FK → users.id, nullable)

## Migration Strategy
- Use Prisma for all schema migrations and DB evolution.
- Kysely for all runtime DB operations (queries, inserts, updates, deletes).
- All schema changes tracked in version control.
