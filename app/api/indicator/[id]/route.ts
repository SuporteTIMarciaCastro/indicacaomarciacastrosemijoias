import { type NextRequest, NextResponse } from "next/server"
import { doc, getDoc } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebaseAdmin"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: indicatorId } = await params

    if (!indicatorId) {
      return NextResponse.json({ error: "ID do indicador não fornecido" }, { status: 400 })
    }

    const indicatorRef = doc(adminDb, "indicators", indicatorId)
    const indicatorSnap = await getDoc(indicatorRef)

    if (!indicatorSnap.exists()) {
      return NextResponse.json({ error: "Indicador não encontrado" }, { status: 404 })
    }

    const indicatorData = indicatorSnap.data()

    return NextResponse.json({
      id: indicatorId,
      name: indicatorData?.name || "Indicador",
      email: indicatorData?.email,
      store: indicatorData?.store
    })
  } catch (error) {
    console.error("Erro ao buscar indicador:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}