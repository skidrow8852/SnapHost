import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      Hello from Home Page
      
      <Link href="/login">Signin</Link>
      <Link href="/register">Signup</Link>
    </main>
  );
}
