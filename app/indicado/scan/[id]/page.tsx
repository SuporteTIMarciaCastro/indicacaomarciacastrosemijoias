"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function ScanPage() {
  const params = useParams<{ id: string }>()
  const bloggerId = params?.id
  const router = useRouter()

  useEffect(() => {
    if (!bloggerId) return
    router.replace(`/activate?indicador=${bloggerId}`)
  }, [bloggerId, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <p>Redirecionando para o cadastro...</p>
    </div>
  )
}