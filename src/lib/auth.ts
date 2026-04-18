import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "./userStore";

export const authOptions: NextAuthOptions = {
  providers: [
    // Only credentials provider (email/password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Special Admin Check
        const ADMIN_EMAIL = "subeerkr2003@gmail.com";
        const ADMIN_PASSWORD = "test@123";

        if (credentials.email.toLowerCase() === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
          return { id: "admin-1", email: ADMIN_EMAIL, name: "Admin Subeer", role: "admin" };
        }

        try {
          // Find user by email using file-based store
          const user = await findUserByEmail(credentials.email.toLowerCase());

          if (!user) return null;

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password || "");
          if (!isPasswordValid) return null;

          return { id: user.id, email: user.email, name: user.name, role: "user" };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};
