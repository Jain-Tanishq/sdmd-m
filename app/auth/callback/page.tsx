"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) throw error
      } catch (error) {
        console.error("Error during auth callback:", error)
      } finally {
        router.push("/")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Processing authentication...</h2>
        <p className="mt-2 text-muted-foreground">Please wait while we sign you in.</p>
      </div>
    </div>
  )
}

