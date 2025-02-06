import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For testing, accept a fixed test account
        if (credentials?.email === "test@example.com" && credentials?.password === "password123") {
          return {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            image: "🌿"
          };
        }
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
}

export default NextAuth(authOptions) 