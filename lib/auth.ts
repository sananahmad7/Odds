// lib/auth.ts
import jwt, { SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev";
const COOKIE = process.env.ADMIN_COOKIE_NAME || "admin_session";

export type AdminJWT = {
  sub: string; // admin id
  email: string;
  role: string;
  name?: string;
  iat?: number;
  exp?: number;
};

export function getAdminCookieName() {
  return COOKIE;
}

/** Create a classic 3-part JWT (header.payload.signature) with HS256 */
export function signAdminJWT(
  payload: Omit<AdminJWT, "iat" | "exp">,
  expiresIn: SignOptions["expiresIn"] = "7d" // <- matches jsonwebtoken's type
) {
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn,                 // <- now correctly typed
    audience: "admin",
    issuer: "dgensports",
  };
  return jwt.sign(payload, SECRET, options);
}

/** Verify & decode a JWT; throws if invalid/expired */
export function verifyAdminJWT(token: string): AdminJWT {
  const decoded = jwt.verify(token, SECRET, {
    algorithms: ["HS256"],
    audience: "admin",
    issuer: "dgensports",
  });
  return decoded as AdminJWT;
}
