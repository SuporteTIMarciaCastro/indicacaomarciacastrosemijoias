"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gift, Sparkles, User, Mail, Phone } from "lucide-react"
import Image from "next/image"
import { Suspense } from "react"

export default function IndicadoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <IndicadoContent />
    </Suspense>
  )
}

function IndicadoContent() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [indicatorName, setIndicatorName] = useState<string>("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const indicatorId = searchParams.get("indicador")

  useEffect(() => {
    if (!indicatorId) {
      setError("Link de indicação inválido")
      return
    }

    // Buscar nome do indicador
    fetchIndicatorName()
  }, [indicatorId])

  const fetchIndicatorName = async () => {
    try {
      const response = await fetch(`/api/indicator/${indicatorId}`)
      if (response.ok) {
        const data = await response.json()
        setIndicatorName(data.name || "Indicador")
      }
    } catch (err) {
      console.error("Erro ao buscar nome do indicador:", err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "phone") {
      const numbers = value.replace(/\D/g, "")
      if (numbers.length <= 11) {
        const formatted = numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
        setForm((prev) => ({ ...prev, [name]: formatted }))
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!indicatorId) {
      setError("ID do indicador não encontrado")
      setLoading(false)
      return
    }

    try {
      const cleanPhone = form.phone.replace(/\D/g, "")
      const response = await fetch("/api/indicado/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: cleanPhone,
          indicatorId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Erro ao cadastrar indicado")
      }
    } catch (err) {
      setError("Erro ao cadastrar indicado")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-white rounded-full p-4 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Image src="/logo.png" alt="Marcia Castro Semijoias" width={120} height={120} className="object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Cadastro Realizado!</h1>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-white text-lg font-semibold">Agora vá até uma loja física e escaneie o QR Code para ativar seu Check bônus!</p>
            </div>
          </div>
          <Card className="shadow-2xl border-0">
            <CardContent className="text-center p-6">
              <div className="mb-4">
                <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">✅ Cadastro realizado com sucesso!</h3>
                  <p className="text-sm">Seu cadastro foi registrado e está aguardando validação na loja.</p>
                </div>
                <div className="bg-blue-100 text-blue-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🏪 Próximo passo:</h3>
                  <p className="text-sm">Dirija-se a uma loja física da Marcia Castro Semijoias e solicite ao atendente para escanear o QR Code de validação.</p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Entendido
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error && !indicatorId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Link inválido</p>
            <p>Este link de indicação não é válido.</p>
          </div>
          <Button onClick={() => router.push("/")} className="bg-red-600 hover:bg-red-700 text-white">
            Voltar ao início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <Image src="/logo.png" alt="Marcia Castro Semijoias" width={120} height={120} className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Cadastro de Indicado</h1>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="text-yellow-300" size={24} />
              <Sparkles className="text-yellow-300" size={24} />
            </div>
            <p className="text-white text-lg font-semibold">
              Você foi indicado por: <span className="font-bold">{indicatorName || "Carregando..."}</span>
            </p>
            <p className="text-white text-sm mt-2">Preencha seus dados para ganhar seu Check bônus!</p>
          </div>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-blue-700">Seus Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Digite seu nome completo"
                  required
                  autoFocus
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Digite seu e-mail"
                  required
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="phone">Celular</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(XX) XXXXX-XXXX"
                  required
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar e Ganhar Check bônus"}
              </Button>
              <div className="text-center text-sm text-gray-600 mt-4">
                <p>Após o cadastro, vá até uma loja física para validar e receber seu Check bônus!</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}