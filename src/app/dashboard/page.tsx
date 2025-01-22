"use client";

import { DialogDeploy } from "@/components/deploy-form";
import Search from "@/components/search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";
import React from "react";
import Projects from "./_components/projects";

export default function DashboardPage() {
  const [selectedSort, setSelectedSort] = React.useState<string>("activity");

  return (
    <div className='max-w-8xl lg:pr-20" mx-auto mt-2 flex items-center justify-between max-md:mt-0 max-md:pl-4 max-md:pr-4 max-sm:mt-0 max-sm:pl-4 max-sm:pr-4 md:pl-20 md:pr-20 lg:pl-20'>
      <div className="w-full">
        <div className="flex items-center justify-between max-sm:grid max-sm:gap-y-4">
          <div className="flex items-center gap-x-4">
            <h1 className="font-wixMadefor text-4xl font-normal text-[#2A2C33] max-md:text-2xl max-sm:text-xl">
              Your Projects
            </h1>
            <div className="invisible max-sm:visible">
              <DialogDeploy>
                <Button className="flex h-11 w-11 justify-center rounded-2xl bg-[#2A2C33]">
                  <Plus color="white" fill="white" />
                </Button>
              </DialogDeploy>
            </div>
          </div>

          <div className="flex items-center gap-x-4 max-sm:w-full max-sm:justify-between">
            {/* Search Component */}
            <Search />
            {/* Filter Component */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="flex h-11 items-center justify-between rounded-2xl border border-[#D6DFE6] px-4 text-[#2A2C33]"
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
            <div className="flex max-sm:hidden ">
              <DialogDeploy>
                <Button className="flex h-11 w-11 justify-center rounded-2xl bg-[#2A2C33]">
                  <Plus color="white" fill="white" />
                </Button>
              </DialogDeploy>
            </div>
          </div>
        </div>
        {/* Projects Section */}
        <Projects />
      </div>
    </div>
  );
}
