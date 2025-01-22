import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'


function NotificationDropdown({children} : {children: React.ReactNode}) {
  return (
    <div>
        <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[400px] overflow-auto rounded-2xl">
        <div className="grid gap-4 p-4">
          <h4 className="font-medium leading-none">Notifications</h4>
          <div className="mb-1 grid grid-cols-[25px_1fr] items-start pb-1 last:mb-0 last:pb-0">
            <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-gradient-to-tr from-[#F876C0] to-[#FED90C]" />
            <div className="grid gap-1">
              <p className="text-sm font-medium">New order received</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">5 min ago</p>
            </div>
          </div>
          <div className="mb-1 grid grid-cols-[25px_1fr] items-start pb-1 last:mb-0 last:pb-0">
            <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-gradient-to-tr from-[#F876C0] to-[#FED90C]" />
            <div className="grid gap-1">
              <p className="text-sm font-medium">Payment processed</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">10 min ago</p>
            </div>
          </div>
          <div className="mb-1 grid grid-cols-[25px_1fr] items-start pb-1 last:mb-0 last:pb-0">
            <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-gradient-to-tr from-[#F876C0] to-[#FED90C]" />
            <div className="grid gap-1">
              <p className="text-sm font-medium">Item shipped</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">1 hour ago</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl mt-2 bg-[#2A2C33] text-white hover:bg-[black] hover:text-white">
            Mark All as Read
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  )
}

export default NotificationDropdown