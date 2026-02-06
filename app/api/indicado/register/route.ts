import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, indicatorId } = await request.json()

    if (!name || !email || !phone || !indicatorId) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    // Verificar se o indicador existe
    const indicatorRef = doc(adminDb, "indicators", indicatorId)
    const indicatorSnap = await getDoc(indicatorRef)

    if (!indicatorSnap.exists()) {
      return NextResponse.json({ error: "Indicador não encontrado" }, { status: 404 })
    }

    // Criar documento do indicado
    const indicadoData = {
      name,
      email,
      phone,
      indicatorId,
      status: "pending", // aguardando validação na loja
      createdAt: new Date(),
      validatedAt: null,
      voucherId: null
    }

    // Adicionar à coleção de indicados
    const indicadoRef = await addDoc(collection(adminDb, "indicados"), indicadoData)

    return NextResponse.json({
      success: true,
      indicadoId: indicadoRef.id,
      message: "Indicado cadastrado com sucesso. Aguardando validação na loja."
    })
  } catch (error) {
    console.error("Erro ao cadastrar indicado:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}