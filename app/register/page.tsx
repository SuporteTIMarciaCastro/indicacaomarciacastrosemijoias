"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Sparkles } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    store: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const formatted = formatPhone(value);
      setForm((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.store) {
      setError("Selecione uma loja.");
      return;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const cleanPhone = form.phone.replace(/\D/g, "");
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: cleanPhone,
          store: form.store,
          password: form.password,
        }),
      });
      const data = await response.json();
      if (response.ok && data.indicatorId) {
        setSuccess(true);
      } else {
        setError(data.error || "Erro ao cadastrar indicador");
      }
    } catch (err) {
      setError("Erro ao cadastrar indicador");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-white rounded-full p-4 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Image src="/logo.png" alt="Marcia Castro Semijoias" width={120} height={120} className="object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Cadastro Realizado!</h1>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-white text-lg font-semibold">Verifique seu email e clique no link enviado para acessar a plataforma.</p>
            </div>
          </div>
          <Card className="shadow-2xl border-0">
            <CardContent className="text-center p-6">
              <p className="text-gray-700 mb-4">Um email foi enviado para {form.email} com instruções para confirmar sua conta.</p>
              <p className="text-sm text-gray-500">Não recebeu o email? Verifique sua caixa de spam ou entre em contato conosco.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full p-4 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <Image src="/logo.png" alt="Marcia Castro Semijoias" width={120} height={120} className="object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Cadastro de Indicador</h1>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="text-yellow-300" size={24} />
              <Sparkles className="text-yellow-300" size={24} />
            </div>
            <p className="text-white text-lg font-semibold">Preencha seus dados para se cadastrar</p>
          </div>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-red-700">Cadastro na Plataforma</CardTitle>
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
                  className="border-red-200 focus:border-red-500"
                />
              </div>
              <div>
                <Label htmlFor="store">Loja Atendida</Label>
                <Select value={form.store} onValueChange={(value) => setForm((prev) => ({ ...prev, store: value }))}>
                  <SelectTrigger className="border-red-200 focus:border-red-500">
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Loja Teresina">Loja Teresina</SelectItem>
                    <SelectItem value="Loja Rio Poty">Loja Rio Poty</SelectItem>
                    <SelectItem value="Loja Cocais">Loja Cocais</SelectItem>
                    <SelectItem value="Lojas Parnaíba">Lojas Parnaíba</SelectItem>
                    <SelectItem value="Loja Rio Anil">Loja Rio Anil</SelectItem>
                  </SelectContent>
                </Select>
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
                  className="border-red-200 focus:border-red-500"
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
                  className="border-red-200 focus:border-red-500"
                />
              </div>
              <div>
                <Label htmlFor="password">Criar Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  required
                  minLength={6}
                  className="border-red-200 focus:border-red-500"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Repetir Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repita sua senha"
                  required
                  minLength={6}
                  className="border-red-200 focus:border-red-500"
                />
              </div>
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>
              <span className="text-sm text-gray-500 text-center block">
                Ao se cadastrar, você concorda com os <a href="/termos-de-uso" className="text-blue-500">Termos de Uso</a> e a <a href="/politica-de-privacidade" className="text-blue-500">Política de Privacidade</a>
              </span>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
