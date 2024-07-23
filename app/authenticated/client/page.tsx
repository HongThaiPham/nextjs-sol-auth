"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};

const AuthenticatedClientPage: React.FC<Props> = ({}) => {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  if (session.status === "loading") {
    return "Loading or not authenticated...";
  }
  return (
    <div>
      <h1>Authenticated client Page</h1>
      <p>Protected content</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
};

export default AuthenticatedClientPage;
