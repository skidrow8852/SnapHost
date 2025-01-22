import React from 'react'
import { DropdownMenuItem } from './dropdown-menu';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { LogOut } from 'lucide-react';

function LogoutButton() {
  return (
    <DropdownMenuItem
                onClick={async () => {
                  "use server";
                  await auth.api.signOut({
                    headers: await headers(),
                  });
                  redirect("/login");
                }}
              >
                <LogOut />
                Logout
              </DropdownMenuItem>
  )
}

export default LogoutButton