import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import User from "@/models/User";
import { dbConnect } from "@/lib/mongoose";
import { compare } from "bcryptjs";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set');
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production"
          ? ".yourdomain.com"
          : "localhost"
      },
    },
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log('Auth attempt with credentials:', credentials);
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email и пароль обязательны');
          }
          
          await dbConnect();
          console.log('Looking for user:', credentials.email);
          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            throw new Error('Пользователь не найден');
          }
          
          if (!user.password) {
            throw new Error('Учетная запись не поддерживает вход по паролю');
          }
          
          console.log('Comparing passwords');
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Неверный пароль');
          }
          
          console.log('Authentication successful for user:', user.email);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            platform: user.platform,
            country: user.country,
            eaId: user.eaId,
            positions: user.positions
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      },
    }),
    // Можно добавить EmailProvider для magic link
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    error: '/login/error',
    verifyRequest: '/login/verify-request',
  },
  callbacks: {
    async session({ session, token }) {
      console.log('Session callback start:', { token });
      if (token && session.user) {
        session.user = {
          ...session.user,
          id: token.sub || '',
          email: token.email || '',
          name: token.name || '',
          image: token.image || '',
          platform: token.platform || '',
          country: token.country || '',
          eaId: token.eaId || '',
          positions: token.positions || []
        };
      }
      console.log('Session callback result:', { session });
      return session;
    },
    async jwt({ token, user }) {
      console.log('JWT callback:', { token, user });
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.platform = user.platform;
        token.country = user.country;
        token.eaId = user.eaId;
        token.positions = user.positions;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST }; 