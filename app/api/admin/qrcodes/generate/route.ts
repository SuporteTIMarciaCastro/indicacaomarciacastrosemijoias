import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

// Função para gerar código único de 6 dígitos
function generateQRCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const { store } = await request.json()

    if (!store) {
      return NextResponse.json({ error: "Loja é obrigatória" }, { status: 400 })
    }

    // Gerar código único de 6 dígitos
    let code: string
    let isUnique = false
    let attempts = 0

    do {
      code = generateQRCode()
      attempts++

      // Verificar se o código já existe em qualquer loja
      const docRef = adminDb.collection("qrcodes").doc("store_qrcodes")
      const docSnap = await docRef.get()
      
      if (!docSnap.exists) {
        isUnique = true
      } else {
        const data = docSnap.data()
        const existingCodes = [
          data?.lojaTeresina,
          data?.lojaRioPoty,
          data?.lojaCocais,
          data?.lojaParnaiba,
          data?.lojaRioAnil
        ].filter(Boolean)
        
        isUnique = !existingCodes.includes(code)
      }

      if (attempts > 10) {
        return NextResponse.json({ error: "Erro ao gerar código único" }, { status: 500 })
      }
    } while (!isUnique)

    // Documento único para armazenar códigos de todas as lojas
    const docId = "store_qrcodes"
    const docRef = adminDb.collection("qrcodes").doc(docId)

    // Buscar documento atual ou criar novo
    const docSnap = await docRef.get()
    let currentData = docSnap.exists ? docSnap.data() : {}

    // Mapear nomes das lojas para campos do documento
    const storeFieldMap: { [key: string]: string } = {
      "loja Shopping Teresina": "lojaTeresina",
      "loja Shopping Rio Poty": "lojaRioPoty",
      "loja Shopping Cocais": "lojaCocais",
      "loja Shopping Parnaiba": "lojaParnaiba",
      "loja Shopping Rio Anil": "lojaRioAnil"
    }

    const fieldName = storeFieldMap[store]
    if (!fieldName) {
      return NextResponse.json({ error: "Loja inválida" }, { status: 400 })
    }

    // Atualizar apenas o campo da loja específica
    await docRef.set({
      ...currentData,
      [fieldName]: code,
      lastUpdated: new Date(),
      updatedBy: store
    }, { merge: true })

    return NextResponse.json({
      success: true,
      qrCode: {
        id: docId,
        code,
        store,
        field: fieldName
      }
    })
  } catch (error) {
    console.error("Erro ao gerar QR code:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}