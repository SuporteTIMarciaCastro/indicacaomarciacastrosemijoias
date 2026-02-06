"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gift, Sparkles } from "lucide-react"
import Image from "next/image"
import { Suspense } from "react"

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <ActivateContent />
    </Suspense>
  )
}

function ActivateContent() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const bloggerId = searchParams.get("indicador")

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData((prev) => ({ ...prev, phone: formatted }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!bloggerId) {
      setError("Link inválido. indicador não informada.")
      setLoading(false)
      return
    }
    // Validação de 11 dígitos no celular
    const phoneNumbersOnly = formData.phone.replace(/\D/g, "");
    if (phoneNumbersOnly.length !== 11) {
      setError("O celular deve conter exatamente 11 dígitos (incluindo DDD).");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          customerPhone: formData.phone,
          customerEmail: formData.email,
          bloggerId,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        router.push(`/voucher/${data.voucherId}`)
      } else {
        setError(data.error || "Erro ao ativar voucher")
      }
    } catch (error) {
      setError("Erro ao processar solicitação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#fce7e1" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="rounded-full p-4 w-40 h-40 mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
            <Image src="/logo.png" alt="Marcia Castro Semijoias" width={120} height={120} className="object-cover w-full h-full" />
          </div>
          <h1 className="text-2xl font-bold text-red-900 mb-2">ATIVE SEU CHECK BÔNUS</h1>
          <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="text-yellow-300" size={24} />
              <Sparkles className="text-yellow-300" size={24} />
            </div>
            <p className="text-red-900 text-sm font-semibold">Preencha seus dados para ativar seu cupom</p>
          </div>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-red-900 text-1xl">ATIVAÇÃO DO CHECK BÔNUS</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite seu nome completo"
                  required
                  className="border-red-200 focus:border-red-500"
                />
              </div>

              <div>
                <Label htmlFor="phone">Celular</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(XX) XXXXX-XXXX"
                  required
                  className="border-red-200 focus:border-red-500"
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Digite seu e-mail"
                  required
                  className="border-red-200 focus:border-red-500"
                />
              </div>

              {error && <div className="text-red-600 text-sm text-center">{error}</div>}

              <Button type="submit" className="w-full bg-red-900 hover:bg-red-700 text-white" disabled={loading}>
                {loading ? "Ativando..." : "Ativar Voucher"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 