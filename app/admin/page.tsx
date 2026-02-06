"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface Blogger {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  password?: string;
  voucherCount?: number;
}

export default function AdminPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    instagram: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [bloggers, setBloggers] = useState<Blogger[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [initializingCounters, setInitializingCounters] = useState(false);

  useEffect(() => {
    fetchBloggers();
  }, [success]);

  const fetchBloggers = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/bloggers");
      const data = await res.json();
      if (res.ok) {
        setBloggers(data.bloggers || []);
      }
    } catch (e) {
      // erro silencioso
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setGeneratedPassword(null);
    try {
      const response = await fetch("/api/blogger/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setGeneratedPassword(data.password);
        setForm({ name: "", email: "", phone: "", instagram: "" });
        setShowModal(false);
      } else {
        setError(data.error || "Erro ao cadastrar indicador");
      }
    } catch (err) {
      setError("Erro ao cadastrar indicador");
    } finally {
      setLoading(false);
    }
  };

  const initializeCounters = async () => {
    setInitializingCounters(true);
    try {
      const response = await fetch("/api/admin/init-counters", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchBloggers(); // Recarregar a lista
      } else {
        alert("Erro ao inicializar contadores: " + data.error);
      }
    } catch (err) {
      alert("Erro ao inicializar contadores");
    } finally {
      setInitializingCounters(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header igual ao da página de blogger */}
      <div className=" text-white p-4 md:p-6" style={{ backgroundColor: "#fce7e1" }}>
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-transparent overflow-hidden">
            <Image src="/logo.png" alt="Logo" width={66} height={66} className="object-cover w-full h-full" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-red-900">Painel Administrativo</h1>
            <p className="opacity-90 text-sm md:text-base text-black">Cadastro e gestão de indicadores</p>
          </div>
        </div>
      </div>

      {/* Botão para abrir o modal de cadastro */}
      {/* Removido: botão e modal de cadastro de indicador */}

      {/* Mensagem de sucesso e senha gerada */}
      {/* Removido: mensagem de sucesso do cadastro */}

      {/* Lista de indicadores cadastradas */}
      <div className="w-full max-w-3xl mx-auto mt-6 px-2 md:px-0 flex-1">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Indicadores cadastradas</CardTitle>
              <Button 
                onClick={initializeCounters} 
                disabled={initializingCounters}
                variant="outline"
                size="sm"
              >
                {initializingCounters ? "Inicializando..." : "Inicializar Contadores"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="text-center text-gray-500 py-8">Carregando...</div>
            ) : bloggers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Nenhum indicador cadastrado ainda.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base border-separate border-spacing-y-2">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left rounded-l">Nome</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Vouchers</th>
                      {/* <th className="p-2 text-left">Senha</th> */}
                      <th className="p-2 text-left rounded-r">Instagram</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloggers.map((b) => (
                      <tr key={b.id} className="bg-white shadow rounded">
                        <td className="p-2 break-words max-w-[120px] md:max-w-xs">{b.name}</td>
                        <td className="p-2 break-words max-w-[120px] md:max-w-xs">{b.email}</td>
                        <td className="p-2 text-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                            {b.voucherCount || 0}
                          </span>
                        </td>
                        {/* <td className="p-2 font-mono text-xs md:text-base select-all">{b.password || <span className='text-gray-400'>-</span>}</td> */}
                        <td className="p-2 break-words max-w-[100px] md:max-w-xs">{b.instagram}</td>
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
  );
} 