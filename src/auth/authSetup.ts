import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { serverClient } from "@/sanity/lib/serverClient";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,

    Credentials({
      name: "Credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        const user = await serverClient.fetch(
          `*[_type=="user" && email==$email][0]`,
          {
            email: credentials?.email,
          }
        );

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials!.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await serverClient.fetch(
          `*[_type == "user" && email == $email][0]`,
          {
            email: user.email,
          }
        );

        if (!existingUser) {
          await serverClient.create({
            _type: "user",
            name: user.name,
            email: user.email,
            image: user.image,
            provider: "google",
            createdAt: new Date().toISOString(),
          });
        }
      }

      return true;
    },

    authorized: async ({ auth }) => {
      return !!auth;
    },
  },

  pages: {
    signIn: "/login",
  },
});