"use client"
import Image from "next/image"
import Link from "next/link"

function Logo() {
  return (
     <Link href="/" className="flex items-center gap-2 self-center font-medium text-xl">
              <div className="flex items-center justify-center text-primary-foreground">
                <Image width={40} height={40} className="size-10" src="/logo.png" alt="logo" />
              </div>
              SnapHost
     </Link>
  )
}

export default Logo