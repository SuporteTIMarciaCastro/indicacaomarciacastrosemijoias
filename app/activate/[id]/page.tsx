"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gift, Sparkles } from "lucide-react"
import Image from "next/image"

export default function ActivatePage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useParams<{ id: string }>()
  const voucherId = params?.id
  const router = useRouter()
  const [voucherChecked, setVoucherChecked] = useState(false)
  const searchParams = useSearchParams();
  const bloggerId = searchParams.get("indicador");
  const storeParam = searchParams.get("loja");

  useEffect(() => {
    const checkVoucher = async () => {
      if (!voucherId) return
      try {
        const response = await fetch(`/api/voucher/${voucherId}`);
        const data = await response.json();
        if (response.ok) {
          if (data.ativado) {
            router.replace(`/voucher/${voucherId}`);
            return;
          }
        } else {
          // Verificar se é um QR code válido para novo fluxo
          const qrResponse = await fetch('/api/qrcode/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ qrCode: voucherId, store: storeParam })
          });
          if (!qrResponse.ok) {
            setError("Código inválido. Verifique o link ou solicite um novo código na loja.");
            setVoucherChecked(true);
            return;
          }
        }
      } catch (err) {
        setError("Erro ao verificar código");
      } finally {
        setVoucherChecked(true)
      }
    }
    checkVoucher()
  }, [voucherId, router])

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
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (!bloggerId) {
      setError("Link inválido. indicador não informada.");
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
          qrCode: voucherId,
          store: storeParam,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // Redireciona para a página do voucher criado
        router.push(`/voucher/${data.voucherId}`);
      } else {
        setError(data.error || "Erro ao ativar voucher");
      }
    } catch (error) {
      setError("Erro ao processar solicitação");
    } finally {
      setLoading(false);
    }
  }

  if (!voucherChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
        <div className="text-white text-xl">Verificando voucher...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <Image src="/logo.png" alt="Marcia Castro Semijoias" width={120} height={120} className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Ative seu Voucher</h1>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="text-yellow-300" size={24} />
              <Sparkles className="text-yellow-300" size={24} />
            </div>
            <p className="text-white text-lg font-semibold">Preencha seus dados para ativar seu cupom</p>
          </div>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-red-700">Ativação do Voucher</CardTitle>
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

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                {loading ? "Ativando..." : "Ativar Voucher"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
