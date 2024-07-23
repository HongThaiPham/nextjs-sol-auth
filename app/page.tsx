import ConnectWalletButton from "@/components/ConnectWalletButton";
import LoginWalletButton from "@/components/LoginWalletButton";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center gap-5">
      <ConnectWalletButton />
      <LoginWalletButton />
    </main>
  );
}
