import { Button } from "./ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Bell, LogOut, Settings, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="border-b px-4">
      <div className="max-w-8xl mx-auto flex items-center justify-between py-10 sm:pl-2 sm:pr-2 md:pl-20 md:pr-20 lg:pl-20 lg:pr-20">
        <div className="flex items-center justify-center text-primary-foreground">
          <Image
            width={50}
            height={50}
            className="size-14"
            src="/assets/logo.png"
            alt="logo"
          />
        </div>

        <div className="flex items-center justify-between gap-x-5">
          <Button className="bg-pink relative h-10 w-10 rounded-xl border border-[#D6DFE6] text-xl font-bold text-[#B6BBBF] hover:bg-[rgba(182,187,191,0.1)]">
            ?
          </Button>

          <Button className="bg-pink relative h-10 w-10 rounded-xl border border-[#D6DFE6] hover:bg-[rgba(182,187,191,0.1)]">
            <Bell color="#B6BBBF" fill="#B6BBBF" />
            <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-[#F876C0] to-[#FED90C]"></span>
          </Button>

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
              <DropdownMenuItem>
                {" "}
                <Settings />
                Settings
              </DropdownMenuItem>
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
              <DropdownMenuItem>
                {" "}
                <div className="z-5 animate-pulse rounded-full bg-gradient-to-r from-[#F876C0] to-[#FED90C] p-0.5 shadow-lg">
                  <Zap className="h-3 w-3" />
                </div>
                Upgrade
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
