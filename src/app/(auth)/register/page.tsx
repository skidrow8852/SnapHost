import PageSkeleton from "@/components/page-skeleton";
import { SignupForm } from "@/components/sigup-form";
import Logo from "@/components/ui/logo";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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
          <SignupForm />
        </div>
      </Suspense>
    </div>
  );
}

export default page;
