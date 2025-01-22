import { Button } from "./ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Bell, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import Upgrade from "./ui/upgrade";
import Link from "next/link";
import NotificationDropdown from "./notification";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import SettingsForm from "./settings-form";

export default async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  return (
    <div >
      <div className="max-w-8xl max-md:pl-4 max-md:pr-4 mx-auto flex items-center justify-between py-10 max-sm:pl-4 max-sm:pr-4 md:pl-20 md:pr-20 lg:pl-20 lg:pr-20">
        <div className="flex items-center justify-center text-primary-foreground">
          <Link href="/dashboard/">
          <Image
            width={50}
            height={50}
            className="size-14"
            src="/assets/logo.png"
            alt="logo"
          />
          </Link>
        </div>

        <div className="flex items-center justify-between gap-x-5">
          <Link href="/dashboard/support">
            <Button className="bg-pink relative h-10 w-10 rounded-xl border border-[#D6DFE6] text-xl font-bold text-[#B6BBBF] hover:bg-[rgba(182,187,191,0.1)]">
              ?
            </Button>
          </Link>

          <NotificationDropdown>
            <Button className="bg-pink relative h-10 w-10 rounded-xl border border-[#D6DFE6] hover:bg-[rgba(182,187,191,0.1)]">
              <Bell color="#B6BBBF" fill="#B6BBBF" />
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-[#F876C0] to-[#FED90C]"></span>
            </Button>
          </NotificationDropdown>

          <Dialog >
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src={session?.user?.image ?? ""} />
                  <AvatarFallback>
                    {session?.user?.name?.slice(0, 2) ?? ""}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                  <DialogTrigger>
                <DropdownMenuItem>
                    <Settings />
                    Settings
                </DropdownMenuItem>
                  </DialogTrigger>
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
                <DropdownMenuSeparator />
                <Upgrade />
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent className="lg:rounded-2xl sm:max-w-md sm:rounded-2xl md:rounded-2xl">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                 Make changes to your profile here. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <SettingsForm name={session.user.name ?? ""} email={session.user.email ?? ""} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="rounded-2xl h-11">Cancel</Button>
                </DialogClose>
                <Button className="rounded-2xl bg-[#2A2C33] h-11 pl-5 pr-5">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
