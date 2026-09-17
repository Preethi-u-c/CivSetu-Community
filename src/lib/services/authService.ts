import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { citizenDb, sessionDb, CitizenRecord, isPostgresConfigured } from "@/lib/db/postgres";

export const SESSION_COOKIE_NAME = "civsetu_citizen_token";
export const SESSION_DURATION_DAYS = 7;
const BCRYPT_ROUNDS = 10;

export interface SafeCitizen {
  id: string;
  fullName: string;
  mobileNumber: string;
  mobileVerified: boolean;
  email: string;
  wardNumber: string;
  residentialAddress: string;
  createdAt: string;
  updatedAt: string;
}

export function toSafeCitizen(citizen: CitizenRecord): SafeCitizen {
  return {
    id: citizen.id,
    fullName: citizen.fullName,
    mobileNumber: citizen.mobileNumber,
    mobileVerified: citizen.mobileVerified,
    email: citizen.email,
    wardNumber: citizen.wardNumber,
    residentialAddress: citizen.residentialAddress,
    createdAt: citizen.createdAt,
    updatedAt: citizen.updatedAt,
  };
}

export const authService = {
  /**
   * Hashes a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  },

  /**
   * Verifies a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  /**
   * Creates an authenticated session in PostgreSQL and sets the HTTP-only cookie.
   */
  async createSession(citizenId: string): Promise<string> {
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
    const sessionId = await sessionDb.createSession(citizenId, expiresAt);

    // Set HTTP-Only Cookie
    const cookieStore = cookies();
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    });

    return sessionId;
  },

  /**
   * Reads the current session from HTTP-only cookie and resolves the citizen profile.
   */
  async getSessionCitizen(): Promise<SafeCitizen | null> {
    if (!isPostgresConfigured()) return null;

    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await sessionDb.getSession(token);
    if (!session) return null;

    const citizen = await citizenDb.findById(session.citizenId);
    if (!citizen) return null;

    return toSafeCitizen(citizen);
  },

  /**
   * Destroys the current session and clears the cookie.
   */
  async destroySession(): Promise<void> {
    if (isPostgresConfigured()) {
      const cookieStore = cookies();
      const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      if (token) {
        await sessionDb.deleteSession(token);
      }
    }

    const cookieStore = cookies();
    try {
      cookieStore.delete(SESSION_COOKIE_NAME);
    } catch {
      // fallback
    }
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  },

  /**
   * Revokes all active sessions for a citizen (e.g. after password reset).
   */
  async revokeAllSessions(citizenId: string): Promise<void> {
    if (isPostgresConfigured()) {
      await sessionDb.deleteCitizenSessions(citizenId);
    }
  },
};
