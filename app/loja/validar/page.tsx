"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, CheckCircle, XCircle, Search } from "lucide-react"
import Image from "next/image"

interface ValidatedIndicado {
  name: string
  email: string
  voucherCode: string
}

export default function ValidarIndicacaoPage() {
  const [qrCode, setQrCode] = useState("")
  const [indicadoId, setIndicadoId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    data?: ValidatedIndicado
  } | null>(null)

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/qrcode/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode: qrCode.trim(),
          indicadoId: indicadoId.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: "Indicação validada com sucesso!",
          data: {
            name: data.voucher.customerName,
            email: data.voucher.customerEmail || "",
            voucherCode: data.voucher.code
          }
        })
        // Limpar campos após sucesso
        setQrCode("")
        setIndicadoId("")
      } else {
        setResult({
          success: false,
          message: data.error || "Erro ao validar indicação"
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Erro de conexão. Tente novamente."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6" style={{ backgroundColor: "#fce7e1" }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-transparent">
              <Image src="/logo.png" alt="Logo" width={66} height={66} className="object-cover w-full h-full" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-900">Validação de Indicações</h1>
              <p className="opacity-90 text-black">Use esta ferramenta para validar indicações na loja</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode size={24} />
              Validar Indicação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleValidate} className="space-y-4">
              <div>
                <Label htmlFor="qrCode">Código do QR Code</Label>
                <Input
                  id="qrCode"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value.toUpperCase())}
                  placeholder="Digite o código do QR (ex: ABC12345)"
                  required
                  className="font-mono"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Código encontrado no QR code físico da loja
                </p>
              </div>

              <div>
                <Label htmlFor="indicadoId">ID do Indicado</Label>
                <Input
                  id="indicadoId"
                  value={indicadoId}
                  onChange={(e) => setIndicadoId(e.target.value)}
                  placeholder="Cole o ID fornecido pelo indicado"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  O indicado deve fornecer este ID (disponível em seu email de confirmação)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Validando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Validar Indicação
                  </>
                )}
              </Button>
            </form>

            {result && (
              <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <XCircle className="text-red-600" size={20} />
                  )}
                  <span className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? "Sucesso!" : "Erro"}
                  </span>
                </div>
                <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                  {result.message}
                </p>
                {result.success && result.data && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <h4 className="font-semibold text-gray-800 mb-2">Check bônus gerado:</h4>
                    <p className="text-lg font-mono font-bold text-red-600 mb-1">
                      {result.data.voucherCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      Para: {result.data.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Email: {result.data.email}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Como usar:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>O cliente indicado informa que foi indicado por alguém</li>
              <li>Peça o ID do indicado (enviado por email)</li>
              <li>Localize o QR code físico na loja</li>
              <li>Digite o código do QR e o ID do indicado</li>
              <li>Clique em "Validar Indicação"</li>
              <li>O sistema gera e envia o Check bônus por email</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}