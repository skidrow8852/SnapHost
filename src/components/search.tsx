import { type JSX, type SVGProps } from "react";
import { Input } from "./ui/input";

export default function Search() {
  return (
    <div className="w-full max-w-md max-sm:max-w-lg relative">
      <SearchIcon className="w-4 h-4 absolute left-2.5 top-3 text-gray-500 dark:text-gray-400" />
      <Input
        type="search"
        placeholder="Search projects"
        className="pl-8 border border-[#D6DFE6] rounded-xl text-[#B6BBBF] h-11 w-80 max-sm:w-full max-md:w-full"
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
