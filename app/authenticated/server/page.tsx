import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import React from "react";

type Props = {};

const AuthenticatedServerPage: React.FC<Props> = async ({}) => {
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  return (
    <div>
      <h1>Authenticated server Page</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
};

export default AuthenticatedServerPage;
