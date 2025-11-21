// import { type DefaultSession } from "next-auth";
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       role?: string;
//     } & DefaultSession["user"];
//   }
//   interface JWT {
//     id: string;
//     role?: 'admin' | 'user';
//   }
// }

import { DefaultSession, DefaultUser } from "next-auth";
import { UserRole } from "@/features/auth/types";

interface ExtendedUser extends DefaultUser {
  id: string;
  role?: UserRole;
  name?: string | null;
  email?: string | null;
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: ExtendedUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: UserRole;
  }
}
