import { LoginForm } from "@/components/login-form";
import PageSkeleton from "@/components/page-skeleton";
import Logo from "@/components/ui/logo";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function page() {
  // Fetch session asynchronously
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect if a session exists
  if (session) {
    return redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Image
        src="/assets/bg-login.png"
        alt="Background"
        className="absolute inset-0 -z-10 h-full w-auto object-cover"
        width={1200}
        height={500}
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />
      <Suspense fallback={<PageSkeleton />}>
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Logo />
          <LoginForm />
        </div>
      </Suspense>
    </div>
  );
}

export default page;
