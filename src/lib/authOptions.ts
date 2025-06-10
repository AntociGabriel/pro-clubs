import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongoose";
import { compare } from "bcryptjs";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set in environment variables');
}

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  console.warn('NEXTAUTH_URL not set, using default: http://localhost:3000');
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "development" ? "none" : "lax",
        path: "/",
        secure: process.env.NODE_ENV !== "development",
        domain: process.env.NODE_ENV === "development" ? undefined : ".fifafc.com"
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV !== "development",
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials?.email });
        if (!user) return null;
        if (user.password && credentials?.password) {
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) return null;
        }
        return user;
      },
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.sub && session.user) {
        session.user = {
          ...session.user,
          id: token.sub,
          email: token.email,
          name: token.name,
          image: token.image,
          platform: token.platform,
          country: token.country,
          eaId: token.eaId,
          positions: token.positions
        };
      }
      console.log('Session callback:', { session, token });
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.image = user.image ?? undefined;
        token.platform = user.platform ?? undefined;
        token.country = user.country ?? undefined;
        token.eaId = user.eaId ?? undefined;
        token.positions = user.positions ?? undefined;
      }
      console.log('JWT callback:', { token, user });
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
};