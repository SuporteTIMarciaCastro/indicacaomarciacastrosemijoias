import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    // Buscar todos os indicadores
    const bloggersSnapshot = await adminDb.collection("bloggers").get();
    const bloggers = bloggersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    let updatedCount = 0;
    
    // Para cada indicador, calcular e atualizar os contadores
    for (const blogger of bloggers) {
      try {
        // Contar vouchers totais para este indicador
        const voucherSnapshot = await adminDb.collection("vouchers")
          .where("bloggerId", "==", blogger.id)
          .count()
          .get();
        
        const totalVouchers = voucherSnapshot.data().count || 0;
        
        // Contar vouchers ativados para este indicador
        const activatedSnapshot = await adminDb.collection("vouchers")
          .where("bloggerId", "==", blogger.id)
          .where("ativado", "==", true)
          .count()
          .get();
        
        const activatedVouchers = activatedSnapshot.data().count || 0;
        
        // Atualizar o documento do indicador
        await adminDb.collection("bloggers").doc(blogger.id).update({
          voucherCount: totalVouchers,
          quantIndicadosAtivados: activatedVouchers
        });
        
        updatedCount++;
        console.log(`Contadores atualizados para ${blogger.name}: ${totalVouchers} vouchers totais, ${activatedVouchers} ativados`);
      } catch (error) {
        console.error(`Erro ao atualizar contadores para ${blogger.id}:`, error);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `${updatedCount} indicadores tiveram seus contadores atualizados`,
      updatedCount 
    });
  } catch (error) {
    console.error("Erro ao inicializar contadores:", error);
    return NextResponse.json({ error: "Erro ao inicializar contadores" }, { status: 500 });
  }
}
