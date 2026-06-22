import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { saveUserToken } from './user-token';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          // `read:user` is required to identify the user.
          // `repo` is required for private contributions/repos.
          // `read:org` is useful if we ever add org-level stats.
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
    async signIn({ account, profile }) {
      const githubProfile = profile as { login?: string } | undefined;
      if (account?.access_token && githubProfile?.login) {
        try {
          await saveUserToken(githubProfile.login, account.access_token as string);
        } catch (error) {
          console.error('Failed to save user token on sign-in:', error);
          // Still allow sign-in; the user can reconnect later.
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/docs',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
