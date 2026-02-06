import { type NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import nodemailer from "nodemailer"

async function sendVoucherEmail({ to, name, code }: { to: string; name: string; code: string }) {
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
    subject: "Seu Cupom de Desconto - Marcia Castro Semijoias",
    html: `
      <div style="font-family: Arial, sans-serif; background: #fff; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto;">
        <h2 style="color: #b91c1c;">Olá, ${name}!</h2>
        <p>Parabéns, seu voucher foi ativado com sucesso.</p>
        <p style="font-size: 18px; margin: 24px 0;">
          <strong style="color: #b91c1c; font-size: 32px; letter-spacing: 2px;">${code}</strong>
        </p>
        <p>Use este código para ganhar <b>Uma semijoia surpresa</b> em compras acima de <b>R$ 100</b> na Marcia Castro Semijoias.</p>
        <p style="margin-top: 32px; color: #888; font-size: 13px;">Cupom pessoal e intransferível. Válido para uma única utilização.</p>
        <hr style="margin: 24px 0;" />
        <p style="font-size: 12px; color: #aaa;">Dúvidas? Fale conosco pelo WhatsApp ou Instagram.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

// OBSOLETO: lógica migrada para /api/activate
