import { createRemoteJWKSet, jwtVerify } from "jose";
import type Express from "express"

const jwkURL = process.env.ISSUER;
if (!jwkURL) {
  throw new Error("JWK_URL must be in the environment variable");
}

const jwks = createRemoteJWKSet(
  new URL(jwkURL)
);

export async function verifySupabaseToken(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).send("Missing auth");

  const token = auth.replace("Bearer ", "");

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: jwkURL!,
    });

    req.user = payload; // contains sub (user_id), email, etc.
    return next();
  } catch (err) {
    console.error(err);
    return res.status(401).send("Invalid token");
  }
}

