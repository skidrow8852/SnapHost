import { type Metadata } from "next";
import Navbar from "./_components/navbar";
import Image from "next/image";


export const metadata: Metadata = {
  title: 'SnapHost - Dashboard', 
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (

      
      <div>
        <Image
        src="/assets/bg-dashboard.png"
        alt="Background"
        className="absolute inset-0 -z-10 w-auto"
        width={1200}
        height={500}
        style={{
          objectPosition: "center top", 
          objectFit: "cover", 
          transform: "translate(-20%, -35%)"
        }}
      />
        <Navbar />
        <div>{children}</div>
      </div>

  );
}
