import NextAuth, { DefaultSession } from "next-auth"

// You can also import the Role enum directly from Prisma if you prefer:
// import { Role } from "@prisma/client"

declare module "next-auth" {
  /**
   * Returned by `auth()`, `useSession()`, `getSession()`
   */
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "LECTURER" | "STUDENT"; // or type: Role
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    role: "ADMIN" | "LECTURER" | "STUDENT";
  }
}