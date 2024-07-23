"use client";
import React, { useCallback } from "react";
import { Button } from "./ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { getCsrfToken, signIn } from "next-auth/react";
import bs58 from "bs58";

type Props = {};

const LoginWalletButton: React.FC<Props> = ({}) => {
  const { publicKey, signMessage } = useWallet();

  const handleSignin = useCallback(async () => {
    if (!publicKey || !signMessage) {
      return;
    }

    const crsf = await getCsrfToken();
    console.log("crsf", crsf);
    const message = `By signing this message, you are logging into ${process.env.NEXT_PUBLIC_APP_NAME}\n${crsf}`;
    const nonce = new TextEncoder().encode(message);

    const signature = await signMessage(nonce);

    const serializedSignature = bs58.encode(signature);
    const response = await signIn("credentials", {
      signature: serializedSignature,
      publicKey: publicKey.toString(),
      redirect: false,
    });

    console.log("response", response);
  }, [publicKey, signMessage]);
  if (!publicKey) {
    return null;
  }
  return <Button onClick={handleSignin}>Login {publicKey.toString()}</Button>;
};

export default LoginWalletButton;
