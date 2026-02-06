import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import nodemailer from "nodemailer";

function generatePassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, store, password } = await req.json();
    if (!name || !email || !phone || !store || !password) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }
    // Cria usuário no Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone.startsWith("+") ? phone : undefined,
    });
    // Salva dados na coleção 'indicators'
    await adminDb.collection("indicators").doc(userRecord.uid).set({
      name,
      email,
      phone,
      store,
      uid: userRecord.uid,
      password,
      emailVerified: false,
      createdAt: new Date(),
    });
    // Envia email com credenciais e link
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    const domain = process.env.NEXT_PUBLIC_VOUCHER_DOMAIN;
    const verificationLink = `${domain}/verify-email?token=${userRecord.uid}`;
    const mailOptions = {
      from: `Marcia Castro Semijoias <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Confirme seu email - Marcia Castro Semijoias",
      html: `
        <div style="font-family: Arial, sans-serif; background: #fff; padding: 24px; border-radius: 8px; max-width: 480px; margin: auto;">
          <h2 style="color: #b91c1c;">Olá, ${name}!</h2>
          <p>Seu cadastro foi realizado com sucesso.</p>
          <p>Para acessar a plataforma, confirme seu email clicando no link abaixo:</p>
          <p style="margin: 24px 0;">
            <a href="${verificationLink}" style="display:inline-block;padding:12px 24px;background:#b91c1c;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Confirmar Email</a>
          </p>
          <p style="margin-top: 32px; color: #888; font-size: 13px;">Este link é válido por tempo limitado. Se você não solicitou este cadastro, ignore este email.</p>
          <hr style="margin: 24px 0;" />
          <p style="font-size: 12px; color: #aaa;">Dúvidas? Fale conosco pelo WhatsApp ou Instagram.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true, indicatorId: userRecord.uid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao cadastrar indicador." }, { status: 500 });
  }
} 