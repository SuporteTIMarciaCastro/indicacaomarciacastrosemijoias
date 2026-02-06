import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "ID do indicador é obrigatório" }, { status: 400 })
    }

    const doc = await adminDb.collection("bloggers").doc(id).get()
    
    if (!doc.exists) {
      return NextResponse.json({ error: "Indicador não encontrado" }, { status: 404 })
    }

    const bloggerData = doc.data()
    return NextResponse.json({ 
      id: doc.id, 
      name: bloggerData?.name || "Nome não encontrado",
      email: bloggerData?.email,
      instagram: bloggerData?.instagram
    })
  } catch (error) {
    console.error("Erro ao buscar indicador:", error)
    return NextResponse.json({ error: "Erro ao buscar indicador" }, { status: 500 })
  }
}
