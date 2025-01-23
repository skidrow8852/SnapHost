/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useProjectStore } from "@/store/projects";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";

export default function SearchAndSort() {
  const projects = useProjectStore((state) => state.projects);
  const setFilteredProjects = useProjectStore(
    (state) => state.setFilteredProjects,
  );

  const [selectedSort, setSelectedSort] = useState<string>("activity");

  // Apply the filter query from URL when the component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterQuery = urlParams.get("filter");

    if (filterQuery === "name" || filterQuery === "activity") {
      setSelectedSort(filterQuery);
    }
  }, []);

  const filteredProjects = useMemo(() => {
    if (!projects || projects.length === 0) {
      return [];
    }

    if (selectedSort === "activity") {
      return projects;
    } else if (selectedSort === "name") {
      return [...projects].sort((a, b) => a.name.localeCompare(b.name));
    }

    return projects;
  }, [projects, selectedSort]);

  useEffect(() => {
    setFilteredProjects(filteredProjects);

    const urlParams = new URLSearchParams(window.location.search);

    if (window.location.search) {
      urlParams.set("filter", selectedSort);
      window.history.pushState({}, "", "?" + urlParams.toString());
    } else {
      if (selectedSort !== "activity") {
        urlParams.set("filter", selectedSort);
        window.history.pushState({}, "", "?" + urlParams.toString());
      }
    }
  }, [filteredProjects, selectedSort, setFilteredProjects]);

  return (
    <div className="relative w-full max-w-md max-sm:max-w-lg">
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
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedSort("activity");
              }
            }}
            className="cursor-pointer py-2"
          >
            Sort by activity
          </DropdownMenuCheckboxItem>

          <DropdownMenuCheckboxItem
            checked={selectedSort === "name"}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedSort("name");
              }
            }}
            className="cursor-pointer py-2"
          >
            Sort by name
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
