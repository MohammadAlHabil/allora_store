import bcrypt from "bcryptjs";
import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { UserRole } from "./features/auth";
import { getUserByEmail } from "./features/user/actions/user.actions";

type TokenWithRole = JWT & { id?: string; role?: UserRole | undefined };
type SessionWithUser = Session & {
  user: Session["user"] & { id?: string; role?: UserRole | undefined };
};
type AuthUser = {
  id?: string | number;
  name?: string | null;
  email?: string | null;
  role?: UserRole | undefined;
  password?: string;
};

export default {
  providers: [
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Partial<Record<"email" | "password", unknown>> | undefined) {
        const email = typeof credentials?.email === "string" ? credentials.email : undefined;
        const password =
          typeof credentials?.password === "string" ? credentials.password : undefined;
        if (!email || !password) return null;

        const user = await getUserByEmail(email);
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name ?? undefined,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: TokenWithRole; user?: AuthUser }): Promise<TokenWithRole> {
      if (!user) return token;
      token.id = String(user.id);
      token.role = user.role;
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: SessionWithUser;
      token: TokenWithRole;
    }): Promise<SessionWithUser> {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
