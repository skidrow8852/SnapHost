"use client";

import { Zap } from "lucide-react";
import { DropdownMenuItem } from "./dropdown-menu";
import { toast } from "@/hooks/use-toast";

function Upgrade() {
  return (
    <DropdownMenuItem
      onClick={() => {
        toast({
          title: "Coming Soon!",
          description: "This feature will be available soon.",
        });
      }}
    >
      {" "}
      <div className="z-5 animate-pulse rounded-full bg-gradient-to-r from-[#F876C0] to-[#FED90C] p-0.5 shadow-lg">
        <Zap className="h-3 w-3" />
      </div>
      Upgrade
    </DropdownMenuItem>
  );
}

export default Upgrade;
