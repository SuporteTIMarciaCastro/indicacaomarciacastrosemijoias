"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ExternalLink, Gift, Instagram, Sparkles, Users } from "lucide-react"
import Image from "next/image"

export default function RulesPage() {
  const [loading, setLoading] = useState(false)
  const [confirmingFollow, setConfirmingFollow] = useState(false)
  const [hasOpenedInstagram, setHasOpenedInstagram] = useState(false)
  const [isFollowingConfirmed, setIsFollowingConfirmed] = useState(false)
  const [followMessage, setFollowMessage] = useState<string | null>(null)
  const [followError, setFollowError] = useState<string | null>(null)
  const params = useParams<{ id: string }>()
  const bloggerId = params?.id
  const router = useRouter()
  const instagramProfileUrl = "https://www.instagram.com/marciacastrosemijoias/"

  useEffect(() => {
    if (!bloggerId) return
    const confirmedStorageKey = `ig_follow_confirmed_${bloggerId}`
    const openedStorageKey = `ig_follow_opened_${bloggerId}`
    const alreadyConfirmed = typeof window !== "undefined" ? localStorage.getItem(confirmedStorageKey) : null
    const alreadyOpened = typeof window !== "undefined" ? localStorage.getItem(openedStorageKey) : null

    if (alreadyOpened === "true") {
      setHasOpenedInstagram(true)
    }

    if (alreadyConfirmed === "true") {
      setIsFollowingConfirmed(true)
      setHasOpenedInstagram(true)
      setFollowMessage("Seguimento já confirmado neste dispositivo.")
    }
  }, [bloggerId])

  const handleOpenInstagram = () => {
    setFollowError(null)
    setFollowMessage("Abrimos o Instagram em uma nova aba. Siga o perfil e volte para confirmar.")
    if (bloggerId) {
      localStorage.setItem(`ig_follow_opened_${bloggerId}`, "true")
    }
    setHasOpenedInstagram(true)
    window.open(instagramProfileUrl, "_blank", "noopener,noreferrer")
  }

  const getOrCreateSessionId = () => {
    const storageKey = "indicado_follow_session_id"
    const existing = localStorage.getItem(storageKey)
    if (existing) return existing

    const generated = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    localStorage.setItem(storageKey, generated)
    return generated
  }

  const handleConfirmFollow = async () => {
    setFollowError(null)
    setFollowMessage(null)

    if (!bloggerId) {
      setFollowError("Não foi possível validar o seguidor. Link do indicador inválido.")
      return
    }

    setConfirmingFollow(true)
    try {
      const sessionId = getOrCreateSessionId()
      const response = await fetch("/api/indicado/instagram-follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloggerId,
          sessionId,
          instagramProfile: instagramProfileUrl,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setFollowError(data.error || "Não foi possível confirmar o seguimento agora. Tente novamente.")
        return
      }

      localStorage.setItem(`ig_follow_confirmed_${bloggerId}`, "true")
      setIsFollowingConfirmed(true)
      setFollowMessage(data.message || "Confirmação registrada com sucesso.")
    } catch (error) {
      setFollowError("Erro de conexão ao registrar confirmação. Tente novamente.")
    } finally {
      setConfirmingFollow(false)
    }
  }

  const handleContinue = () => {
    if (!isFollowingConfirmed) {
      setFollowError("Antes de continuar, confirme que está seguindo o Instagram da empresa.")
      return
    }

    setLoading(true)
    router.push(`/activate?indicador=${bloggerId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <Image src="/logo.png" alt="Marcia Castro Semijoias" width={120} height={120} className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Campanha de Indicação</h1>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="text-yellow-300" size={24} />
              <Sparkles className="text-yellow-300" size={24} />
            </div>
            <p className="text-white text-lg font-semibold">Ganhe Ganhe prêmios indicando amigos!</p>
          </div>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-red-700">Como Funciona a Campanha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Users className="text-red-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">1. Indicação</h3>
                  <p className="text-gray-600 text-sm">Você foi indicado por um amigo para participar da campanha indique e ganhe da Marcia Castro Semijoias.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Gift className="text-red-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">2. Cadastro</h3>
                  <p className="text-gray-600 text-sm">Preencha seus dados para ativar seu check bônus.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Gift className="text-red-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">3. Cupom</h3>
                  <p className="text-gray-600 text-sm">Ganhe R$ 50,00 de desconto em compras acima de R$ 150,00.</p>
                </div>
              </div>
            </div>

            <div className="bg-white/95 border border-red-100 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-red-800">Siga nosso Instagram para liberar o cadastro</p>
              <p className="text-xs text-gray-600">Para participar da campanha, siga o perfil oficial e confirme abaixo.</p>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={handleOpenInstagram}
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <Instagram size={16} className="mr-2" />
                  Seguir no Instagram
                  <ExternalLink size={14} className="ml-2" />
                </Button>

                {hasOpenedInstagram && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleConfirmFollow}
                    disabled={confirmingFollow || isFollowingConfirmed}
                    className="border-red-300 text-red-700"
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    {isFollowingConfirmed ? "Seguimento confirmado" : confirmingFollow ? "Confirmando..." : "Já estou seguindo"}
                  </Button>
                )}
              </div>

              {followMessage && <p className="text-xs text-green-700">{followMessage}</p>}
              {followError && <p className="text-xs text-red-700">{followError}</p>}
            </div>

            <Button
              onClick={handleContinue}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading || !isFollowingConfirmed}
            >
              {loading ? "Carregando..." : "Continuar para Cadastro"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}