"use client";
import { deleteUserProject } from "@/actions/project";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { type ProjectCardTypes } from "@/lib/types";
import { useProjectStore } from "@/store/projects";
import { usePersonStore } from "@/store/user";
import { ExternalLink, RotateCcw, Trash } from "lucide-react";
import React, { useState } from "react";

function ProjectOptions({
  children,
  values,
}: {
  children: React.ReactNode;
  values: ProjectCardTypes;
}) {
  const { token } = usePersonStore((state) => state);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const [isDialogOpen, setDialogOpen] = useState(false); 

  const redeploy = async () => {
    try {
      if (!token) {
        throw new Error("Token is required for redeploy.");
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_BACKEND_ACCESS}/redeploy`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: values.userId,
            id: values.id,
          }),
        }
      );

      if (!response.ok || response.status !== 200) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      updateProject(values.projectId, { status: "redeploying" });
    } catch (error) {
      toast({
        title: "Error redeploying project",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error("Error redeploying project:", error);
    }
  };

  const handleDelete = async () => {
    try{
        if (!token) {
            throw new Error("Token is required for redeploy.");
        }
        const data = await deleteUserProject(values.userId, values.id,token)
        if(data){
            deleteProject(values.projectId);
            toast({
                title: "Project deleted successfully!",
                description: "Project no longer available",
            });
        }else{
            toast({
                title: "Error deleting project",
                description: "Please try again later.",
                variant: "destructive",
            });
        }
    }catch (error) {
      toast({
        title: "Error deleting project",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error("Error deleting project:", error);
    }finally{

        setDialogOpen(false); 
    }
    
  };

React.useEffect(() => {
    // Callback to handle DOM changes
    const handleDomChanges = (mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "style"
        ) {
          const pointerEvents = document.body.style.pointerEvents;
          console.log("Pointer Events changed:", pointerEvents);

          // Reset pointer-events if set to 'none'
          if (pointerEvents === "none") {
            document.body.style.pointerEvents = "";
            console.log("Pointer Events reset to default");
          }
        }
      }
    };

    // Create a MutationObserver instance
    const observer = new MutationObserver(handleDomChanges);

    // Start observing the body element for style attribute changes
    observer.observe(document.body, {
      attributes: true, // Watch for attribute changes
      attributeFilter: ["style"], // Only observe changes to 'style'
    });

    // Cleanup the observer when the component unmounts
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* DropdownMenu for options */}
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer focus:outline-none">
          {children}
        </DropdownMenuTrigger >
        <DropdownMenuContent>
          <a href={`https://${values.projectId}.snaphost.co`} target="_blank">
            <DropdownMenuItem>
              <ExternalLink />
              Visit
            </DropdownMenuItem>
          </a>

          <DropdownMenuItem onClick={redeploy}>
            <RotateCcw />
            Redeploy
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <Trash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* AlertDialog for delete confirmation */}
      <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ProjectOptions;
