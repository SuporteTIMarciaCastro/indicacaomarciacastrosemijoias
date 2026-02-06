"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Sparkles, Users, MapPin, QrCode } from "lucide-react"
import Image from "next/image"

export default function RulesPage() {
  const [loading, setLoading] = useState(false)
  const params = useParams<{ id: string }>()
  const bloggerId = params?.id
  const router = useRouter()

  const handleContinue = () => {
    setLoading(true)
    router.push(`/indicado/scan/${bloggerId}`)
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
                <MapPin className="text-red-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">2. Visita à Loja</h3>
                  <p className="text-gray-600 text-sm">Para validar sua participação, você deve visitar uma de nossas lojas físicas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <QrCode className="text-red-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">3. Validação QR Code</h3>
                  <p className="text-gray-600 text-sm">Na loja, solicite ao atendente para escanear o código QR disponível no sistema.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Gift className="text-red-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">4. Cadastro</h3>
                  <p className="text-gray-600 text-sm">Após a validação, complete seu cadastro.</p>
                </div>
              </div>

                <div className="flex items-start gap-3">
                <Gift className="text-red-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-900">5. Cupom</h3>
                  <p className="text-gray-600 text-sm">ganhe uma semijoia surpresa em compras acima de R$100,00.</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm font-medium">
                <strong>Importante:</strong> A validação física é necessária para garantir a autenticidade da indicação e prevenir fraudes.
              </p>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? "Carregando..." : "Continuar para Validação"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}