import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Iniciando verificação de email...")

    const body = await request.json()
    console.log("📝 Body recebido:", body)

    const { token } = body
    console.log("🔑 Token extraído:", token)

    if (!token) {
      console.log("❌ Token não fornecido")
      return NextResponse.json({ error: "Token não fornecido" }, { status: 400 })
    }

    // Resposta de teste simples
    console.log("🎉 Teste concluído com sucesso!")
    return NextResponse.json({
      success: true,
      message: "API funcionando",
      token: token
    })
  } catch (error) {
    console.error("💥 Erro na API:", error)
    console.error("Stack trace:", error.stack)
    return NextResponse.json({
      error: "Erro interno do servidor",
      details: error.message
    }, { status: 500 })
  }
}