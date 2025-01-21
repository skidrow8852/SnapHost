import { LoginForm } from '@/components/login-form'
import Logo from '@/components/ui/logo'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Image from 'next/image';
import { redirect } from 'next/navigation';


async function page() {

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session) {
    return redirect('/dashboard')
  }
  return (
   <div className="flex min-h-svh flex-col items-center justify-center gap-6  p-6 md:p-10">

          <Image
          src="/assets/bg-login.png"
          alt="Background"
          className="absolute inset-0 -z-10 w-auto h-full object-cover"
          width={1200}
          height={500}
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Logo />
        <LoginForm />
      </div>
    </div>
  )
}

export default page