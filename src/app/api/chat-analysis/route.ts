import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, analysis } = await request.json();

    // Vérifications de sécurité pour éviter les erreurs undefined
    if (!analysis) {
      return NextResponse.json(
        { error: 'Données d\'analyse manquantes' },
        { status: 400 }
      );
    }

    // Extraction sécurisée des données avec fallbacks
    const scores = analysis.scores || {};
    const skinAge = analysis.skinAge || 'Non déterminé';
    const insights = analysis.insights || [];
    
    // Gestion sécurisée des routines avec la nouvelle structure
    const morningSteps = analysis.routine?.morning?.steps || [];
    const eveningSteps = analysis.routine?.evening?.steps || [];
    
    const morningRoutine = Array.isArray(morningSteps) ? morningSteps.join('\n') : 'Routine non disponible';
    const eveningRoutine = Array.isArray(eveningSteps) ? eveningSteps.join('\n') : 'Routine non disponible';

    // Construction du contexte pour le chat
    const context = `
ANALYSE DE PEAU UTILISATEUR:
- Scores: Hydratation ${scores.hydration || 'N/A'}/5, Sébum ${scores.sebum || 'N/A'}/5, Texture ${scores.texture || 'N/A'}/5, Uniformité ${scores.evenness || 'N/A'}/5, Tolérance ${scores.tolerance || 'N/A'}/5
- Âge de peau estimé: ${skinAge} ans
- Insights principaux: ${insights.length > 0 ? insights.join(', ') : 'Aucun insight spécifique'}

ROUTINE PERSONNALISÉE:
Matin:
${morningRoutine}

Soir:
${eveningRoutine}

Tu es un expert en skincare qui aide l'utilisateur avec des conseils personnalisés basés sur son analyse. Sois bienveillant, précis et orienté solutions. Utilise les données ci-dessus pour contextualiser tes réponses.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: context
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.';

    return NextResponse.json({ response: reply });

  } catch (error) {
    console.error('Erreur API chat-analysis:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de votre message' },
      { status: 500 }
    );
  }
}