import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

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
    const { name, email, phone, instagram } = await req.json();
    if (!name || !email || !phone || !instagram) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }
    // Gera senha aleatória
    const password = generatePassword();
    // Cria usuário no Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone.startsWith("+") ? phone : undefined,
    });
    // Salva dados na coleção 'bloggers'
    await adminDb.collection("bloggers").doc(userRecord.uid).set({
      name,
      email,
      phone,
      instagram,
      uid: userRecord.uid,
      password, // Salva a senha gerada
      quantIndicadosAtivados: 0, // Inicializar contador
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true, password });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erro ao cadastrar indicador." }, { status: 500 });
  }
} 