/* eslint-disable @next/next/no-img-element */
import { type ProjectCardTypes } from "@/lib/types";
import { extractRepoDetails, timeAgo } from "@/lib/utils";
import { CodeXml, GitBranch } from "lucide-react";
import React from "react";
import ProjectOptions from "./options";
import Link from "next/link";

function ProjectCard({ values }: { values: ProjectCardTypes }) {
  return (
    <div className="group relative">
      {/* Card container */}
      <div className="before:duration-400 relative h-[340px] overflow-hidden rounded-3xl border-[0.15rem] border-[#D6DFE6] bg-[#FFFFFF] transition-all duration-300 before:absolute before:inset-0 before:-z-10 before:rounded-3xl before:bg-gradient-to-bl before:from-[#FFFFFF] before:via-[#f9f9f9] before:to-[#FFFFFF] before:opacity-0 before:transition-opacity hover:before:opacity-100 group-hover:scale-105">

        <div className="space-y-4 pb-8 pl-8 pr-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <ProjectOptions values={values}>
              <div className="flex cursor-pointer items-center gap-1 pt-8">
                <div className="h-1.5 w-1.5 rounded-lg bg-[#D9D9D9]" />
                <div className="h-1.5 w-1.5 rounded-lg bg-[#D9D9D9]" />
                <div className="h-1.5 w-1.5 rounded-lg bg-[#D9D9D9]" />
              </div>
            </ProjectOptions>
            <Link href={`/dashboard/project/${values.projectId}`}>
              <div className="mt-2 flex items-center justify-center space-y-2 pt-16 text-center">
                {values?.image && values?.image?.length > 2 ? (
                  <div
                    className="ml-4 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundImage: values.image,
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
                    }}
                  />
                ) : (
                  <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3E4047]">
                    <CodeXml color="white" />
                  </div>
                )}
              </div>
            </Link>
            <Link href={`/dashboard/project/${values.projectId}`}>
              <div className="relative mt-4 flex h-12 w-12 items-center justify-center rounded-full">
                <img
                  src="assets/views.png"
                  width={80}
                  height={80}
                  alt="views"
                  className="absolute inset-0 h-full w-full rounded-full object-cover"
                />
                <span className="z-10 font-publicSans text-sm font-[600] text-[#3E4047]">
                  1M
                </span>
              </div>
            </Link>
          </div>

          {/* Title */}
          <div className="flex flex-col items-center justify-center">
            <div className="font-publicSans text-lg font-[600] text-[#3E4047]">
              <Link href={`/dashboard/project/${values.projectId}`}>
                {values.name && values.name.length > 30
                  ? `${values.name.slice(0, 30)}...`
                  : values.name}
              </Link>
            </div>
            <div className="font-publicSans text-sm font-[500] text-[#AEAEAE]">
              <a
                href={`https://${values.projectId}.snaphost.co`}
                target="_blank"
              >
                {values.projectId}.snaphost.co
              </a>
            </div>
          </div>

          {/* block info */}
          <div className="pl-2 pr-2">
            <Link href={`/dashboard/project/${values.projectId}`}>
              <div className="flex h-9 w-full items-center gap-x-3 rounded-xl border-[0.12rem] border-[#D6DFE6] bg-[#FFFFFF] pl-3">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z"
                    fill="#B6BBBF"
                  ></path>
                </svg>
                <p className="font-lg font-publicSans text-[11px] text-[#AEAEAE]">
                  {extractRepoDetails(values?.repoUrl, values.name) &&
                  extractRepoDetails(values?.repoUrl, values.name)?.length > 30
                    ? `${extractRepoDetails(values?.repoUrl, values.name)?.slice(0, 30)}...`
                    : extractRepoDetails(values?.repoUrl, values.name)}
                </p>
              </div>
            </Link>
            <div className="font-600 overflow-hidden text-ellipsis whitespace-nowrap pt-8 font-publicSans text-sm text-[#AEAEAE]">
              <Link href={`/dashboard/project/${values.projectId}`}>
                {values.commit}
              </Link>
            </div>
            <div className="font-600 flex items-center gap-x-2 overflow-hidden text-ellipsis whitespace-nowrap font-publicSans text-sm text-[#AEAEAE]">
              <p>{timeAgo(values.time)} on</p>
              <GitBranch
                className="h-4 w-4 scale-y-[-1] transform"
                color="#AEAEAE"
              />
              <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                {values.branch}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
