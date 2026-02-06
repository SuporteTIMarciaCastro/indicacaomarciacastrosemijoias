"use client"
import { useAuth } from "@/hooks/useAuth"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null)
  const fullUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!user) return

      try {
        console.log("🔍 Verificando email do usuário:", user.uid)
        // TEMPORÁRIO: Permitir acesso sem verificar Firestore
        // TODO: Reativar verificação quando regras do Firestore forem implantadas
        console.log("⚠️ Verificação de email desabilitada temporariamente")
        setEmailVerified(true)
      } catch (error) {
        console.error("❌ Erro ao verificar email:", error)
        // Por enquanto, permitir acesso mesmo com erro
        setEmailVerified(true)
      }
    }

    if (!loading && user) {
      checkEmailVerification()
    }
  }, [user, loading])

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(fullUrl)}`)
    } else if (!loading && user && emailVerified === false) {
      router.replace("/login?error=email-not-verified")
    }
  }, [user, loading, emailVerified, fullUrl, router])

  if (loading || !user || emailVerified === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-lg">Carregando autenticação...</div>
      </div>
    )
  }

  if (emailVerified === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Email não verificado</h2>
          <p className="text-gray-600 mb-4">Verifique seu email e clique no link enviado para acessar a plataforma.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 