import { Sidebar } from "@/components/sidebar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath="/groups" />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}



import './globals.css'