"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Scan, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function ScanPage() {
  const [qrCode, setQrCode] = useState("")
  const [selectedStore, setSelectedStore] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useParams<{ id: string }>()
  const bloggerId = params?.id
  const router = useRouter()

  const handleValidate = async () => {
    if (!qrCode.trim()) {
      setError("Digite o código QR")
      return
    }

    if (!selectedStore) {
      setError("Selecione a loja")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/qrcode/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          qrCode: qrCode.trim(), 
          store: selectedStore,
          indicatorId: bloggerId 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirecionar para a tela de cadastro com o QR validado
        router.push(`/activate/${qrCode.trim()}?indicador=${bloggerId}&loja=${encodeURIComponent(selectedStore)}`)
      } else {
        setError(data.error || "Código QR inválido")
      }
    } catch (err) {
      setError("Erro ao validar código QR")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <Image src="/logo.png" alt="Marcia Castro Semijoias" width={120} height={120} className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Validação QR Code</h1>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <QrCode className="text-yellow-300" size={24} />
              <Scan className="text-yellow-300" size={24} />
            </div>
            <p className="text-white text-lg font-semibold">Selecione a loja e digite o código fornecido</p>
          </div>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-red-700">Validar Código QR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="store">Loja</Label>
                <select
                  id="store"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full border border-red-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Selecione a loja</option>
                  <option value="loja Shopping Teresina">Loja Teresina</option>
                  <option value="loja Shopping Rio Poty">Loja Rio Poty</option>
                  <option value="loja Shopping Cocais">Loja Cocais</option>
                  <option value="loja Shopping Parnaiba">Loja Parnaiba</option>
                  <option value="loja Shopping Rio Anil">Loja Rio Anil</option>
                </select>
              </div>

              <div>
                <Label htmlFor="qrCode">Código QR</Label>
                <Input
                  id="qrCode"
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Digite o código fornecido pelo atendente"
                  className="border-red-200 focus:border-red-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <Button
                onClick={handleValidate}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                {loading ? "Validando..." : "Validar Código"}
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Selecione a loja onde você está e solicite ao atendente da loja Marcia Castro Semijoias para fornecer o código QR válido.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}