"use client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type ProjectCardTypes } from '@/lib/types';
import { ExternalLink, RotateCcw, Trash } from 'lucide-react';
import React from 'react'

function ProjectOptions({children, values} : {children : React.ReactNode, values : ProjectCardTypes}) {
  return (
    <DropdownMenu>
              <DropdownMenuTrigger className='cursor-pointer focus:outline-none'>
                {children}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                 
                    <a href={`https://${values.projectId}.snaphost.co`} target='_blank'>
                <DropdownMenuItem>

                   <ExternalLink />
                    Visit
                </DropdownMenuItem>
                    </a>
               
                <DropdownMenuItem
                >
                  <RotateCcw />
                  Redeploy
                </DropdownMenuItem>
                <DropdownMenuItem
                >
                  <Trash />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
  )
}

export default ProjectOptions