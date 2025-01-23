"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Home,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  CheckSquare,
  Trophy,
  ChevronDown,
  LogOut,
  MessageCircle,
  Crown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentPath: string
}

export function Sidebar({ currentPath }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Groups", href: "/groups", icon: Users },
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "To-Do List", href: "/todo", icon: CheckSquare },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ]

  return (
    <div className={cn("flex h-screen w-64 flex-col border-r bg-background", isDarkMode && "dark")}>
      {/* Logo */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-semibold">StudySphere</span>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="mx-4 mb-6 rounded-lg bg-muted p-4">
        <h3 className="font-semibold">Coming soon:</h3>
        <p className="text-sm text-muted-foreground">You will be able to create and save multiple documents!</p>
        <p className="mt-2 text-xs text-muted-foreground">Currently, your work is saved in the browser.</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {navigation.map((item) => {
          const isActive = currentPath === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Profile */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2 hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-muted-foreground">user@example.com</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <MessageCircle className="mr-2 h-4 w-4" />
              Send Feedback
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

