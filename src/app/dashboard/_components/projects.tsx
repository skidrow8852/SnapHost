/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client"
import { DialogDeploy } from '@/components/deploy-form'
import PageSkeleton from '@/components/page-skeleton'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/store/projects'
import { usePersonStore } from '@/store/user'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import ProjectCard from './projectCard'

function Projects() {
const { token , id} = usePersonStore((state) => state)
const projects = useProjectStore((state) => state.projects)
const [isLoading, setIsLoading] = React.useState<boolean>(true);



const getUserProjects = async (userId: string, tokenValue: string) => {
  try {
    const response = await fetch(
      `${process.env.URL_BACKEND_ACCESS}/projects/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${tokenValue}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json(); 
    useProjectStore.getState().setProjects(data.result); 
    setIsLoading(false)
  } catch (e) {
    console.error("Failed to fetch user projects:", e);
    setIsLoading(false)
  }
};


React.useEffect(() => {
  if(token.length > 3){
    getUserProjects(id, token)
  }
},[token,id])

if(isLoading){
  return (
      <div className='flex justify-center items-center min-h-[70vh]'>
        <PageSkeleton />
      </div>
    );
}


  return (
    <div className='flex justify-center items-center min-h-[70vh]'>
      
      {projects.length > 0 ? <div className='text-center relative'>
        <ProjectCard />
      </div> : <div className='text-center relative'>
        <div className='relative'>
          <Image 
            src="/assets/project-bg.png" 
            alt="new project" 
            width={500} 
            height={500} 
            className=' relative' 
          />
         
        </div>
        <p className='text-xl text-black font-wixMadefor font-normal mt-4'>
          You didn’t deploy any projects yet
        </p>
        <p className='text-[#B1B4B7] font-normal pt-2 pb-8'>
          Create a new project using the Deploy button
        </p>
        <div className='w-full flex justify-center'>

            <DialogDeploy>
                <Button className="flex h-11 justify-center rounded-2xl bg-[#2A2C33]">
                  Deploy new project
                  <ArrowRight color="white"  />
                </Button>
              </DialogDeploy>
        </div>
      </div>}
    </div>
  )
}

export default Projects
