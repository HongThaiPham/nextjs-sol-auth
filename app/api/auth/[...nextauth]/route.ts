import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";

import bs58 from "bs58";
import nacl from "tweetnacl";

const handler = NextAuth({
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

        if (req?.headers?.host !== process.env.AUTH_HOST) {
          return null;
        }

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
    session(params) {
      return params.session;
    },
  },
});

const verifySignature = (
  signature: string,
  publicKey: string,
  message: Uint8Array
) => {
  const signatureDecoded = bs58.decode(signature);
  const publicKeyDecoded = bs58.decode(publicKey);

  return nacl.sign.detached.verify(message, signatureDecoded, publicKeyDecoded);
};

export { handler as GET, handler as POST };
