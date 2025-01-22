"use client";

import Search from "@/components/search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import React from "react";

export default function DashboardPage() {
  const [selectedSort, setSelectedSort] = React.useState<string>("activity"); // Store the selected option

  return (
    <div className='max-w-8xl max-md:pl-4 max-md:pr-4 max-md:mt-0 mx-auto flex max-sm:grid max-sm:gap-y-4 items-center justify-between max-sm:mt-0 mt-2 max-sm:pl-4 max-sm:pr-4 md:pl-20 md:pr-20 lg:pl-20 lg:pr-20"'>
      <h1 className="text-4xl max-md:text-2xl font-normal font-wixMadefor text-[#2A2C33]">
        Your Projects
      </h1>
      <div className="flex gap-x-4 items-center">
        {/* Search Component */}
        <Search />
        {/* Filter Component */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-11 rounded-xl text-[#2A2C33] border border-[#D6DFE6] flex items-center justify-between px-4"
              variant="outline"
            >
              Sort by {selectedSort === "activity" ? "activity" : "name"}{" "}
              <ChevronDown color="#2A2C33" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40">
            <DropdownMenuCheckboxItem
              checked={selectedSort === "activity"}
              onCheckedChange={() => setSelectedSort("activity")} 
              className="cursor-pointer py-2"
            >
              Sort by activity
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={selectedSort === "name"}
              onCheckedChange={() => setSelectedSort("name")} 
              className="cursor-pointer py-2"
            >
              Sort by name
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

         {/* create project button Component */}
      </div>
    </div>
  );
}
