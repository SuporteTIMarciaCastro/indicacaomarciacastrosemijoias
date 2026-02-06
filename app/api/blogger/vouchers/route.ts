import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bloggerId = searchParams.get("bloggerId")
    if (!bloggerId) {
      return NextResponse.json({ error: "bloggerId é obrigatório" }, { status: 400 })
    }
    const snapshot = await adminDb.collection("vouchers").where("bloggerId", "==", bloggerId).get()
    const vouchers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ vouchers })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar vouchers" }, { status: 500 })
  }
} 