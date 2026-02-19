import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roleId = user.roleId;
        token.roleName = user.roleName;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const tokenData = token as {
          id?: string;
          roleId?: string;
          roleName?: string;
          permissions?: string[];
        };
        if (tokenData.id) session.user.id = tokenData.id;
        if (tokenData.roleId) session.user.roleId = tokenData.roleId;
        if (tokenData.roleName) session.user.roleName = tokenData.roleName;
        session.user.permissions = tokenData.permissions ?? [];
      }
      return session;
    },
  },
};
