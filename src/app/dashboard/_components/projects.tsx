/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";
import { DialogDeploy } from "@/components/deploy-form";
import PageSkeleton from "@/components/page-skeleton";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/projects";
import { usePersonStore } from "@/store/user";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import React from "react";
import ProjectCard from "./projectCard";
import { getAllProjects } from "@/actions/project";

function Projects() {
  const { id } = usePersonStore((state) => state);
  const projects = useProjectStore((state) => state.filteredProjects);
  const allprojects = useProjectStore((state) => state.projects);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const getUserProjects = async (userId: string) => {
    try {
      const response = await getAllProjects(userId);
      if (response.length > 0) {
        useProjectStore.getState().setProjects(response);
      }
      setIsLoading(false);
    } catch (e) {
      console.error("Failed to fetch user projects:", e);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    getUserProjects(id);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      {projects?.length > 0 ? (
        <div className="min-h-[70vh] w-full bg-transparent">
          {/* Hero Section Skeleton */}
          <div className="max-w-8xl relative mx-auto py-12">
            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {projects?.map((data, i) => (
                <div key={i}>
                  <ProjectCard values={data} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative text-center">
          <div className="relative">
            <Image
              src="/assets/project-bg.png"
              alt="new project"
              width={500}
              height={500}
              className="relative"
            />
          </div>
          <p className="mt-4 font-wixMadefor text-xl font-normal text-black">
            {allprojects?.length > 0
              ? "No project found"
              : "You didn’t deploy any projects yet"}
          </p>
          <p className="pb-8 pt-2 font-normal text-[#B1B4B7]">
            Create a new project using the Deploy button
          </p>
          <div className="flex w-full justify-center">
            <DialogDeploy>
              <Button className="flex h-11 justify-center rounded-2xl bg-[#2A2C33]">
                Deploy new project
                <ArrowRight color="white" />
              </Button>
            </DialogDeploy>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
