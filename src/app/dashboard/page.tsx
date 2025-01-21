import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return redirect('/login')
  }
  const user = session?.user;


  return (
    <div className='mt-10 text-center'>
      
      <h1 className='text-2xl font-bold underline'>Welcome to the dashboard</h1>
      <ul>
        <li>Name: {user.name}</li>
        <li>Email: {user.email}</li>
        <li>Token : {session?.session?.token}</li>
      </ul>
      
    </div>
  );
}