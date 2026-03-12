import type { NextAuthOptions } from "next-auth";
import { getServerSession as _getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const { rows } = await sql`
          select id, email, full_name, password_hash, role
          from profiles
          where email = ${credentials.email}
          limit 1
        `;
        const row = rows[0] as { id: string; email: string; full_name: string; password_hash: string; role: string } | undefined;
        if (!row || !(await bcrypt.compare(credentials.password, row.password_hash))) return null;
        return {
          id: row.id,
          email: row.email,
          name: row.full_name,
          role: row.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getServerSession() {
  return _getServerSession(authOptions);
}
