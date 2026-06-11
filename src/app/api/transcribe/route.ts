import { NextResponse } from 'next/server';
import { TranscriptionResult } from '@/lib/types';
import { mockAnalysisResult } from '@/lib/mock-data';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireUser, unauthorized } from '@/lib/api-auth';
import { checkRoute, rateLimited } from '@/lib/rate-limit';

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 Mo

export async function POST(request: Request) {
  try {
    if (!checkRoute(request, 'transcribe', 10)) return rateLimited();
    if (!(await requireUser(request))) return unauthorized();

    const formData = await request.formData();
    const audioContent = formData.get('audio') as Blob;

    if (!audioContent) {
      return NextResponse.json({ error: "Aucun fichier audio fourni" }, { status: 400 });
    }
    if (audioContent.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "Fichier audio trop volumineux (25 Mo max)" }, { status: 413 });
    }
    if (audioContent.type && !audioContent.type.startsWith('audio/') && !audioContent.type.startsWith('video/webm')) {
      return NextResponse.json({ error: "Format audio non supporté" }, { status: 415 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback: Si pas de clé ou clé exemple, on renvoie une transcription mockée
    if (!apiKey || apiKey === "your-gemini-api-key") {
      console.log("Utilisation de la transcription mockée (Gemini API Key manquante)");
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json<TranscriptionResult>({
        text: mockAnalysisResult.transcription
      });
    }

    // Convertir le Blob audio en base64
    const arrayBuffer = await audioContent.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // Appel à l'API Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }, { timeout: 60_000 });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'audio/webm',
          data: base64Audio,
        },
      },
      {
        text: "Transcris fidèlement ce fichier audio en français. Retourne uniquement le texte transcrit, sans commentaires ni ponctuation ajoutée artificiellement.",
      },
    ]);

    const transcription = result.response.text();

    return NextResponse.json<TranscriptionResult>({ text: transcription });

  } catch (error) {
    console.error("Erreur dans '/api/transcribe':", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
