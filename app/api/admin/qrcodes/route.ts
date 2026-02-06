import { type NextRequest, NextResponse } from "next/server"
import { collection, getDocs, query, orderBy } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebaseAdmin"

export async function GET(request: NextRequest) {
  try {
    const docRef = adminDb.collection("qrcodes").doc("store_qrcodes")
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return NextResponse.json({ qrCodes: [] })
    }

    const data = docSnap.data()
    
    // Converter o documento único em array de QR codes por loja
    const qrCodes = [
      {
        id: "lojaTeresina",
        code: data?.lojaTeresina || null,
        store: "loja Shopping Teresina",
        isActive: !!data?.lojaTeresina,
        createdAt: data?.lastUpdated?.toDate?.() || data?.lastUpdated || null
      },
      {
        id: "lojaRioPoty",
        code: data?.lojaRioPoty || null,
        store: "loja Shopping Rio Poty",
        isActive: !!data?.lojaRioPoty,
        createdAt: data?.lastUpdated?.toDate?.() || data?.lastUpdated || null
      },
      {
        id: "lojaCocais",
        code: data?.lojaCocais || null,
        store: "loja Shopping Cocais",
        isActive: !!data?.lojaCocais,
        createdAt: data?.lastUpdated?.toDate?.() || data?.lastUpdated || null
      },
      {
        id: "lojaParnaiba",
        code: data?.lojaParnaiba || null,
        store: "loja Shopping Parnaiba",
        isActive: !!data?.lojaParnaiba,
        createdAt: data?.lastUpdated?.toDate?.() || data?.lastUpdated || null
      },
      {
        id: "lojaRioAnil",
        code: data?.lojaRioAnil || null,
        store: "loja Shopping Rio Anil",
        isActive: !!data?.lojaRioAnil,
        createdAt: data?.lastUpdated?.toDate?.() || data?.lastUpdated || null
      }
    ]

    return NextResponse.json({ qrCodes })
  } catch (error) {
    console.error("Erro ao buscar QR codes:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}