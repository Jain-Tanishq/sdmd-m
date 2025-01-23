"use client"

import { useEffect, useState } from "react"
import { AuthPopup } from "@/components/auth-popup"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome to StudySphere</h1>
        <p className="mt-4 text-lg text-muted-foreground">Your collaborative learning space</p>
        {user ? (
          <div className="mt-4">
            <p>Logged in as: {user.email}</p>
            <Button onClick={handleSignOut} className="mt-2">
              Sign Out
            </Button>
          </div>
        ) : (
          <AuthPopup />
        )}
      </div>
    </div>
  )
}

