import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";

const GULBRANDSEN_DOMAIN = "gulbrandsen.com";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "select_account",
          hd: GULBRANDSEN_DOMAIN,
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return false;

      const email = typeof profile?.email === "string" ? profile.email.toLowerCase() : "";
      const isVerified = (profile as { email_verified?: boolean } | undefined)?.email_verified === true;
      return isVerified && email.endsWith(`@${GULBRANDSEN_DOMAIN}`);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = typeof token.picture === "string" ? token.picture : null;
      }
      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}
