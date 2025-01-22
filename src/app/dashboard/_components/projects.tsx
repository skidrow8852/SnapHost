"use client"
import { DialogDeploy } from '@/components/deploy-form'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

function Projects() {
  return (
    <div className='flex justify-center items-center min-h-[70vh]'>
      <div className='text-center relative'>
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
      </div>
    </div>
  )
}

export default Projects
