import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

interface BloggerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
  password?: string;
  voucherCount?: number;
}

export async function GET(request: NextRequest) {
  try {
    const snapshot = await adminDb.collection("bloggers").get();
    const bloggers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BloggerData[];
    
    // Se o campo voucherCount não existir no documento, calcular e atualizar
    const bloggersWithCounts = await Promise.all(
      bloggers.map(async (blogger) => {
        // Se já tem o contador, usar ele
        if (typeof blogger.voucherCount === 'number') {
          return blogger;
        }
        
        // Se não tem, calcular e atualizar o documento
        try {
          const voucherSnapshot = await adminDb.collection("vouchers")
            .where("bloggerId", "==", blogger.id)
            .count()
            .get();
          
          const count = voucherSnapshot.data().count || 0;
          
          // Atualizar o documento do indicador com o contador
          await adminDb.collection("bloggers").doc(blogger.id).update({
            voucherCount: count
          });
          
          return {
            ...blogger,
            voucherCount: count
          };
        } catch (error) {
          console.error(`Erro ao contar vouchers para ${blogger.id}:`, error);
          return {
            ...blogger,
            voucherCount: 0
          };
        }
      })
    );
    
    return NextResponse.json({ bloggers: bloggersWithCounts });
  } catch (error) {
    console.error("Erro ao buscar indicadors:", error);
    return NextResponse.json({ error: "Erro ao buscar indicadors" }, { status: 500 });
  }
} 