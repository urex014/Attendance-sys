// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnOnboarding = nextUrl.pathname.startsWith('/onboarding/student') || nextUrl.pathname.startsWith('/onboarding/lecturer');

      if (isOnDashboard || isOnOnboarding) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login
      }
      return true;
    },
  },
  providers: [], // We leave this empty here and fill it in auth.ts
} satisfies NextAuthConfig;