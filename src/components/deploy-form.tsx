"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Image from "next/image";
import React from "react";
import { isValidGitHubUrl } from "@/lib/utils";
import Link from "next/link";

export function DialogDeploy({ children }: { children: React.ReactNode }) {
  const [name, setName] = React.useState<string>("");
  const [url, setUrl] = React.useState<string>("");
  const [validation, setValidation] = React.useState<
    Array<{ field: string; reason: string }>
  >([]);
  const [success, setSuccess] = React.useState<boolean>(false);
  const [projectId, setProjectId] = React.useState<string>("");

  const validateInputs = (): {
    isValid: boolean;
    errors: { field: string; reason: string }[];
  } => {
    const errors: { field: string; reason: string }[] = [];
    setValidation([]);
    // Check name
    if (typeof name !== "string") {
      errors.push({ field: "name", reason: "Name must be a string" });
    } else if (name.length <= 2) {
      errors.push({
        field: "name",
        reason: "Name must be longer than 2 characters",
      });
    }

    // Check URL
    if (!isValidGitHubUrl(url)) {
      errors.push({
        field: "url",
        reason: "URL must be a valid Git Repository",
      });
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Reset state when dialog closes
  const handleDialogClose = () => {
    setName("");
    setUrl("");
    setValidation([]);
    setSuccess(false);
    setProjectId("");
  };


  const Submit = async () => {
    const result = validateInputs();
    if (result.isValid) {
      console.log("valid");
      setSuccess(true);
      setProjectId("63456354jjjd");
    } else {
      setValidation(result.errors);
    }
  };

  return (
    <Dialog onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:rounded-2xl md:rounded-2xl lg:rounded-2xl">
        {success ? (
          <div className="flex w-full content-center items-center justify-center">
            <div className="text-center  w-full pt-10 pb-10" style={{
    backgroundImage: "url('/assets/success-bg.png')",
    backgroundPosition: "center center", 

    backgroundSize: "contain",
  }}>
              <div className="flex justify-center items-center pb-5">

              <Image
                src="/assets/success.png"
                alt="success"
                width={150}
                height={100}
              />
              </div>
              <p className="text-md mb-2 mt-4 font-wixMadefor font-semibold text-[#2A2C33]">
                Project created successfully!
              </p>
              <DialogDescription color="#AEAEAE">
                Your project is currently under deployment
              </DialogDescription>

              <Link href={`/dashboard/project/${projectId}`}>
                <Button className="mt-10 h-11 rounded-2xl bg-[#2A2C33] pl-8 pr-8">
                  Continue
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <DialogHeader>
              <div className="flex items-center">
                <Image
                  src="/assets/new-project.png"
                  alt="New project"
                  width={60}
                  height={60}
                />
                <div className="mb-4 ml-4 text-left">
                  <p className="text-md mt-4 font-wixMadefor font-semibold text-[#2A2C33]">
                    Deploy new project
                  </p>
                  <DialogDescription color="#AEAEAE">
                    Fill in the following fields to deploy a new project
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-y-6 py-4">
              <div className="grid">
                <Label
                  htmlFor="name"
                  className="pb-4 text-left font-sans font-normal"
                >
                  Project name
                </Label>

                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3 h-11 rounded-xl border border-[#D6DFE6]"
                />
                {validation.length > 0 &&
                  validation.some((error) => error.field == "name") && (
                    <span className="pt-1 text-sm text-red-500">
                      {
                        validation?.find((error) => error.field == "name")
                          ?.reason
                      }
                    </span>
                  )}
              </div>
              <div className="grid">
                <Label
                  htmlFor="url"
                  className="pb-4 text-left font-sans font-normal"
                >
                  Repository URL
                </Label>

                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="col-span-3 h-11 rounded-xl border border-[#D6DFE6]"
                />
                {validation.length > 0 &&
                  validation.some((error) => error.field == "url") && (
                    <span className="pt-1 text-sm text-red-500">
                      {
                        validation?.find((error) => error.field == "url")
                          ?.reason
                      }
                    </span>
                  )}
              </div>
            </div>
            <DialogFooter className="pt-8">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="h-11 rounded-2xl pl-8 pr-8"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={Submit}
                className="h-11 rounded-2xl bg-[#2A2C33] pl-5 pr-5"
              >
                Deploy <ArrowRight color="white" />
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
