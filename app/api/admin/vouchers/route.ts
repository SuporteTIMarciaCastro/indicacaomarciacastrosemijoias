import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

interface VoucherData {
  id: string
  code: string
  bloggerId: string
  isUsed: boolean
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  lojaUsada?: string
  ativado?: boolean
  createdAt?: string
}

export async function GET(request: NextRequest) {
  try {
    const snapshot = await adminDb.collection("vouchers").get()
    const vouchers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VoucherData[]
    
    // Buscar nomes dos indicadores para todos os vouchers
    const bloggerIds = [...new Set(vouchers.map(v => v.bloggerId).filter(Boolean))]
    const bloggerNames: { [key: string]: string } = {}
    
    // Buscar dados dos indicadores em paralelo
    const bloggerPromises = bloggerIds.map(async (bloggerId) => {
      try {
        const bloggerDoc = await adminDb.collection("bloggers").doc(bloggerId).get()
        if (bloggerDoc.exists) {
          const data = bloggerDoc.data()
          bloggerNames[bloggerId] = data?.name || "Nome não encontrado"
        } else {
          bloggerNames[bloggerId] = "Indicador não encontrado"
        }
      } catch (error) {
        console.error(`Erro ao buscar indicador ${bloggerId}:`, error)
        bloggerNames[bloggerId] = "Erro ao buscar"
      }
    })
    
    await Promise.all(bloggerPromises)
    
    // Adicionar nome do indicador a cada voucher
    const vouchersWithNames = vouchers.map(voucher => ({
      ...voucher,
      bloggerName: bloggerNames[voucher.bloggerId] || "Nome não encontrado"
    }))
    
    return NextResponse.json({ vouchers: vouchersWithNames })
  } catch (error) {
    console.error("Erro ao buscar vouchers:", error)
    return NextResponse.json({ error: "Erro ao buscar vouchers" }, { status: 500 })
  }
} 