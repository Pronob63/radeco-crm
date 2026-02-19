import NextAuth, { type DefaultSession } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth-config";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roleId: string;
      roleName: string;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    roleId: string;
    roleName: string;
    permissions: string[];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    roleId: string;
    roleName: string;
    permissions: string[];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { role: true },
        });

        if (!user || !user.active) {
          return null;
        }

        const isPasswordValid = await verifyPassword(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Actualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          roleId: user.roleId,
          roleName: user.role.name,
          permissions: user.role.permissions as string[],
        };
      },
    }),
  ],
});
