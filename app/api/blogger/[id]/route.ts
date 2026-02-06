import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bloggerId } = await params

    if (!bloggerId) {
      return NextResponse.json({
        error: "ID do blogger é obrigatório"
      }, { status: 400 })
    }

    const bloggerDoc = await adminDb.collection("bloggers").doc(bloggerId).get()

    if (!bloggerDoc.exists) {
      return NextResponse.json({
        error: "Blogger não encontrado"
      }, { status: 404 })
    }

    const bloggerData = bloggerDoc.data()

    return NextResponse.json({
      blogger: {
        id: bloggerDoc.id,
        ...bloggerData,
        quantIndicadosAtivados: bloggerData?.quantIndicadosAtivados || 0
      }
    })

  } catch (error) {
    console.error("Erro ao buscar blogger:", error)
    return NextResponse.json({
      error: "Erro interno do servidor"
    }, { status: 500 })
  }
}