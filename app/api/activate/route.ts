import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"
import nodemailer from "nodemailer"

function generateVoucherCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Função para atualizar o contador de vouchers do indicador
async function updateVoucherCount(bloggerId: string, increment: boolean = true) {
  try {
    const bloggerRef = adminDb.collection("bloggers").doc(bloggerId)
    
    // Verificar se o documento existe
    const bloggerDoc = await bloggerRef.get()
    if (!bloggerDoc.exists) {
      console.log(`Documento do blogger ${bloggerId} não encontrado. Criando documento...`)
      // Criar documento com contadores zerados se não existir
      await bloggerRef.set({
        voucherCount: 0,
        quantIndicadosAtivados: 0,
        createdAt: new Date().toISOString()
      })
    }
    
    if (increment) {
      // Incrementar o contador
      await bloggerRef.update({
        voucherCount: FieldValue.increment(1)
      })
    } else {
      // Decrementar o contador
      await bloggerRef.update({
        voucherCount: FieldValue.increment(-1)
      })
    }
  } catch (error) {
    console.error(`Erro ao atualizar contador de vouchers para ${bloggerId}:`, error)
  }
}

async function sendVoucherEmail({ to, name, code, voucherId }: { to: string; name: string; code: string; voucherId: string }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  const voucherLink = `${process.env.NEXT_PUBLIC_VOUCHER_DOMAIN || "https://suaplataforma.com"}/voucher/${voucherId}`

  const mailOptions = {
    from: `Marcia Castro Semijoias <${process.env.GMAIL_USER}>`,
    to,
    subject: "Seu Cupom de Desconto - Marcia Castro Semijoias",
    html: `
      <div style="font-family: Arial, sans-serif; background: #fff; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto;">
        <h2 style="color: #b91c1c;">Olá, ${name}!</h2>
        <p>Parabéns, seu voucher foi ativado com sucesso.</p>
        <p style="font-size: 18px; margin: 24px 0;">
          <strong style="color: #b91c1c; font-size: 32px; letter-spacing: 2px;">${code}</strong>
        </p>
        <p>Use este código para ganhar <b>Uma semijoia surpresa</b> em compras acima de <b>R$ 100</b> na Marcia Castro Semijoias.</p>
        <p style="margin-top: 24px;">
          <a href="${voucherLink}" style="display:inline-block;padding:12px 24px;background:#b91c1c;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Acessar meu voucher</a>
        </p>
        <p style="margin-top: 32px; color: #888; font-size: 13px;">Cupom pessoal e intransferível. Válido para uma única utilização.</p>
        <hr style="margin: 24px 0;" />
        <p style="font-size: 12px; color: #aaa;">Dúvidas? Fale conosco pelo WhatsApp ou Instagram.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// Função para enviar email de prêmio desbloqueado para o indicador
async function sendIndicatorPrizeEmail({ to, name }: { to: string; name: string }) {
  console.log(`Tentando enviar email para ${to} com nome ${name}`)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  const dashboardLink = `${process.env.NEXT_PUBLIC_VOUCHER_DOMAIN}/dashboard`

  const mailOptions = {
    from: `Marcia Castro Semijoias <${process.env.GMAIL_USER}>`,
    to,
    subject: "🎊🎊🎊 COFRE DESBLOQUEADO! 🎊🎊🎊",
    html: `
      <div style="font-family: Arial, sans-serif; background: #fff; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto; text-align: center;">
        <h1 style="color: #b91c1c; font-size: 28px;">🎊🎊🎊 COFRE DESBLOQUEADO! 🎊🎊🎊</h1>
        <h2 style="color: #333;">PARABÉNS, ${name}!</h2>
        <p style="font-size: 18px; margin: 20px 0;">Você CONSEGUIU! 5 amigas verificadas! 🎉</p>
        <p style="font-size: 20px; margin: 20px 0; color: #b91c1c;"><strong>Seu VOUCHER de R$100 tá PRONTO! 💰</strong></p>
        <p style="margin: 24px 0;">
          <a href="${dashboardLink}" style="display:inline-block;padding:12px 24px;background:#b91c1c;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">👉 Clica aqui pra ver: [LINK DO VOUCHER]</a>
        </p>
        <p style="font-size: 16px; margin: 20px 0;">Agora vem pra QUALQUER loja nossa e escolhe o que quiser!</p>
        <p style="font-size: 18px; margin: 20px 0; color: #b91c1c;"><strong>VOCÊ ESCOLHE! 😍</strong></p>
        <p style="margin: 20px 0;">Válido em todas as nossas lojas!</p>
        <p style="margin: 20px 0;">Te esperamos! 💕</p>
        <p style="font-size: 14px; color: #888; margin: 20px 0;"><em>Obs: Trouxe as amigas junto? Melhor ainda! 😉</em></p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// Função para formatar o número de telefone
function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres especiais (parênteses, espaços, hífens)
  let cleanNumber = phone.replace(/[\(\)\s\-]/g, '')
  
  // Adiciona o prefixo +55 se não existir
  if (!cleanNumber.startsWith('+55')) {
    cleanNumber = '+55' + cleanNumber
  }
  
  // Remove o terceiro "9" da esquerda para a direita
  // O formato esperado é +5599XXXXXXXXX, onde o terceiro 9 deve ser removido
  if (cleanNumber.startsWith('+5599') && cleanNumber.length >= 13) {
    // Remove o terceiro 9 (índice 4 após +55)
    cleanNumber = cleanNumber.substring(0, 4) + cleanNumber.substring(5)
  }
  
  return cleanNumber
}

// Função para enviar dados do voucher ativado para o webhook
async function sendVoucherActivatedWebhook(voucherData: {
  voucherId: string
  code: string
  customerName: string
  customerEmail: string
  customerPhone: string
  bloggerId: string
  store?: string
  qrCode?: string
}) {
  try {
    // Usar URL hardcoded temporariamente para testar
    const webhookUrl = process.env.WEBHOOK_INDICADOS_URL
    
    if (!webhookUrl) {
      console.warn('WEBHOOK_INDICADOS_URL não configurada, pulando envio do webhook do voucher')
      return
    }

    const formattedPhone = formatPhoneNumber(voucherData.customerPhone)
    
    const payload = {
      event: 'voucher_activated',
      voucher_id: voucherData.voucherId,
      voucher_code: voucherData.code,
      customer_name: voucherData.customerName,
      customer_email: voucherData.customerEmail,
      customer_phone: formattedPhone,
      blogger_id: voucherData.bloggerId,
      store: voucherData.store || null,
      qr_code: voucherData.qrCode || null,
      activated_at: new Date().toISOString()
    }

    console.log('Enviando webhook do voucher ativado para:', webhookUrl)
    console.log('Payload do webhook:', JSON.stringify(payload, null, 2))

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    console.log('Resposta do webhook:', response.status, response.statusText)

    if (!response.ok) {
      console.error(`Erro ao enviar voucher ativado para webhook: ${response.status} ${response.statusText}`)
      const responseText = await response.text()
      console.error('Resposta do erro:', responseText)
    } else {
      console.log('Voucher ativado enviado para webhook com sucesso')
    }
  } catch (error) {
    console.error('Erro ao enviar voucher ativado para webhook:', error)
  }
}

// Função para enviar dados do indicador quando atingir a meta de activações
async function sendIndicatorWebhook(bloggerId: string, bloggerData: any) {
  try {
    const webhookUrl = process.env.WEBHOOK_INDICADORES_URL

    if (!webhookUrl) {
      console.warn('WEBHOOK_INDICADORES_URL não configurada, pulando envio do webhook do indicador')
      return
    }

    const payload = {
      event: 'indicator_goal_reached',
      blogger_id: bloggerId,
      blogger: bloggerData || {},
      triggered_at: new Date().toISOString()
    }

    console.log('Enviando webhook do indicador para:', webhookUrl)
    console.log('Payload do webhook do indicador:', JSON.stringify(payload, null, 2))

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    console.log('Resposta do webhook do indicador:', response.status, response.statusText)

    if (!response.ok) {
      console.error(`Erro ao enviar webhook do indicador: ${response.status} ${response.statusText}`)
      const responseText = await response.text()
      console.error('Resposta do erro:', responseText)
    } else {
      console.log('Webhook do indicador enviado com sucesso')
    }
  } catch (error) {
    console.error('Erro ao enviar webhook do indicador:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerName, customerEmail, customerPhone, bloggerId, qrCode, store } = await request.json()
    if (!customerName || !customerEmail || !customerPhone || !bloggerId) {
      return NextResponse.json({ error: "Dados obrigatórios não informados." }, { status: 400 })
    }

    // Se qrCode fornecido, validar antes de criar voucher
    let validStore: string | undefined
    if (qrCode) {
      if (!store) {
        return NextResponse.json({ error: "Loja é obrigatória quando QR Code é fornecido" }, { status: 400 })
      }

      const docRef = adminDb.collection("qrcodes").doc("store_qrcodes")
      const docSnap = await docRef.get()
      
      if (!docSnap.exists) {
        return NextResponse.json({ error: "QR Code inválido" }, { status: 400 })
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
        return NextResponse.json({ error: "Loja inválida" }, { status: 400 })
      }

      // Verificar se o código corresponde à loja selecionada
      const storeCode = qrData?.[storeField]
      if (!storeCode || storeCode !== qrCode) {
        return NextResponse.json({ error: "QR Code inválido para esta loja" }, { status: 400 })
      }

      validStore = storeField

      // Atualizar contador de uso da loja específica
      const usageField = `${storeField}Usage`
      const currentUsage = qrData[usageField] || 0
      
      await docRef.update({
        [usageField]: currentUsage + 1,
        lastUsed: new Date(),
        lastUsedBy: storeField
      })
    }

    const code = generateVoucherCode()
    const docRef = await adminDb.collection("vouchers").add({
      code,
      ativado: true,
      isUsed: false,
      customerName,
      customerEmail,
      customerPhone,
      bloggerId,
      createdAt: new Date().toISOString(),
      ...(qrCode && validStore && { qrCodeId: "store_qrcodes", store: validStore })
    })
    
    // Atualizar o contador de vouchers do indicador
    await updateVoucherCount(bloggerId, true)
    
    // Incrementar contador de indicados ativados do blogger atomically e disparar webhook uma vez
    const bloggerRef = adminDb.collection("bloggers").doc(bloggerId)

    // Usar transação para garantir que o webhook seja enviado apenas uma vez
    const shouldSendIndicatorWebhook = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(bloggerRef)
      if (!snap.exists) {
        tx.set(bloggerRef, {
          voucherCount: 0,
          quantIndicadosAtivados: 1,
          createdAt: new Date().toISOString()
        })
        console.log(`Novo blogger ${bloggerId} criado com quantIndicadosAtivados: 1`)
        // Se a primeira ativação já alcança a meta (1 >= 5) não faz sentido, então não envia
        return false
      }

      const data = snap.data() || {}
      const current = Number(data.quantIndicadosAtivados || 0)
      const newCount = current + 1

      tx.update(bloggerRef, {
        quantIndicadosAtivados: FieldValue.increment(1)
      })

      console.log(`Blogger ${bloggerId}: contador atual ${current}, novo contador ${newCount}, webhookIndicadoresSent: ${data.webhookIndicadoresSent}`)

      // Se atingiu 5 ou mais e ainda não enviamos o webhook, marcar e retornar true
      if (newCount >= 5 && !data.webhookIndicadoresSent) {
        tx.update(bloggerRef, {
          webhookIndicadoresSent: true,
          webhookIndicadoresSentAt: new Date().toISOString()
        })
        console.log(`Blogger ${bloggerId} atingiu meta de 5 indicados, marcando para enviar webhook e email`)
        return true
      }

      return false
    })

    // Se a transação indicou que devemos enviar o webhook (apenas uma vez), buscar dados atualizados e enviar
    if (shouldSendIndicatorWebhook) {
      try {
        const updatedBloggerSnap = await bloggerRef.get()
        const bloggerData = updatedBloggerSnap.exists ? updatedBloggerSnap.data() : {}
        console.log(`Enviando webhook para blogger ${bloggerId}`)
        await sendIndicatorWebhook(bloggerId, bloggerData)
        
        // Buscar dados pessoais do indicador na coleção "indicators"
        const indicatorRef = adminDb.collection("indicators").doc(bloggerId)
        const indicatorSnap = await indicatorRef.get()
        const indicatorData = indicatorSnap.exists ? indicatorSnap.data() : {}
        
        // Enviar email de prêmio desbloqueado se o indicador tiver email e nome
        if (indicatorData?.email && indicatorData?.name) {
          console.log(`Enviando email de prêmio para ${indicatorData.email} (${indicatorData.name})`)
          await sendIndicatorPrizeEmail({
            to: indicatorData.email,
            name: indicatorData.name
          })
          console.log(`Email de prêmio enviado com sucesso para ${indicatorData.email}`)
        } else {
          console.warn(`Indicador ${bloggerId} não tem email ou nome configurados na coleção indicators: email=${indicatorData?.email}, name=${indicatorData?.name}`)
        }
      } catch (err) {
        console.error('Erro ao enviar webhook de indicador:', err)
      }
    }
    
    // Enviar dados do voucher ativado para o webhook
    await sendVoucherActivatedWebhook({
      voucherId: docRef.id,
      code,
      customerName,
      customerEmail,
      customerPhone,
      bloggerId,
      store: validStore,
      qrCode
    })
    
    await sendVoucherEmail({
      to: customerEmail,
      name: customerName,
      code,
      voucherId: docRef.id,
    })
    return NextResponse.json({ voucherId: docRef.id, message: "Voucher criado e ativado com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro na API:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
} 