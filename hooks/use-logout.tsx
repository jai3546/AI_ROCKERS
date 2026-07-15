"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { clearSession } from "@/lib/auth/session"

export function useLogout() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const requestLogout = useCallback(() => {
    setOpen(true)
  }, [])

  const confirmLogout = useCallback(() => {
    clearSession()
    setOpen(false)
    router.replace("/")
    router.refresh()
  }, [router])

  function LogoutConfirmDialog() {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out and returned to the home page. You can sign back in anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, stay signed in</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Yes, log out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return { requestLogout, LogoutConfirmDialog }
}
