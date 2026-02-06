"use client"

import RequireAuth from "@/components/RequireAuth"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Gift, TrendingUp, Eye, Trash2 } from "lucide-react"
import Image from "next/image"
import { Suspense } from "react"

interface VoucherData {
  id: string
  code: string
  bloggerId: string
  bloggerName: string
  isUsed: boolean
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  lojaUsada?: string
}

const LOJAS = [
  "loja Shopping Teresina",
  "loja Shopping Rio Poty",
  "loja Shopping Rio Anil",
  "loja Shopping Parnaiba",
  "loja Shopping Cocais",
]

// Remover função updateVoucherAsUsed e qualquer uso de db, collection, getDocs, deleteDoc, doc, updateDoc

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <AdminContent />
    </Suspense>
  )
}

function AdminContent() {
  const [vouchers, setVouchers] = useState<VoucherData[]>([])
  const [stats, setStats] = useState({
    total: 0,
    used: 0,
    active: 0,
    expired: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showGenerateQR, setShowGenerateQR] = useState(false)

  useEffect(() => {
    fetchVouchers()
  }, [])

  const fetchVouchers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/vouchers')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao buscar vouchers")
      const vouchersList = data.vouchers || []
      setVouchers(vouchersList)
      setStats({
        total: vouchersList.length,
        used: vouchersList.filter((v: any) => v.isUsed).length,
        active: vouchersList.filter((v: any) => !v.isUsed).length,
        expired: 0,
      })
    } catch (error) {
      console.error("Erro ao buscar vouchers:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteVoucher = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este voucher?")) {
      try {
        // Aqui você pode criar uma rota de API para deletar, se quiser
        await fetch(`/api/admin/voucher/${id}`, { method: 'DELETE' })
        fetchVouchers()
      } catch (error) {
        console.error("Erro ao excluir voucher:", error)
      }
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <div className=" text-white p-6" style={{ backgroundColor: "#fce7e1" }}>
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 bg-trasparent overflow-hidden">
              <Image src="/logo.png" alt="Logo" width={66} height={66} className="object-cover w-full h-full" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-900">Painel Administrativo</h1>
              <p className="opacity-90 text-black">Marcia Castro Semijoias - Gestão de Vouchers</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Vouchers</CardTitle>
                <Gift className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vouchers Utilizados</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{stats.used}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vouchers disponíveis</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{stats.active}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vouchers Expirados</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-700">{stats.expired}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gerar QR-code</CardTitle>
                <Eye className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowGenerateQR(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Gerar QR-code
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Vouchers */}
          <Card>
            <CardHeader>
              <CardTitle>Todos os Vouchers</CardTitle>
              <CardDescription>Gerencie todos os vouchers criados na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Pesquisar por código, indicador ou nome..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="border rounded px-3 py-2 w-full max-w-xs"
                />
              </div>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Carregando vouchers...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Código</th>
                        <th className="text-left p-2">Indicador</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Loja</th>
                        <th className="text-left p-2">Cliente</th>
                        <th className="text-left p-2">Contato</th>
                        <th className="text-left p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vouchers
                        .filter(voucher =>
                          voucher.code.toLowerCase().includes(search.toLowerCase()) ||
                          voucher.bloggerId.toLowerCase().includes(search.toLowerCase()) ||
                          voucher.bloggerName.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((voucher) => (
                          <tr key={voucher.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-mono text-sm">{voucher.code}</td>
                            <td className="p-2">{voucher.bloggerName}</td>
                            <td className="p-2">
                              <Badge variant={voucher.isUsed ? "secondary" : "default"}>
                                {voucher.isUsed ? "Usado" : "Disponível"}
                              </Badge>
                            </td>
                            <td className="p-2">{voucher.lojaUsada || (voucher.isUsed ? <span className='text-red-500'>Não informado</span> : "-")}</td>
                            <td className="p-2">{voucher.customerName}</td>
                            <td className="p-2 text-sm">
                              <div>{voucher.customerEmail}</div>
                              <div className="text-gray-500">{voucher.customerPhone}</div>
                            </td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                {!voucher.isUsed && (
                                  <MarcarComoUsadoButton voucherId={voucher.id} onSuccess={fetchVouchers} />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showGenerateQR && (
        <GenerateQRModal onClose={() => setShowGenerateQR(false)} />
      )}
    </RequireAuth>
  )
}

// Adicionar componente para marcar como usado com seleção de loja
function MarcarComoUsadoButton({ voucherId, onSuccess }: { voucherId: string, onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [loja, setLoja] = useState("")
  const [faixa, setFaixa] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleConfirm = async () => {
    if (!loja) {
      setError("Selecione a loja onde o voucher foi usado.")
      return
    }
    if (!faixa) {
      setError("Selecione a faixa de desconto concedida.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/voucher/${voucherId}/used`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lojaUsada: loja, faixaDesconto: faixa })
      })
      if (!res.ok) throw new Error('Erro ao marcar voucher como usado')
      setOpen(false)
      onSuccess()
      alert("Voucher marcado como USADO com sucesso!")
    } catch (e) {
      setError("Erro ao marcar voucher como usado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="text-green-600 hover:text-green-700"
      >
        Marcar como Usado
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-xs shadow-xl">
            <h2 className="text-lg font-bold mb-2 text-red-700">Marcar como Usado</h2>
            <p className="mb-2 text-sm">Selecione a loja onde o voucher foi utilizado:</p>
            <select
              className="w-full border rounded px-3 py-2 mb-2"
              value={loja}
              onChange={e => setLoja(e.target.value)}
            >
              <option value="">Selecione a loja</option>
              {LOJAS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <p className="mb-2 text-sm">Selecione a faixa de desconto concedida:</p>
            <select
              className="w-full border rounded px-3 py-2 mb-2"
              value={faixa}
              onChange={e => setFaixa(e.target.value)}
            >
              <option value="">Selecione a faixa de desconto</option>
              <option value="50">50 em compras de 250</option>
              <option value="100">100 em compras de 400</option>
              <option value="200">200 em compras de 600</option>
            </select>
            {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleConfirm} disabled={loading || !loja || !faixa} className="bg-green-600 text-white flex-1">
                {loading ? "Salvando..." : "Confirmar"}
              </Button>
              <Button onClick={() => setOpen(false)} variant="outline" className="flex-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Componente para gerar QR-code
function GenerateQRModal({ onClose }: { onClose: () => void }) {
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
              Selecione a loja e clique em "Gerar" para criar um novo código QR único que pode ser usado pelos indicados para validação.
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
                {LOJAS.map((loja) => (
                  <option key={loja} value={loja}>{loja}</option>
                ))}
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
                <p className="text-sm text-gray-500">Código QR válido para {selectedStore}</p>
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
