import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

// Função para atualizar o contador de vouchers do indicador
async function updateVoucherCount(bloggerId: string, increment: boolean = true) {
  try {
    const bloggerRef = adminDb.collection("bloggers").doc(bloggerId)
    
    if (increment) {
      // Incrementar o contador
      await bloggerRef.update({
        voucherCount: adminDb.FieldValue.increment(1)
      })
    } else {
      // Decrementar o contador
      await bloggerRef.update({
        voucherCount: adminDb.FieldValue.increment(-1)
      })
    }
  } catch (error) {
    console.error(`Erro ao atualizar contador de vouchers para ${bloggerId}:`, error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    // Buscar o voucher para obter o bloggerId antes de deletar
    const voucherDoc = await adminDb.collection("vouchers").doc(id).get()
    
    if (!voucherDoc.exists) {
      return NextResponse.json({ error: "Voucher não encontrado" }, { status: 404 })
    }
    
    const voucherData = voucherDoc.data()
    const bloggerId = voucherData?.bloggerId
    
    // Deletar o voucher
    await adminDb.collection("vouchers").doc(id).delete()
    
    // Atualizar o contador do indicador (decrementar)
    if (bloggerId) {
      await updateVoucherCount(bloggerId, false)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar voucher:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
