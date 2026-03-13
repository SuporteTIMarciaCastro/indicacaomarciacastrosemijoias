import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

export async function POST(req: NextRequest) {
  try {
    const { bloggerId, sessionId, instagramProfile } = await req.json()

    if (!bloggerId || !sessionId || !instagramProfile) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados para confirmar seguimento." },
        { status: 400 }
      )
    }

    const docId = `${bloggerId}_${sessionId}`
    const confirmationRef = adminDb.collection("instagram_follow_confirmations").doc(docId)

    const result = await adminDb.runTransaction(async (tx) => {
      const existing = await tx.get(confirmationRef)

      if (existing.exists) {
        return { alreadyConfirmed: true }
      }

      tx.set(confirmationRef, {
        bloggerId,
        sessionId,
        instagramProfile,
        confirmedAt: new Date().toISOString(),
        userAgent: req.headers.get("user-agent") || null,
      })

      return { alreadyConfirmed: false }
    })

    return NextResponse.json({
      success: true,
      alreadyConfirmed: result.alreadyConfirmed,
      message: result.alreadyConfirmed
        ? "Seguimento já havia sido confirmado anteriormente."
        : "Seguimento confirmado com sucesso.",
    })
  } catch (error) {
    console.error("Erro ao confirmar seguimento no Instagram:", error)
    return NextResponse.json(
      { error: "Erro interno ao confirmar seguimento." },
      { status: 500 }
    )
  }
}
