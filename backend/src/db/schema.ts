import { uuid, text, timestamp, pgTable, jsonb, boolean } from "drizzle-orm/pg-core"

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(),
  email: text("email").notNull(),
  username: text("username").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  profile_picture: text("profile_picture").default("https://placehold.co/300x300"),
});

export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  title: text("title").default("Untitled Page").notNull(),
  icon: text("icon"),
  content: jsonb("content").default([]).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})
