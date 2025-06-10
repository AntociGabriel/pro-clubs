import NextAuth, { DefaultSession, User } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    platform?: string;
    country?: string;
    eaId?: string;
    positions?: string[];
  }

  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      platform?: string;
      country?: string;
      eaId?: string;
      positions?: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string;
    name?: string;
    image?: string;
    platform?: string;
    country?: string;
    eaId?: string;
    positions?: string[];
  }
}