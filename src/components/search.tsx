"use client";
import { type JSX, type SVGProps, useState, useEffect, useMemo } from "react";
import { Input } from "./ui/input";
import { useProjectStore } from "@/store/projects";

export default function Search() {
  const projects = useProjectStore((state) => state.projects);
  const setFilteredProjects = useProjectStore((state) => state.setFilteredProjects);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  };
 
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("search");

    if (query) {
      setSearchQuery(query);
    }
  }, []);

  const filteredProjects = useMemo(() => {
    if (!projects || projects.length === 0) {
      return [];
    }

    if (searchQuery === "") {
      return projects; 
    } else {
      return projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery)
      );
    }
  }, [projects, searchQuery]);

  useEffect(() => {
    setFilteredProjects(filteredProjects);
  }, [filteredProjects, setFilteredProjects]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (searchQuery) {
      urlParams.set("search", searchQuery);
    } else {
      urlParams.delete("search"); 
    }

     const newUrl = "?" + urlParams.toString();
     const cleanUrl = newUrl === "?" ? window.location.pathname : newUrl;
     window.history.pushState({}, "", cleanUrl);
  }, [searchQuery]);

  return (
    <div className="w-full max-w-md max-sm:max-w-lg relative">
      <SearchIcon className="w-4 h-4 absolute left-2.5 top-3 text-gray-500 dark:text-gray-400" />
      <Input
        onChange={handleSearch}
        value={searchQuery}
        type="search"
        placeholder="Search projects"
        className="pl-8 border border-[#D6DFE6] placeholder:text-[#B6BBBF] text-[#2A2C33] font-wixMadefor font-normal rounded-2xl h-11 w-80 max-sm:w-full max-md:w-full"
      />
    </div>
  );
}

function SearchIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#B6BBBF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
