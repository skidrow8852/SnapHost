'use client' 

import { usePathname, useParams } from 'next/navigation'

function Page() {
  const pathname = usePathname() // Get the current URL path
  const {id} = useParams() // Get the search params
  
  // Extract id from the query parameter

  return (
    <div>
      <h1>Page ID: {id}</h1>
      <p>Current Path: {pathname}</p>
    </div>
  )
}

export default Page
