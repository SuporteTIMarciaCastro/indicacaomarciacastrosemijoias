"use client"

import RequireAuth from "@/components/RequireAuth"
import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Share2 } from "lucide-react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface VoucherData {
  id: string
  code: string
  isUsed: boolean
  ativado?: boolean
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const [activatedCount, setActivatedCount] = useState(0)
  const [usedCount, setUsedCount] = useState(0)
  const [followers, setFollowers] = useState<{name: string, email: string}[]>([])
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [bloggerName, setBloggerName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorLink, setErrorLink] = useState<React.ReactNode>(null)
  const [page, setPage] = useState(1)
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [firstDoc, setFirstDoc] = useState<any>(null)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)
  const [pageStack, setPageStack] = useState<any[]>([])
  
  const searchParams = useSearchParams()
  const bloggerId = searchParams.get("indicador")
  const linkRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (bloggerId) {
      fetchVouchers()
    } else {
      setError("ID da Indicador não fornecido")
      setIsLoading(false)
    }
    // eslint-disable-next-line
  }, [bloggerId])

  const fetchVouchers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/blogger/vouchers?bloggerId=${bloggerId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao buscar vouchers")
      const vouchers = data.vouchers || []
      setActivatedCount(vouchers.filter((v: any) => v.ativado).length)
      setUsedCount(vouchers.filter((v: any) => v.isUsed).length)
      // Listar indicados (clientes)
      setFollowers(
        vouchers
          .filter((v: any) => v.customerName && v.customerEmail)
          .map((v: any) => ({ name: v.customerName, email: v.customerEmail }))
      )
    } catch (err: any) {
      setError(err.message || "Erro ao carregar vouchers")
    } finally {
      setIsLoading(false)
    }
  }

  // Remover funções de paginação e setPageStack
  // Remover nextPage e prevPage

  const copyLink = async (id: string) => {
    const domain = process.env.NEXT_PUBLIC_VOUCHER_DOMAIN || window.location.origin
    const link = `${domain}/activate/${id}`
    await navigator.clipboard.writeText(link)
    setCopiedLink(link)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando Check bônus...</p>
        </div>
      </div>
    )
  }

  if (error || errorLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Erro</p>
            {error && <p>{error}</p>}
            {errorLink && <div>{errorLink}</div>}
          </div>
          <p className="text-gray-600">Verifique se o ID do indicador está correto na URL</p>
        </div>
      </div>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6" style={{ backgroundColor: "#fce7e1" }}>
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 bg-transparent">
              <Image src="/logo.png" alt="Logo" width={66} height={66} className="object-cover w-full h-full" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-900  ">Painel do Indicador</h1>
              <p className="opacity-90 text-black">Compartilhe seus links com seus indicados</p>
            </div>
          </div>
        </div>

        {/* Link único de ativação */}
        {bloggerId && (
          <div className="max-w-6xl mx-auto p-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">SEU LINK DE CRIAÇÃO DE CHECK BÔNUS {bloggerName}</CardTitle>
                <CardDescription>Compartilhe este link com seus indicados para que eles possam ativar seus próprios Check bônus.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <input
                    ref={linkRef}
                    type="text"
                    readOnly
                    value={`${window.location.origin}/activate?indicador=${bloggerId}`}
                    className="flex-1 break-all font-mono text-sm bg-gray-100 rounded p-2 border border-gray-200 select-all cursor-pointer"
                    onClick={() => linkRef.current?.select()}
                    style={{ minWidth: 0 }}
                  />
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const link = `${window.location.origin}/activate?indicador=${bloggerId}`
                      try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(link)
                        } else {
                          // Fallback: seleciona o input para o usuário copiar manualmente
                          linkRef.current?.select()
                          document.execCommand('copy')
                        }
                        setCopiedLink("link")
                        setTimeout(() => setCopiedLink(null), 2000)
                      } catch (e) {
                        // Fallback: seleciona o input para o usuário copiar manualmente
                        linkRef.current?.select()
                        setCopiedLink("erro")
                        setTimeout(() => setCopiedLink(null), 2000)
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    {copiedLink === "link" ? <Check size={16} /> : <Copy size={16} />}
                    {copiedLink === "link" ? "Copiado!" : copiedLink === "erro" ? "Selecione e copie" : "Copiar link"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Indicadores de Check bônus */}
        <div className="max-w-6xl mx-auto p-6 flex gap-6">
          <div className="bg-white rounded-lg shadow p-4 flex-1 text-center">
            <div className="text-2xl font-bold text-red-600">{activatedCount}</div>
            <div className="text-gray-700">Check bônus Criados</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex-1 text-center">
            <div className="text-2xl font-bold text-green-600">{usedCount}</div>
            <div className="text-gray-700">Check bônus usados</div>
          </div>
        </div>

        {/* Lista de indicados */}
        <div className="max-w-6xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Indicados cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              {followers.length === 0 ? (
                <div className="text-gray-500 text-center py-4">Nenhum seguidor cadastrado ainda.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm md:text-base border-separate border-spacing-y-2">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left rounded-l">Nome</th>
                        <th className="p-2 text-left rounded-r">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {followers.map((f, i) => (
                        <tr key={i} className="bg-white shadow rounded">
                          <td className="p-2 break-words max-w-[120px] md:max-w-xs">{f.name}</td>
                          <td className="p-2 break-words max-w-[180px] md:max-w-xs">{f.email}</td>
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
    </RequireAuth>
  )
}
