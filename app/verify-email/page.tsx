"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Sparkles, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import { Suspense } from "react"

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error")
        setMessage("Token de verificação não encontrado.")
        return
      }

      try {
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage("Email verificado com sucesso! Você será redirecionado para o login.")
          setTimeout(() => {
            router.push("/login")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.error || "Erro ao verificar email.")
        }
      } catch (err) {
        setStatus("error")
        setMessage("Erro ao conectar com o servidor.")
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <Image src="/logo.png" alt="Marcia Castro Semijoias" width={120} height={120} className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verificação de Email</h1>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="text-yellow-300" size={24} />
              <Sparkles className="text-yellow-300" size={24} />
            </div>
            <p className="text-white text-lg font-semibold">Confirmando seu cadastro</p>
          </div>
        </div>

        <Card className="shadow-2xl border-0">
          <CardContent className="text-center p-6">
            {status === "loading" && (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
                <p className="text-gray-700">Verificando seu email...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center">
                <CheckCircle className="text-green-500 h-16 w-16 mb-4" />
                <p className="text-gray-700 mb-4">{message}</p>
                <Button onClick={() => router.push("/login")} className="bg-red-600 hover:bg-red-700 text-white">
                  Ir para Login
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center">
                <XCircle className="text-red-500 h-16 w-16 mb-4" />
                <p className="text-gray-700 mb-4">{message}</p>
                <Button onClick={() => router.push("/register")} className="bg-red-600 hover:bg-red-700 text-white">
                  Voltar ao Cadastro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}