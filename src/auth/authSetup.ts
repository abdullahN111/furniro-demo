import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { serverClient } from "@/sanity/lib/serverClient";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Google,

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const rawEmail = credentials?.email;
        const rawPassword = credentials?.password;

        if (
          typeof rawEmail !== "string" ||
          typeof rawPassword !== "string" ||
          !rawEmail.trim() ||
          !rawPassword
        ) {
          return null;
        }

        const normalizedEmail = rawEmail.trim().toLowerCase();

        const user = await serverClient.fetch(
          `*[_type == "user" && lower(email) == $email][0]`,
          {
            email: normalizedEmail,
          },
        );

        // Guard against missing user or Google-only account without passwordHash
        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(rawPassword, user.passwordHash);

        if (!isValid) return null;

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image || null,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const normalizedEmail = user.email.trim().toLowerCase();

        const existingUser = await serverClient.fetch(
          `*[_type == "user" && lower(email) == $email][0]`,
          {
            email: normalizedEmail,
          },
        );

        if (!existingUser) {
          await serverClient.create({
            _type: "user",
            name: user.name || normalizedEmail.split("@")[0],
            email: normalizedEmail,
            image: user.image,
            provider: "google",
            createdAt: new Date().toISOString(),
          });
        } else if (!existingUser.image && user.image) {
          // Keep Google avatar synced if user registered with credentials first
          await serverClient
            .patch(existingUser._id)
            .set({ image: user.image })
            .commit();
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (typeof token.name === "string") session.user.name = token.name;
        if (typeof token.email === "string") session.user.email = token.email;
        if (typeof token.picture === "string")
          session.user.image = token.picture;
      }
      return session;
    },

    authorized: async ({ auth }) => {
      return !!auth;
    },
  },

  pages: {
    signIn: "/login",
  },
});
