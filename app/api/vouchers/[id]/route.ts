import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params;
    const id = params.id;
    const docSnap = await adminDb.collection("vouchers").doc(id).get()
    if (!docSnap.exists) {
      return NextResponse.json({ error: "Voucher não encontrado" }, { status: 404 })
    }
    return NextResponse.json({ id: docSnap.id, ...docSnap.data() })
  } catch (error) {
    console.error("Erro na API:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
