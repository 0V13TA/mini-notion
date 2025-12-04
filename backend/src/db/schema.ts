import { uuid, text, timestamp, pgTable } from "drizzle-orm/pg-core"

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(),
  email: text("email").notNull(),
  username: text("username").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  profile_picture: text("profile_picture").default("https://placehold.co/300x300"),
});
