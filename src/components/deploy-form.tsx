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

export function DialogDeploy({ children }: { children: React.ReactNode }) {
  const [name, setName] = React.useState<string>("");
  const [url, setUrl] = React.useState<string>("");
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:rounded-2xl md:rounded-2xl lg:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center">
            <Image
              src="/assets/new-project.png"
              alt="New project"
              width={60}
              height={60}
            />
            <div className="mb-4 ml-4 text-left">
              <p className="mt-4 font-wixMadefor text-md font-semibold text-[#2A2C33]">
                Deploy new project
              </p>
              <DialogDescription color="#AEAEAE">
                Fill in the following fields to deploy a new project
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-y-6 py-4">
          <div className="grid gap-y-4">
            <Label htmlFor="name" className="text-left font-normal font-sans">
              Project name
            </Label>

            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 h-11 rounded-xl border border-[#D6DFE6]"
            />
          </div>
          <div className="grid gap-y-4">
            <Label htmlFor="url" className="text-left font-normal font-sans">
              Repo URL
            </Label>

            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="col-span-3 h-11 rounded-xl border border-[#D6DFE6]"
            />
          </div>
        </div>
        <DialogFooter className="pt-5">
          <DialogClose asChild>
            <Button variant="outline" className="h-11 rounded-2xl pl-8 pr-8">
              Cancel
            </Button>
          </DialogClose>
          <Button className="h-11 rounded-2xl bg-[#2A2C33] pl-5 pr-5">
            Deploy <ArrowRight color="white" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
