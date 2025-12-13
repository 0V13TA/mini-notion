import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from "drizzle-orm"; // Import sql
import pg from 'pg';
import { profiles } from './db/schema.ts';
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

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
