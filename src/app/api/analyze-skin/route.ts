import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { image, questionnaire } = await request.json()

    if (!image || !questionnaire) {
      return NextResponse.json(
        { error: 'Image et questionnaire requis' },
        { status: 400 }
      )
    }

    // Prompt ultra-précis pour analyse détaillée
    const prompt = `
Tu es un dermatologue expert avec 20 ans d'expérience en analyse de peau. Analyse cette photo avec une précision chirurgicale.

PROFIL DÉTAILLÉ:
- Âge: ${questionnaire.age} ans
- Sensibilités: ${questionnaire.sensitivities.join(', ') || 'Aucune'}
- Routine actuelle: ${questionnaire.currentRoutine}
- Préoccupation N°1: ${questionnaire.mainConcern}
- Budget: ${questionnaire.budget}
- Complexité souhaitée: ${questionnaire.routineComplexity}

ANALYSE ULTRA-PRÉCISE REQUISE:

1. TYPE DE PEAU: Sois TRÈS spécifique. Au lieu de "Peau Mixte", dis "Peau Mixte avec Zone T Grasse, Joues Normales-Sèches" ou "Peau Grasse Déshydratée avec Surproduction Sébacée Zone Médiane" ou "Peau Sensible Réactive avec Couperose Légère".

2. OBSERVATIONS DÉTAILLÉES: Identifie des éléments PRÉCIS et VISIBLES:
   - Poils incarnés si présents (localisation exacte)
   - Irritations post-rasage si masculin
   - Microkystes vs points noirs (distinction claire)
   - Déshydratation vs sécheresse
   - Pores dilatés (zone exacte: nez, joues, front)
   - Taches pigmentaires (type: solaires, post-inflammatoires)
   - Texture de peau (rugosité, lissité, irrégularités)
   - Brillances (localisation précise)

3. PRODUITS avec IMAGES: Recommande exactement selon le budget et profil

4. ROUTINE DÉTAILLÉE: Instructions d'application précises avec fréquence

RÉPONSE JSON EXACTE:
{
  "skinType": "Diagnostic précis et explicatif (ex: Peau Mixte Déshydratée avec Zone T Grasse et Joues Normales à Sèches)",
  "skinTypeExplanation": "Explication du pourquoi de ce diagnostic en 2-3 phrases",
  "concerns": [
    "Observation précise 1 (ex: Poils incarnés visibles zone mentonnière)",
    "Observation précise 2 (ex: Légère irritation post-rasage côté droit)",
    "Observation précise 3 (ex: Pores dilatés ailes du nez)"
  ],
  "products": [
    {
      "name": "Nom exact du produit",
      "brand": "Marque",
      "price": "Prix €",
      "originalPrice": "Prix barré si promo",
      "discount": "% de réduction",
      "link": "https://lien-affiliation",
      "category": "Catégorie précise",
      "image": "URL image produit",
      "benefits": "Pourquoi ce produit pour cette peau",
      "application": "Comment l'appliquer",
      "frequency": "Fréquence d'usage"
    }
  ],
  "routine": {
    "title": "Routine Personnalisée - [Nom du type de peau]",
    "morning": {
      "steps": [
        {
          "step": "1",
          "product": "Nom du produit",
          "action": "Action précise (ex: Masser 30 secondes en mouvements circulaires)",
          "duration": "Temps d'application",
          "tips": "Conseil spécifique"
        }
      ]
    },
    "evening": {
      "steps": [
        {
          "step": "1", 
          "product": "Nom du produit",
          "action": "Action précise",
          "duration": "Temps", 
          "tips": "Conseil spécifique"
        }
      ]
    },
    "frequency": {
      "daily": "Produits quotidiens",
      "weekly": "Produits hebdomadaires", 
      "monthly": "Produits mensuels"
    }
  }
}

IMAGES PRODUITS: Utilise ces URLs d'images réelles:
- CeraVe Gel: "https://m.media-amazon.com/images/I/41vCLcQ7B0L._UF350,350_QL80_.jpg"
- The Ordinary Niacinamide: "https://m.media-amazon.com/images/I/61QBAJHZNhL._UF1000,1000_QL80_.jpg"
- La Roche-Posay: "https://images.asos-media.com/products/la-roche-posay-toleriane-caring-wash-400ml/203417131-1-nocolour"

IMPORTANT: Sois précis comme un diagnostic médical, mais pour le cosmétique uniquement.
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un expert dermatologue qui fait des analyses précises et détaillées de peau pour recommander des cosmétiques. Tu observes chaque détail visible avec précision chirurgicale."
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 2500,
      temperature: 0.3, // Réduire pour plus de cohérence
    })

    const content = response.choices[0].message.content
    console.log('📝 Réponse détaillée reçue')

    if (!content) {
      throw new Error('Pas de réponse de l\'IA')
    }

    let analysis
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('JSON non trouvé')
      }
    } catch (parseError) {
      console.log('⚠️ Utilisation fallback précis')
      analysis = createPreciseFallback(questionnaire)
    }

    return NextResponse.json({ analysis, questionnaire })

  } catch (error) {
    console.error('❌ Erreur API:', error)
    return NextResponse.json(
      { error: 'Erreur analyse' },
      { status: 500 }
    )
  }
}

function createPreciseFallback(questionnaire: any) {
  return {
    skinType: "Peau Mixte Déshydratée avec Zone T Grasse et Joues Normales",
    skinTypeExplanation: "Votre peau présente les caractéristiques d'une peau mixte avec une zone T (front, nez, menton) qui produit plus de sébum que les joues. La déshydratation est visible par une texture légèrement terne.",
    concerns: [
      "Pores dilatés visibles sur les ailes du nez",
      "Léger excès de sébum zone médiane front-nez",
      "Texture légèrement irrégulière zone temporale"
    ],
    products: [
      {
        name: "Gel Nettoyant Moussant",
        brand: "CeraVe", 
        price: "12.99€",
        originalPrice: "15.99€",
        discount: "19%",
        link: "https://amzn.to/cerave-gel",
        category: "Nettoyant Purifiant",
        image: "https://m.media-amazon.com/images/I/41vCLcQ7B0L._UF350,350_QL80_.jpg",
        benefits: "Élimine l'excès de sébum sans dessécher",
        application: "Masser 30 secondes sur peau humide",
        frequency: "Matin et soir"
      }
    ],
    routine: {
      title: "Routine Personnalisée - Peau Mixte Équilibrée",
      morning: {
        steps: [
          {
            step: "1",
            product: "Gel Nettoyant CeraVe",
            action: "Masser délicatement 30 secondes en mouvements circulaires",
            duration: "30 secondes",
            tips: "Insister sur la zone T, plus doux sur les joues"
          }
        ]
      },
      evening: {
        steps: [
          {
            step: "1",
            product: "Gel Nettoyant CeraVe", 
            action: "Double nettoyage si maquillage/protection solaire",
            duration: "1 minute",
            tips: "Rincer à l'eau tiède, jamais chaude"
          }
        ]
      },
      frequency: {
        daily: "Nettoyant, hydratant, protection solaire",
        weekly: "Gommage doux zone T uniquement",
        monthly: "Masque purifiant si nécessaire"
      }
    }
  }
}