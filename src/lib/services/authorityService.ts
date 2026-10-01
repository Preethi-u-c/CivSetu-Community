import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { authorityDb, SafeAuthorityUser, toSafeAuthorityUser } from "@/lib/db/authority";

export const AUTHORITY_COOKIE_NAME = "civsetu_authority_token";
export const AUTHORITY_SESSION_DAYS = 7;
const BCRYPT_ROUNDS = 10;

export const authorityService = {
  /**
   * Hashes a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  },

  /**
   * Verifies a password against a stored bcrypt hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  /**
   * Authenticates an authority officer using email or Staff ID and password.
   * On success, creates a session in PostgreSQL and sets the HTTP-only cookie.
   */
  async login(identifier: string, password: string): Promise<{ success: boolean; authority?: SafeAuthorityUser; error?: string }> {
    if (!isPostgresConfigured()) {
      return { success: false, error: "Database service is not configured." };
    }

    const cleanIdentifier = identifier.trim();
    const officer = await authorityDb.findByEmail(cleanIdentifier);
    if (!officer) {
      return { success: false, error: "Invalid officer credentials or account inactive." };
    }

    if (!officer.isActive) {
      return { success: false, error: "Authority account is currently suspended. Please contact administrator." };
    }

    const isMatch = await this.verifyPassword(password, officer.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Invalid officer credentials." };
    }

    const expiresAt = new Date(Date.now() + AUTHORITY_SESSION_DAYS * 24 * 60 * 60 * 1000);
    const sessionId = await authorityDb.createSession(officer.id, expiresAt);

    // Set HTTP-Only Session Cookie (scoped to /; Lax SameSite; no maxAge so terminates with browser session)
    const cookieStore = cookies();
    cookieStore.set({
      name: AUTHORITY_COOKIE_NAME,
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return {
      success: true,
      authority: toSafeAuthorityUser(officer),
    };
  },

  /**
   * Reads the current authority session from HTTP-only cookie and resolves the officer profile.
   * Strictly separates authority authorization from citizen authentication.
   */
  async getSessionAuthority(): Promise<SafeAuthorityUser | null> {
    if (!isPostgresConfigured()) return null;

    const cookieStore = cookies();
    const token = cookieStore.get(AUTHORITY_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await authorityDb.getSession(token);
    if (!session) return null;

    const officer = await authorityDb.findById(session.authorityId);
    if (!officer || !officer.isActive) return null;

    return toSafeAuthorityUser(officer);
  },

  /**
   * Destroys the current authority session in PostgreSQL and clears the cookie.
   */
  async destroySession(): Promise<void> {
    if (isPostgresConfigured()) {
      const cookieStore = cookies();
      const token = cookieStore.get(AUTHORITY_COOKIE_NAME)?.value;
      if (token) {
        await authorityDb.deleteSession(token);
      }
    }

    const cookieStore = cookies();
    try {
      cookieStore.delete(AUTHORITY_COOKIE_NAME);
    } catch {
      // fallback
    }
    cookieStore.set({
      name: AUTHORITY_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  },
};
