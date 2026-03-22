import { NextResponse } from 'next/server';
import { AnalysisResult } from '@/lib/types';
import { mockAnalysisResult } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcription, studentId, handwritingImage } = body;
    
    if (!transcription) {
      return NextResponse.json({ error: "Aucune transcription fournie" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    // Fallback: Si pas de clé structurée ou clé example, on renvoie les résultats mockés
    if (!apiKey || apiKey === "sk-ant-your-anthropic-key") {
      console.log("Utilisation de l'analyse mockée (Anthropic API Key manquante)");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json<AnalysisResult>({
        ...mockAnalysisResult,
        studentId: studentId || "1",
        date: new Date().toISOString()
      });
    }

    // Gestion de l'image (si fournie)
    let imageBlock = null;
    if (handwritingImage) {
      // expected format: data:image/png;base64,iVBORw0KGgo...
      const matches = handwritingImage.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (matches) {
        imageBlock = {
          type: "image",
          source: {
            type: "base64",
            media_type: matches[1],
            data: matches[2]
          }
        };
      }
    }

    // Création du prompt multimodal
    const promptText = `Voici une transcription textuelle de la lecture ou de l'expression orale d'un élève :
"${transcription}"

${imageBlock ? "De plus, tu disposes d'une photo d'un échantillon d'écriture manuscrite de ce même enfant.\n" : ""}
Tu dois analyser ces éléments pour identifier d'éventuels marqueurs de troubles d'apprentissage sur ces axes :
1. Phonologie (Dyslexie) : inversions, substitutions, confusions de sons à l'oral.
2. Morphosyntaxe (Dysphasie) : accords, conjugaisons, structure globale.
3. Fluence (Anxiété / TDAH) : répétitions, mots coupés, pauses atypiques.
${imageBlock ? "4. Grapho-moteur (Dysgraphie) : à partir de la photo, analyse l'irrégularité des lettres, le respect des lignes, les ratures et la lisibilité globale.\n" : ""}
Renvoie UNIQUEMENT un objet JSON valide avec la structure exacte suivante (n'ajoute aucun markdown ou retour à la ligne hors JSON) :
{
  "globalRiskLevel": "Sain" | "Risque Modéré" | "Risque Élevé",
  "markers": [
    {
      "name": "Dyslexie (Phonologie)",
      "score": number,
      "details": ["observation 1"]
    },
    {
      "name": "Dysphasie (Morphosyntaxe)",
      "score": number,
      "details": []
    },
    {
      "name": "Fluence / Anxiété",
      "score": number,
      "details": []
    }${imageBlock ? `,
    {
      "name": "Dysgraphie (Grapho-moteur)",
      "score": number,
      "details": ["observation sur l'écriture"]
    }` : ""}
  ],
  "recommendations": ["recommandation 1", "recommandation 2"]
}`;

    let messageContent: any[] = [];
    if (imageBlock) {
      messageContent.push(imageBlock);
    }
    messageContent.push({
      type: "text",
      text: promptText
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6', // Claude Sonnet 4.6 - latest model with vision support
        max_tokens: 1000,
        temperature: 0,
        messages: [
          { role: 'user', content: messageContent }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur Anthropic:", errorText);
      throw new Error("Erreur de l'API Anthropic lors de l'analyse multimodale");
    }

    const data = await response.json();
    let analysisOutput;
    
    try {
      const textResponse = data.content[0].text;
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      analysisOutput = JSON.parse(jsonMatch ? jsonMatch[0] : textResponse);
    } catch {
      console.error("Impossible de parser le JSON de Claude:", data.content[0].text);
      throw new Error("Réponse d'analyse invalide");
    }

    const result: AnalysisResult = {
      id: `res-${Date.now()}`,
      studentId: studentId || "1",
      date: new Date().toISOString(),
      globalRiskLevel: analysisOutput.globalRiskLevel,
      transcription: transcription,
      markers: analysisOutput.markers,
      recommendations: analysisOutput.recommendations,
    };
    
    return NextResponse.json<AnalysisResult>(result);
    
  } catch (error) {
    console.error("Erreur dans '/api/analyze':", error);
    return NextResponse.json({ error: "Erreur interne au traitement IA" }, { status: 500 });
  }
}
