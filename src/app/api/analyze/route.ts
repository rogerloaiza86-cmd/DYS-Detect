import { NextResponse } from 'next/server';
import { AnalysisResult, AnalysisMode, AudioMetadata } from '@/lib/types';
import { mockAnalysisResult } from '@/lib/mock-data';
import { buildAnalysisPrompt } from '@/lib/prompts/builder';
import { getReferenceProfiles, formatProfilesForPrompt } from '@/lib/reference-profiles';
import { extractTextFeatures, extractAudioFeatures, extractTDAHSubtypeFeatures } from '@/lib/features';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      transcription,
      studentId,
      handwritingImage,
      analysisMode = 'dictee' as AnalysisMode,
      referenceText,
      audioMetadata,
      studentAge,
      topic,
      questions,
    } = body;

    if (!transcription) {
      return NextResponse.json({ error: "Aucune transcription fournie" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Fallback mock
    if (!apiKey || apiKey === "sk-ant-your-anthropic-key") {
      console.log("Utilisation de l'analyse mockée (Anthropic API Key manquante)");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return NextResponse.json<AnalysisResult>({
        ...mockAnalysisResult,
        studentId: studentId || "1",
        date: new Date().toISOString(),
        analysisMode,
      });
    }

    // Gestion de l'image
    let imageBlock = null;
    if (handwritingImage) {
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

    // Extract objective features algorithmically
    const parsedAudioMetadata = audioMetadata as AudioMetadata | undefined;
    const textFeatures = extractTextFeatures(transcription, referenceText || undefined);
    const audioFeatures = parsedAudioMetadata ? extractAudioFeatures(parsedAudioMetadata) : {};
    const tdahSubtypeFeatures = extractTDAHSubtypeFeatures(transcription, parsedAudioMetadata);
    const extractedFeatures = { ...textFeatures, ...audioFeatures, ...tdahSubtypeFeatures } as Record<string, number | null>;

    // Load reference profiles from labeled ULIS students
    let referenceProfilesText = '';
    try {
      const profiles = await getReferenceProfiles();
      if (profiles.length > 0) {
        referenceProfilesText = formatProfilesForPrompt(profiles);
      }
    } catch (e) {
      console.warn('Could not load reference profiles:', e);
    }

    // Construction du prompt via le builder modulaire
    const promptText = buildAnalysisPrompt({
      mode: analysisMode,
      transcription,
      referenceText,
      hasImage: !!imageBlock,
      audioMetadata: parsedAudioMetadata,
      studentAge,
      topic,
      questions,
      referenceProfilesText,
      extractedFeatures,
    });

    const messageContent: unknown[] = [];
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
        model: 'claude-sonnet-4-6',
        max_tokens: 2500,
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
      transcription,
      markers: analysisOutput.markers || [],
      recommendations: analysisOutput.recommendations || [],
      analysisMode,
      referenceText,
      audioMetadata,
      disorderScreening: analysisOutput.disorderScreening,
      ...(analysisOutput.tdahDominantSubtype != null && {
        tdahDominantSubtype: analysisOutput.tdahDominantSubtype,
      }),
    };

    return NextResponse.json<AnalysisResult>(result);

  } catch (error) {
    console.error("Erreur dans '/api/analyze':", error);
    return NextResponse.json({ error: "Erreur interne au traitement IA" }, { status: 500 });
  }
}
