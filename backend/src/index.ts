import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql, and, eq, desc } from "drizzle-orm"; // Import sql
import pg from 'pg';
import { profiles, pages } from './db/schema.ts';
import { verifySupabaseToken } from './verifySupabaseToken.ts'; // Ensure extension matches your file

const app = express();
const port = 3000;

// Database Connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
});
export const db = drizzle(pool);

// Middleware
app.use(cors());
app.use(express.json());

// API Route
app.post("/api/init-profile", verifySupabaseToken, async (req: any, res) => {
  try {
    const { sub, email } = req.user;
    const { username, avatar } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Use a transaction to set the local session variables for RLS
    const [newProfile] = await db.transaction(async (tx) => {
      // 1. Set the config so Postgres thinks we are the authenticated user
      // This satisfies the "auth.uid() = id" or "role = authenticated" policies
      await tx.execute(sql`SELECT set_config('request.jwt.claim.sub', ${sub}, true);`);
      await tx.execute(sql`SELECT set_config('request.jwt.claim.role', 'authenticated', true);`)

      // 2. Perform the insert within the same transaction scope
      return await tx.insert(profiles).values({
        id: sub,
        email: email,
        username: username,
        profile_picture: avatar,
      }).returning();
    });

    console.log(newProfile);
    res.status(200).json(newProfile);

  } catch (error) {
    console.error("Init profile error:", error);
    res.status(500).json({ message: "Failed to initialize profile" });
  }
});

// Get all pages for the authenticated user
app.get("/api/pages", verifySupabaseToken, async (req: any, res) => {
  try {
    const { sub } = req.user; // 'sub' is the user ID from Supabase

    // Select * from pages where userId = current_user
    const userPages = await db.select()
      .from(pages)
      .where(eq(pages.userId, sub))
      .orderBy(desc(pages.createdAt)); // Put newest pages at the top

    res.json(userPages);
  } catch (e) {
    console.error("Error fetching pages:", e);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

// 3. GET Single Page (Load the editor)
app.get("/api/pages/:id", verifySupabaseToken, async (req: any, res) => {
  try {
    const { sub } = req.user;
    const { id } = req.params;

    // Security: Ensure the page belongs to the user requesting it!
    const pageData = await db.select()
      .from(pages)
      .where(and(eq(pages.id, id), eq(pages.userId, sub)))
      .limit(1);

    if (pageData.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.json(pageData[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to load page" });
  }
});

// Create a new page
app.post("/api/pages", verifySupabaseToken, async (req: any, res) => {
  try {
    const { sub } = req.user;

    // Create a new page with a default empty paragraph
    const [newPage] = await db.insert(pages).values({
      userId: sub,
      title: "Untitled",
      content: [{ id: crypto.randomUUID(), type: "paragraph", content: "" }],
    }).returning();

    res.json(newPage);
  } catch (e) {
    console.error(e); // Check your terminal for this error if it fails again
    res.status(500).json({ error: "Failed to create page" });
  }
});

// 4. UPDATE Page (Save title, icon, or content)
app.put("/api/pages/:id", verifySupabaseToken, async (req: any, res) => {
  try {
    const { sub } = req.user;
    const { id } = req.params;
    // Add isFavorite to destructured body
    const { title, content, icon, isFavorite } = req.body;

    const [updatedPage] = await db.update(pages)
      .set({
        title,
        content,
        icon,
        isFavorite // Pass this to the DB
      })
      .where(and(eq(pages.id, id), eq(pages.userId, sub)))
      .returning();

    res.json(updatedPage);
  } catch (e) {
    res.status(500).json({ error: "Failed to save page" });
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
