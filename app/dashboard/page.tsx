"use client"

import RequireAuth from "@/components/RequireAuth"
import { useAuth } from "@/hooks/useAuth"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Lock, Unlock, Shield } from "lucide-react"
import Image from "next/image"
import { Suspense } from "react"

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const [activatedCount, setActivatedCount] = useState(0)
  const [followers, setFollowers] = useState<{name: string, email: string}[]>([])
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [bloggerName, setBloggerName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorLink, setErrorLink] = useState<React.ReactNode>(null)
  
  const bloggerId = user?.uid
  const linkRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (bloggerId) {
      fetchVouchers()
    } else {
      setError("ID da indicador não fornecido")
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
      
      // Buscar contador de indicados ativados do blogger
      const bloggerRes = await fetch(`/api/blogger/${bloggerId}`)
      const bloggerData = await bloggerRes.json()
      if (bloggerRes.ok) {
        setActivatedCount(bloggerData.blogger?.quantIndicadosAtivados || 0)
      } else {
        setActivatedCount(0)
      }
      
      const vouchers = data.vouchers || []
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

  const copyLink = async (id: string) => {
    const domain = process.env.NEXT_PUBLIC_VOUCHER_DOMAIN || window.location.origin
    const link = `${domain}/activate/${id}`
    await navigator.clipboard.writeText(link)
    setCopiedLink(link)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  if (isLoading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando Check bônus...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  if (error || errorLink) {
    return (
      <RequireAuth>
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
      </RequireAuth>
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
                <CardDescription>Compartilhe este link com seus indicados para que eles possam se cadastrar e ganhar Check bônus.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <input
                    ref={linkRef}
                    type="text"
                    readOnly
                    value={`${window.location.origin}/indicado/rules/${bloggerId}`}
                    className="flex-1 break-all font-mono text-sm bg-gray-100 rounded p-2 border border-gray-200 select-all cursor-pointer"
                    onClick={() => linkRef.current?.select()}
                    style={{ minWidth: 0 }}
                  />
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const link = `${window.location.origin}/indicado/rules/${bloggerId}`
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
          <div className="bg-white rounded-lg shadow p-4 flex-1 text-center relative overflow-hidden">
            {/* Ícone do cofre/cadeado com animação */}
            <div className="mb-2 flex justify-center">
                {activatedCount < 5 ? (
                <div className="relative inline-block">
                  <Shield className="w-12 h-12 text-gray-400" />
                  <Lock className="w-5 h-5 text-red-500 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              ) : (
                <div className="relative inline-block">
                  <Shield className="w-12 h-12 text-yellow-500 animate-pulse" />
                  <Unlock className="w-5 h-5 text-green-600 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                </div>
              )}
            </div>
            
            <div className="text-2xl font-bold text-red-600">{activatedCount}</div>
            <div className="text-gray-700">Check bônus Ativados</div>
            
            {/* Barra de progresso visual */}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                  activatedCount >= 5 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((activatedCount / 5) * 100, 100)}%` }}
              ></div>
            </div>
            
            {activatedCount < 5 && (
              <div className="mt-2 text-xs text-gray-500">
                Faltam {5 - activatedCount} para desbloquear R$ 100,00 em compras!
              </div>
            )}
            {activatedCount >= 5 && (
              <div className="mt-2 text-xs text-green-600 font-semibold animate-pulse">
                🎉 Parabéns! Você desbloqueou R$ 100,00 em compras — dirija-se a uma loja Marcia Castro Semijoias para retirar seu prêmio.
              </div>
            )}
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
                        {/* <th className="p-2 text-left rounded-r">Email</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {followers.map((f, i) => (
                        <tr key={i} className="bg-white shadow rounded">
                          <td className="p-2 break-words max-w-[120px] md:max-w-xs">{f.name}</td>
                          {/* <td className="p-2 break-words max-w-[180px] md:max-w-xs">{f.email}</td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Regras da promoção */}
        <div className="max-w-6xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Regras da Promoção</CardTitle>
              <CardDescription>Confira as regras para participar da promoção Indique e Ganhe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Indicação</h4>
                    <p className="text-gray-600 text-sm">Para desbloquear o cofre e receber seu R$ 100 reais em compras, é preciso que 5 pessoas indicadas por você façam check-in em uma de nossas lojas, cada indicador pode indicar quantas pessoas quiser através do link exclusivo.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cadastro</h4>
                    <p className="text-gray-600 text-sm">O indicado deve se cadastrar através do link fornecido pelo indicador. O indicado também receberá um voucher exclusivo ao se cadastrar.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ativação</h4>
                    <p className="text-gray-600 text-sm">Após o cadastro, o Check bônus é ativado automaticamente e enviado por email.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Utilização</h4>
                    <p className="text-gray-600 text-sm">4. Tanto o indicado e o indicador devem está seguindo o <a href="https://www.instagram.com/marciacastrosemijoias/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 underline">instagram</a> da Marcia Castro Semijoias.</p>
                    <p className="text-gray-600 text-sm">4.1 Indicador: recebe um cupom de R$ 100,00 para comprar qualquer produto nas lojas Marcia Castro Semijoias.</p>
                    <p className="text-gray-600 text-sm">4.2 Indicado: ganha uma semijoia surpresa em compras acima de R$ 100,00 nas lojas Marcia Castro Semijoias.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Vigência</h4>
                    <p className="text-gray-600 text-sm">O Check bônus/Cupom/Prêmio é pessoal e intransferível, válido para uma única utilização.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  )
}
