"use client"
import { Label } from './ui/label'
import { Input } from './ui/input'


interface SettingsUiProps {
  name: string;
  email : string;
  avatar?: string;
}

function SettingsForm({ name, email, avatar }: SettingsUiProps) {
  return (
    <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-center">
                  Name
                </Label>
                <Input id="name" value={name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-center">
                  Email
                </Label>
                <Input id="email" value={email} className="col-span-3" />
              </div>
            </div>
  )
}

export default SettingsForm