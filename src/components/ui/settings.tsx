"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { DropdownMenuItem } from "./dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { Label } from "./label";
import { Input } from "./input";

interface SettingsUiProps {
  name: string;
  email : string;
  avatar?: string;
}

function SettingsUi({ name,email, avatar }: SettingsUiProps) {
  const [open, setOpen] = useState(false);

  // Open the dialog
  const handleDialogOpen = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setOpen(true);
  };

  // Close the dialog
  const handleDialogClose = () => setOpen(false);

  return (
    <div>
      {/* Settings button */}
      <DropdownMenuItem onClick={handleDialogOpen}>
        <Settings />
        Settings
      </DropdownMenuItem>

      {/* Dialog for settings */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Email
              </Label>
              <Input id="username" value={email} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDialogClose}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SettingsUi;
