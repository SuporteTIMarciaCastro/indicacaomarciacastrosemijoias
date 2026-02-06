"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import RequireAuth from "@/components/RequireAuth"

interface QRCode {
  id: string
  code: string | null
  store: string
  isActive: boolean
  createdAt: Date | null
}

function QRCodesContent() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerateQR, setShowGenerateQR] = useState(false)

  useEffect(() => {
    fetchQRCodes()
  }, [])

  const fetchQRCodes = async () => {
    try {
      const response = await fetch("/api/admin/qrcodes")
      if (response.ok) {
        const data = await response.json()
        setQrCodes(data.qrCodes || [])
      }
    } catch (error) {
      console.error("Erro ao buscar QR codes:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando QR Codes...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6" style={{ backgroundColor: "#fce7e1" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-transparent">
                <Image src="/logo.png" alt="Logo" width={66} height={66} className="object-cover w-full h-full" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-900">Gerenciamento de QR Codes</h1>
                <p className="opacity-90 text-black">Controle os códigos QR de validação por loja</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Codes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Loja</th>
                      <th className="text-left p-3">Código QR</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Última Atualização</th>
                      <th className="text-left p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrCodes.map((qr) => (
                      <tr key={qr.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{qr.store}</td>
                        <td className="p-3">
                          {qr.code ? (
                            <span className="font-mono text-lg font-bold text-red-600">
                              {qr.code}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Não gerado</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant={qr.isActive ? "default" : "secondary"}>
                            {qr.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {qr.createdAt ? new Date(qr.createdAt).toLocaleString('pt-BR') : '-'}
                        </td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            onClick={() => setShowGenerateQR(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {qr.code ? 'Regenerar' : 'Gerar'} QR
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showGenerateQR && (
        <GenerateQRModal onClose={() => setShowGenerateQR(false)} onGenerated={fetchQRCodes} />
      )}
    </RequireAuth>
  )
}

// Componente para gerar QR-code
function GenerateQRModal({ onClose, onGenerated }: { onClose: () => void, onGenerated: () => void }) {
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedStore, setSelectedStore] = useState("")

  const handleGenerate = async () => {
    if (!selectedStore) {
      setError("Selecione uma loja")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/qrcodes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store: selectedStore })
      })
      const data = await response.json()
      if (response.ok) {
        setGeneratedCode(data.qrCode.code)
        onGenerated() // Recarregar lista
      } else {
        setError(data.error || 'Erro ao gerar QR-code')
      }
    } catch (err) {
      setError('Erro ao gerar QR-code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold mb-4 text-red-700">Gerar QR-code</h2>

        {!generatedCode ? (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Selecione a loja e clique em "Gerar" para criar um novo código QR único de 6 dígitos.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loja
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Selecione uma loja</option>
                <option value="loja Shopping Teresina">Loja Teresina</option>
                <option value="loja Shopping Rio Poty">Loja Rio Poty</option>
                <option value="loja Shopping Cocais">Loja Cocais</option>
                <option value="loja Shopping Parnaiba">Loja Parnaiba</option>
                <option value="loja Shopping Rio Anil">Loja Rio Anil</option>
              </select>
            </div>

            {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

            <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                disabled={loading || !selectedStore}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
              >
                {loading ? 'Gerando...' : 'Gerar QR-code'}
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">
              QR-code gerado com sucesso! Forneça este código ao indicado:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-red-700 mb-2">
                  {generatedCode}
                </div>
                <p className="text-sm text-gray-500">Código QR válido para {selectedStore.replace('loja Shopping ', '')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode!)
                  alert('Código copiado!')
                }}
                variant="outline"
                className="flex-1"
              >
                Copiar Código
              </Button>
              <Button
                onClick={() => {
                  setGeneratedCode(null)
                  setError(null)
                  setSelectedStore("")
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
              >
                Gerar Outro
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Fechar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function QRCodesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <QRCodesContent />
    </Suspense>
  )
}