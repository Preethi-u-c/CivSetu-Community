import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { isPostgresConfigured } from "@/lib/db/postgres";
import { adminDb, SafeAdminUser, toSafeAdminUser } from "@/lib/db/admin";

export const ADMIN_COOKIE_NAME = "civsetu_admin_token";
export const ADMIN_SESSION_DAYS = 7;
const BCRYPT_ROUNDS = 10;

export const adminService = {
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
   * Authenticates an administrator using username or email and password.
   * On success, creates a session in PostgreSQL and sets the HTTP-only cookie.
   */
  async login(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; admin?: SafeAdminUser; error?: string }> {
    if (!isPostgresConfigured()) {
      return { success: false, error: "Database service is not configured." };
    }

    const cleanIdentifier = identifier.trim();
    const admin = await adminDb.findByUsernameOrEmail(cleanIdentifier);
    if (!admin) {
      return { success: false, error: "Invalid administrative credentials." };
    }

    if (!admin.isActive) {
      return { success: false, error: "Administrator account is deactivated. Contact municipal authorities." };
    }

    const isMatch = await this.verifyPassword(password, admin.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Invalid administrative credentials." };
    }

    const expiresAt = new Date(Date.now() + ADMIN_SESSION_DAYS * 24 * 60 * 60 * 1000);
    const sessionId = await adminDb.createSession(admin.id, expiresAt);

    // Set HTTP-Only Session Cookie
    const cookieStore = cookies();
    cookieStore.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return {
      success: true,
      admin: toSafeAdminUser(admin),
    };
  },

  /**
   * Reads the current admin session from HTTP-only cookie and resolves the admin profile.
   * Strictly separates admin authorization from citizen and authority authentication.
   */
  async getSessionAdmin(): Promise<SafeAdminUser | null> {
    if (!isPostgresConfigured()) return null;

    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await adminDb.getSession(token);
    if (!session) return null;

    const admin = await adminDb.findById(session.adminId);
    if (!admin || !admin.isActive) return null;

    return toSafeAdminUser(admin);
  },

  /**
   * Destroys the current admin session in PostgreSQL and clears the cookie.
   */
  async destroySession(): Promise<void> {
    if (isPostgresConfigured()) {
      const cookieStore = cookies();
      const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
      if (token) {
        await adminDb.deleteSession(token);
      }
    }

    const cookieStore = cookies();
    try {
      cookieStore.delete(ADMIN_COOKIE_NAME);
    } catch {
      // fallback
    }
    cookieStore.set({
      name: ADMIN_COOKIE_NAME,
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
