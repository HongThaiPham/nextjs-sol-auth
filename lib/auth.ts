import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";

import { getServerSession } from "next-auth";

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";

import bs58 from "bs58";
import nacl from "tweetnacl";

// You'll need to import and pass this
// to `NextAuth` in `app/api/auth/[...nextauth]/route.ts`
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET as string,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "sol-auth",
      credentials: {
        signature: {
          label: "Signature",
          type: "text",
        },
        publicKey: {
          label: "Public Key",
          type: "text",
        },
      },
      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }
        const { signature, publicKey } = credentials;

        // if (req?.headers?.host !== process.env.NEXTAUTH_HOST) {
        //   return null;
        // }

        const csrfToken = await getCsrfToken({ req: { ...req, body: null } });

        if (!csrfToken) {
          return null;
        }

        const message = `By signing this message, you are logging into ${process.env.NEXT_PUBLIC_APP_NAME}\n${csrfToken}`;
        const nonce = new TextEncoder().encode(message);

        const isValid = verifySignature(signature, publicKey, nonce);

        if (!isValid) {
          throw new Error("Invalid signature");
        }

        return {
          id: publicKey,
        };
      },
    }),
  ],
  callbacks: {
    session({ session, user, token }) {
      if (session.user) {
        session.user.name = token.sub;
        session.user.image = `https://ui-avatars.com/api/?name=${token.sub}`;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile?.sub;
      }
      return token;
    },
  },
};

const verifySignature = (
  signature: string,
  publicKey: string,
  message: Uint8Array
) => {
  const signatureDecoded = bs58.decode(signature);
  const publicKeyDecoded = bs58.decode(publicKey);

  return nacl.sign.detached.verify(message, signatureDecoded, publicKeyDecoded);
};

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}
