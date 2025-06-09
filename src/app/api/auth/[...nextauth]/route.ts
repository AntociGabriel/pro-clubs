import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongoose";
import { compare } from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;
        if (user.password && credentials.password) {
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) return null;
        }
        return user;
      },
    }),
    // Можно добавить EmailProvider для magic link
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 