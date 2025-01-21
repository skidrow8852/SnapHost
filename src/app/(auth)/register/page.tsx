import { SignupForm } from '@/components/sigup-form'
import Logo from '@/components/ui/logo'
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';


async function page() {

    const session = await auth.api.getSession({
      headers: await headers()
    });
  
    if (session) {
      return redirect('/dashboard')
    }
  return (
   <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Logo />
        <SignupForm />
      </div>
    </div>
  )
}

export default page