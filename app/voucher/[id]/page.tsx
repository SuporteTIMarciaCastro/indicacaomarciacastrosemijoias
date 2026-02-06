"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, Copy, Check, Calendar, User, Mail, Phone } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"

interface VoucherData {
  id: string
  code: string
  customerName: string
  customerEmail: string
  customerPhone: string
  discount: number
  minPurchase: number
  expiresAt: string
  isUsed: boolean
  createdAt: string
}

export default function VoucherPage() {
  const params = useParams();
  const id = params.id as string;
  const [voucher, setVoucher] = useState<VoucherData | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVoucher()
  }, [id])

  const fetchVoucher = async () => {
    try {
      const response = await fetch(`/api/vouchers/${id}`)
      if (response.ok) {
        const data = await response.json()
        setVoucher(data)
      }
    } catch (error) {
      console.error("Erro ao buscar voucher:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = async () => {
    if (voucher) {
      await navigator.clipboard.writeText(voucher.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  if (!voucher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
        <div className="text-white text-xl">Voucher não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen  p-4 " style={{ backgroundColor: "#fce7e1" }}>
      <div className="max-w-md mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-28 h-28 mx-auto mb-4" style={{ backgroundColor: 'transparent' }}>
            <Image src="/logo.png" alt="Marcia Castro Semijoias" width={110} height={110} className="rounded-full object-cover w-full h-full" />
          </div>
          <h1 className="text-2xl font-bold text-red-900 mb-2">SEU CHECK BÔNUS ESTÁ PRONTO!</h1>
        </div>

        {/* Cupom Principal */}
        <Card className="mb-6 overflow-hidden shadow-2xl border-0">
          <div className="bg-gradient-to-r from-red-900 to-red-600 p-6 text-white text-center">
            <Gift className="mx-auto mb-3" size={32} />
            {voucher.isUsed ? (
              <div className="mt-4 text-lg font-bold text-yellow-100 bg-yellow-700/80 rounded px-6 py-3 w-full max-w-xs mx-auto shadow-lg border-2 border-yellow-300">
                Cupom já utilizado
              </div>
            ) : (
              <div className="mt-4 text-lg font-bold text-green-100 bg-green-700/80 rounded px-6 py-3 w-full max-w-xs mx-auto shadow-lg border-2 border-green-300">
                Cupom disponível para uso
              </div>
            )}
            {/* <h2 className="text-2xl font-bold mb-2">CUPOM DE DESCONTO</h2> */}
            {/* <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-4">
              <div className="text-3xl font-bold">R$ {voucher.discount}</div>
              <div className="text-sm opacity-90">de desconto</div>
            </div> */}
            {/* <div className="text-sm opacity-90">Em compras acima de R$ {voucher.minPurchase}</div> */}
          </div>

          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600 mb-2">Código do Cupom</div>
              <div className="bg-gray-100 rounded-lg p-4 border-2 border-dashed border-red-300">
                <div className="text-2xl font-bold text-red-700 tracking-wider">{voucher.code}</div>
              </div>
              <Button
                onClick={copyCode}
                variant="outline"
                className="mt-3 border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                size="sm"
              >
                {copied ? (
                  <>
                    <Check size={16} className="mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={16} className="mr-2" />
                    Copiar Código
                  </>
                )}
              </Button>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User size={16} className="text-red-600" />
                <span className="text-gray-700">{voucher.customerName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-red-600" />
                <span className="text-gray-700">{voucher.customerEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-red-600" />
                <span className="text-gray-700">{voucher.customerPhone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-red-600" />
                <span className="text-gray-700">
                  Válido até: 31/12/2026
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <h3 className="font-bold text-red-700 mb-3">Como usar seu cupom:</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>
                Vá até uma loja mais próxima.
              </li>
              {/* <li>
                Dirija-se ao caixa da loja participante.
              </li>
              <li>
                Apresente o código do seu cupom
              </li> */}
              <li>
                Aproveite os descontos exclusivos:
                <ul className="mt-2 ml-5 list-disc text-gray-800 space-y-1">
                  <li>
                    <span className="font-bold text-red-700">Uma Semijoias surpresa</span> em compras acima de <span className="font-semibold">R$ 100,00</span>
                  </li>
                  {/* <li>
                    <span className="font-bold text-red-700">R$ 100,00</span> de desconto em compras acima de <span className="font-semibold">R$ 400,00</span>
                  </li>
                  <li>
                    <span className="font-bold text-red-700">R$ 200,00</span> de desconto em compras acima de <span className="font-semibold">R$ 600,00</span>
                  </li> */}
                </ul>
              </li>
            </ol>

            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-700">
                <strong>Importante:</strong> Este cupom é válido apenas uma vez e tem prazo de validade. Não perca esta
                oportunidade única!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
