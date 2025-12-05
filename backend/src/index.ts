import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { profiles } from './db/schema.ts';
import { verifySupabaseToken } from './verifySupabaseToken.ts';

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
    const { sub, email } = req.user; // 'sub' comes from the verified Supabase token
    const { username, avatar } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Save user to Postgres via Drizzle
    const newProfile = await db.insert(profiles).values({
      id: sub,
      email: email,
      username: username,
      profile_picture: avatar, // Can be null, schema handles default
    }).returning();

    res.status(200).json(newProfile[0]);
    console.log(newProfile);

  } catch (error) {
    console.error("Init profile error:", error);
    res.status(500).json({ message: "Failed to initialize profile" });
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
