import { NextResponse } from 'next/server';
import { AudioMetadata } from '@/lib/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioContent = formData.get('audio') as Blob;

    if (!audioContent) {
      return NextResponse.json({ error: "Aucun fichier audio fourni" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback si pas de clé
    if (!apiKey || apiKey === 'your-gemini-api-key') {
      return NextResponse.json<AudioMetadata>({
        totalDurationMs: 45000,
        pauseCount: 8,
        averagePauseDurationMs: 1200,
        maxPauseDurationMs: 3500,
        wordsPerMinute: 85,
        silenceRatio: 0.25,
        pitchVariance: 'normal',
        rhythmRegularity: 'regular',
        speechRate: 'normal',
      });
    }

    const arrayBuffer = await audioContent.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'audio/webm',
          data: base64Audio,
        },
      },
      {
        text: `Analyse cet enregistrement audio d'un enfant qui parle ou lit en français.

Extrais les caractéristiques temporelles et prosodiques suivantes.

Renvoie UNIQUEMENT un objet JSON valide (pas de markdown) avec cette structure exacte :
{
  "totalDurationMs": number (durée totale en millisecondes),
  "pauseCount": number (nombre de pauses silencieuses > 500ms),
  "averagePauseDurationMs": number (durée moyenne des pauses en ms),
  "maxPauseDurationMs": number (durée de la plus longue pause en ms),
  "wordsPerMinute": number (estimation du nombre de mots par minute),
  "silenceRatio": number (ratio silence/parole entre 0 et 1),
  "pitchVariance": "low" | "normal" | "high" (low = voix monotone, high = très variable),
  "rhythmRegularity": "regular" | "irregular" | "very_irregular",
  "speechRate": "slow" | "normal" | "fast" (relatif à un enfant du même âge)
}

Sois aussi précis que possible dans tes estimations. Les valeurs exactes importent moins que les ordres de grandeur et les catégories qualitatives.`,
      },
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('Impossible de parser les features audio:', responseText);
      return NextResponse.json({ error: 'Réponse audio invalide' }, { status: 500 });
    }

    const audioMetadata: AudioMetadata = JSON.parse(jsonMatch[0]);
    return NextResponse.json<AudioMetadata>(audioMetadata);

  } catch (error) {
    console.error("Erreur extraction audio:", error);
    return NextResponse.json({ error: "Erreur interne extraction audio" }, { status: 500 });
  }
}
