import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"

export async function POST(request: NextRequest) {
  try {
    const { qrCode, store, indicadoId, indicatorId } = await request.json()

    if (!qrCode) {
      return NextResponse.json({
        error: "Código QR é obrigatório"
      }, { status: 400 })
    }

    if (!store) {
      return NextResponse.json({
        error: "Loja é obrigatória"
      }, { status: 400 })
    }

    // 1. Verificar se o QR code existe no documento único
    const docRef = adminDb.collection("qrcodes").doc("store_qrcodes")
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return NextResponse.json({
        error: "QR Code inválido ou inativo"
      }, { status: 400 })
    }

    const qrData = docSnap.data()
    
    // Mapear o nome da loja para o campo no documento
    const storeFieldMap: { [key: string]: string } = {
      "loja Shopping Teresina": "lojaTeresina",
      "loja Shopping Rio Poty": "lojaRioPoty",
      "loja Shopping Cocais": "lojaCocais",
      "loja Shopping Parnaiba": "lojaParnaiba",
      "loja Shopping Rio Anil": "lojaRioAnil"
    }

    const storeField = storeFieldMap[store]
    if (!storeField) {
      return NextResponse.json({
        error: "Loja inválida"
      }, { status: 400 })
    }

    // Verificar se o código corresponde à loja selecionada
    const storeCode = qrData?.[storeField]
    if (!storeCode || storeCode !== qrCode) {
      return NextResponse.json({
        error: "QR Code inválido para esta loja"
      }, { status: 400 })
    }

    // Se indicadoId fornecido, fazer validação completa (fluxo antigo)
    if (indicadoId) {
      // 2. Verificar se o indicado existe e está pendente
      const indicadoSnap = await adminDb.collection("indicados").doc(indicadoId).get()

      if (!indicadoSnap.exists()) {
        return NextResponse.json({
          error: "Indicado não encontrado"
        }, { status: 404 })
      }

      const indicadoData = indicadoSnap.data()

      if (indicadoData?.status !== "pending") {
        return NextResponse.json({
          error: "Indicação já foi validada ou está inválida"
        }, { status: 400 })
      }

      // 3. Gerar voucher para o indicado
      const voucherCode = generateVoucherCode()
      const voucherData = {
        code: voucherCode,
        indicatorId: indicadoData.indicatorId,
        customerName: indicadoData.name,
        customerEmail: indicadoData.email,
        customerPhone: indicadoData.phone,
        ativado: false,
        isUsed: false,
        createdAt: new Date(),
        validatedAt: new Date(),
        qrCodeId: "store_qrcodes",
        store: storeField,
        indicadoId: indicadoId
      }

      const voucherRef = await adminDb.collection("vouchers").add(voucherData)

      // 4. Atualizar status do indicado
      await adminDb.collection("indicados").doc(indicadoId).update({
        status: "validated",
        validatedAt: new Date(),
        voucherId: voucherRef.id,
        qrCodeId: "store_qrcodes"
      })

      // 5. Atualizar contador de uso do QR code da loja específica
      const usageField = `${storeField}Usage`
      const currentUsage = qrData[usageField] || 0
      
      await docRef.update({
        [usageField]: currentUsage + 1,
        lastUsed: new Date(),
        lastUsedBy: storeField
      })

      // 6. Enviar email com o voucher
      await sendVoucherEmail({
        to: indicadoData.email,
        name: indicadoData.name,
        code: voucherCode
      })

      return NextResponse.json({
        success: true,
        message: "Indicação validada com sucesso!",
        voucher: {
          id: voucherRef.id,
          code: voucherCode,
          customerName: indicadoData.name
        }
      })
    } else {
      // Novo fluxo: apenas validar QR code
      return NextResponse.json({
        success: true,
        qrId: "store_qrcodes",
        message: "QR Code válido"
      })
    }

  } catch (error) {
    console.error("Erro ao validar QR code:", error)
    return NextResponse.json({
      error: "Erro interno do servidor"
    }, { status: 500 })
  }
}

// Função para gerar código de voucher único
function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Função para enviar email com voucher
async function sendVoucherEmail({ to, name, code }: { to: string; name: string; code: string }) {
  // Importar nodemailer aqui para evitar problemas de inicialização
  const nodemailer = (await import("nodemailer")).default

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  const mailOptions = {
    from: `Marcia Castro Semijoias <${process.env.GMAIL_USER}>`,
    to,
    subject: "Seu Check bônus foi liberado!",
    html: `
      <div style="font-family: Arial, sans-serif; background: #fff; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto;">
        <h2 style="color: #b91c1c;">Parabéns, ${name}!</h2>
        <p>Sua indicação foi validada com sucesso na loja!</p>
        <p style="font-size: 18px; margin: 24px 0;">
          <strong style="color: #b91c1c; font-size: 32px; letter-spacing: 2px;">${code}</strong>
        </p>
        <p>Use este código para ganhar <b> uma semijoia surpresa</b> em compras acima de <b>R$ 100</b> na Marcia Castro Semijoias.</p>
        <p style="margin-top: 32px; color: #888; font-size: 13px;">Check bônus pessoal e intransferível. Válido para uma única utilização.</p>
        <hr style="margin: 24px 0;" />
        <p style="font-size: 12px; color: #aaa;">Dúvidas? Fale conosco pelo WhatsApp ou Instagram.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}