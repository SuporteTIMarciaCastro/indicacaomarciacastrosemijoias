import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { lojaUsada, faixaDesconto } = await request.json()
    if (!lojaUsada || !faixaDesconto) {
      return NextResponse.json({ error: "Loja e faixa de desconto são obrigatórios" }, { status: 400 })
    }
    const { id } = await params
    await adminDb.collection("vouchers").doc(id).update({ isUsed: true, lojaUsada, faixaDesconto })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao marcar voucher como usado" }, { status: 500 })
  }
} 