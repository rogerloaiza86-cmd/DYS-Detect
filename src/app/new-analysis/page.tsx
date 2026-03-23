"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AudioRecorder from '@/components/AudioRecorder';
import { getStudents, createStudent, saveResult, getResultById } from '@/lib/store';
import { Student, AnalysisMode, ANALYSIS_MODES, EXPRESSION_TOPICS, CONVERSATION_QUESTIONS, AudioMetadata } from '@/lib/types';
import { TEXTS_BANK, ReferenceText, GradeLevel, TextTarget } from '@/lib/texts-bank';
import Link from 'next/link';
import { Upload, X } from 'lucide-react';

// Compresses an image to max 1200px width and JPEG quality 0.7
function compressImage(dataUrl: string, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

const DEFAULT_DICTATION = "Le petit chat boit son lait dans la cuisine.";

const GRADE_LEVELS: GradeLevel[] = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6eme', '5eme', '4eme'];
const TEXT_TARGETS: { value: TextTarget | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'DYS', label: 'DYS' },
  { value: 'TDAH', label: 'TDAH' },
  { value: 'TSA', label: 'TSA' },
  { value: 'general', label: 'Général' },
];

const DIFFICULTY_STARS: Record<string, number> = { facile: 1, moyen: 2, difficile: 3 };
const DIFFICULTY_COLORS: Record<string, string> = {
  facile: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  moyen: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  difficile: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};
const TARGET_COLORS: Record<string, string> = {
  DYS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  TDAH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  TSA: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  general: 'bg-surface-container-highest text-on-surface-variant',
};

// ─── Inner component (uses useSearchParams) ───────────────────────────────────

function NewAnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNewStudentForm, setShowNewStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', grade: '', age: '' });

  // Multi-mode state
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('dictee');
  const [referenceText, setReferenceText] = useState(DEFAULT_DICTATION);
  const [customReferenceText, setCustomReferenceText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(EXPRESSION_TOPICS[0].label);
  const [conversationStep, setConversationStep] = useState(0);
  const [isConversationActive, setIsConversationActive] = useState(false);

  // Texts bank filters
  const [gradeFilter, setGradeFilter] = useState<GradeLevel | 'all'>('all');
  const [targetFilter, setTargetFilter] = useState<TextTarget | 'all'>('all');
  const [selectedBankText, setSelectedBankText] = useState<ReferenceText | null>(null);

  // Steps: 1: Capture, 2: Transcription, 3: Extraction audio, 4: Analyse IA
  const [currentStep, setCurrentStep] = useState(1);
  const [processingLabel, setProcessingLabel] = useState('');

  // Réévaluation mode
  const [reevaluationId, setReevaluationId] = useState<string | null>(null);
  const [reevaluationDate, setReevaluationDate] = useState<string | null>(null);

  useEffect(() => {
    getStudents().then(setStudents);
  }, []);

  // Handle reevaluation param
  useEffect(() => {
    const reevalParam = searchParams.get('reevaluation');
    if (!reevalParam) return;

    getResultById(reevalParam).then((result) => {
      if (!result) return;
      setReevaluationId(result.id);
      setReevaluationDate(new Date(result.date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
      }));

      // Pre-select same analysis mode
      if (result.analysisMode) {
        setAnalysisMode(result.analysisMode);
      }

      // Pre-fill reference text for dictee mode
      if ((result.analysisMode === 'dictee' || result.analysisMode === 'lecture_libre') && result.referenceText) {
        setReferenceText(result.referenceText);
        // Try to find matching bank text
        const match = TEXTS_BANK.find(t => t.text === result.referenceText);
        if (match) {
          setSelectedBankText(match);
        }
      }
    });
  }, [searchParams]);

  const currentModeConfig = ANALYSIS_MODES.find(m => m.id === analysisMode)!;
  const currentStudentObj = students.find(s => s.id === selectedStudent);

  // Filtered texts
  const filteredTexts = TEXTS_BANK.filter(t => {
    const gradeOk = gradeFilter === 'all' || t.gradeLevel.includes(gradeFilter as GradeLevel);
    const targetOk = targetFilter === 'all' || t.targets.includes(targetFilter as TextTarget);
    return gradeOk && targetOk;
  });

  const handleSelectChange = (value: string) => {
    if (value === 'new') {
      setShowNewStudentForm(true);
    } else {
      setSelectedStudent(value);
      setShowNewStudentForm(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.grade || !newStudent.age) return;
    const age = parseInt(newStudent.age, 10);
    if (age < 3 || age > 18) {
      alert("L'âge doit être compris entre 3 et 18 ans.");
      return;
    }
    const student = await createStudent(
      newStudent.firstName.trim(),
      newStudent.lastName.trim(),
      newStudent.grade.trim(),
      age
    );
    const updated = await getStudents();
    setStudents(updated);
    setSelectedStudent(student.id);
    setShowNewStudentForm(false);
    setNewStudent({ firstName: '', lastName: '', grade: '', age: '' });
  };

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
  };

  const handleResetRecording = () => {
    setRecordedBlob(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleModeChange = (mode: AnalysisMode) => {
    setAnalysisMode(mode);
    setRecordedBlob(null);
    setImageFile(null);
    setImagePreview(null);
    setConversationStep(0);
    setIsConversationActive(false);
    setSelectedBankText(null);
    if (mode === 'dictee') {
      setReferenceText(DEFAULT_DICTATION);
    }
  };

  const handleSelectBankText = (text: ReferenceText) => {
    setSelectedBankText(text);
    setReferenceText(text.text);
    setCustomReferenceText('');
  };

  const handleAnalyze = async () => {
    if (!recordedBlob || !selectedStudent) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setCurrentStep(2);
    setProcessingLabel('Transcription en cours...');

    try {
      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append('audio', recordedBlob);
      formData.append('studentId', selectedStudent);

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      const transcribeData = await transcribeRes.json();
      if (transcribeData.error) throw new Error(transcribeData.error);

      // Step 2: Extract audio features (parallel-safe, for TDAH/TSA modes)
      setCurrentStep(3);
      setProcessingLabel('Extraction des caractéristiques audio...');

      let audioMetadata: AudioMetadata | undefined;
      if (analysisMode !== 'dictee') {
        try {
          const audioFormData = new FormData();
          audioFormData.append('audio', recordedBlob);
          const audioRes = await fetch('/api/extract-audio-features', {
            method: 'POST',
            body: audioFormData,
          });
          if (audioRes.ok) {
            audioMetadata = await audioRes.json();
          }
        } catch (e) {
          console.warn('Audio feature extraction failed, continuing without:', e);
        }
      }

      // Step 3: Analyze with Claude
      setCurrentStep(4);
      setProcessingLabel('Analyse IA multi-troubles...');

      let compressedImage = imagePreview;
      if (imagePreview) {
        compressedImage = await compressImage(imagePreview);
      }

      const effectiveRefText = analysisMode === 'dictee' ? referenceText
        : analysisMode === 'lecture_libre' ? (customReferenceText || referenceText)
        : undefined;

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: transcribeData.text,
          studentId: selectedStudent,
          handwritingImage: compressedImage,
          analysisMode,
          referenceText: effectiveRefText,
          audioMetadata,
          studentAge: currentStudentObj?.age,
          topic: analysisMode === 'expression_libre' ? selectedTopic : undefined,
          questions: analysisMode === 'conversation_guidee' ? CONVERSATION_QUESTIONS : undefined,
        })
      });
      const analysisData = await analyzeRes.json();
      if (analysisData.error) throw new Error(analysisData.error);

      const finalAnalysis = {
        ...analysisData,
        handwritingImage: imagePreview,
        audioMetadata,
      };

      await saveResult(finalAnalysis);

      // Pass reevaluationId as query param if in reevaluation mode
      const resultsUrl = reevaluationId
        ? `/results/${analysisData.id}?reevaluationId=${reevaluationId}`
        : `/results/${analysisData.id}`;
      router.push(resultsUrl);

    } catch (error) {
      console.error("Error during analysis:", error);
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue lors de l'analyse.");
      setIsProcessing(false);
      setCurrentStep(1);
    }
  };

  // Determine the effective reference text for display
  const displayedReferenceText = analysisMode === 'dictee' ? referenceText
    : analysisMode === 'lecture_libre' ? (customReferenceText || referenceText)
    : null;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">
          Nouvelle Analyse {currentStudentObj ? `- ${currentStudentObj.firstName} ${currentStudentObj.lastName}` : ''}
        </h1>
        <p className="text-on-surface-variant mt-1 font-body">Analyse multi-troubles : DYS, TDAH, TSA</p>
      </div>

      {/* Reevaluation Banner */}
      {reevaluationId && reevaluationDate && (
        <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
          <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl shrink-0">compare_arrows</span>
          <div>
            <p className="font-headline font-bold text-blue-700 dark:text-blue-300 text-sm">
              Mode Réévaluation
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-sm font-body">
              Comparaison avec l&apos;analyse du {reevaluationDate}. Le mode et le texte de référence ont été pré-sélectionnés.
            </p>
          </div>
        </div>
      )}

      {/* Mode Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ANALYSIS_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode.id)}
            disabled={isProcessing}
            className={`relative p-4 rounded-xl border-2 transition-all text-left group ${
              analysisMode === mode.id
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30 hover:bg-primary/3'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className={`material-symbols-outlined text-2xl ${analysisMode === mode.id ? 'text-primary' : 'text-on-surface-variant'}`}>
                {mode.icon}
              </span>
              <span className={`font-headline font-bold text-sm ${analysisMode === mode.id ? 'text-primary' : 'text-on-surface'}`}>
                {mode.label}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed">{mode.description}</p>
            <div className="flex gap-1 mt-3">
              {mode.bestFor.map(d => (
                <span key={d} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  d === 'DYS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : d === 'TDAH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                }`}>{d}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {[
          { n: 1, label: 'Capture' },
          { n: 2, label: 'Transcription' },
          ...(analysisMode !== 'dictee' ? [{ n: 3, label: 'Audio Features' }] : []),
          { n: analysisMode !== 'dictee' ? 4 : 3, label: 'Analyse IA' },
        ].map((step, i, arr) => (
          <div key={step.n} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 transition-opacity ${currentStep >= step.n ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-headline font-bold text-sm transition-colors ${currentStep >= step.n ? 'bg-primary text-on-primary shadow-md shadow-primary/20' : 'bg-surface-container-highest text-on-surface-variant'}`}>{i + 1}</div>
              <span className={`font-headline font-bold text-xs transition-colors ${currentStep >= step.n ? 'text-primary' : ''}`}>{step.label}</span>
            </div>
            {i < arr.length - 1 && <div className={`h-px w-8 bg-outline-variant transition-opacity ${currentStep > step.n ? 'opacity-100' : 'opacity-30'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Card */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 md:p-10 flex flex-col gap-8 shadow-sm border border-outline-variant/10 relative overflow-hidden min-h-[480px]">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Mode-specific content */}
          <div className="relative z-10 w-full">
            {/* DICTÉE: show reference sentence + bank */}
            {analysisMode === 'dictee' && (
              <div className="space-y-4">
                <span className="font-headline uppercase tracking-widest text-primary font-bold text-sm bg-primary/5 px-4 py-1.5 rounded-full">Texte de Référence</span>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value as GradeLevel | 'all')}
                    className="text-xs px-3 py-1.5 rounded-lg border border-outline-variant/30 bg-surface text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">Tous niveaux</option>
                    {GRADE_LEVELS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <div className="flex gap-1 flex-wrap">
                    {TEXT_TARGETS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setTargetFilter(t.value as TextTarget | 'all')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          targetFilter === t.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/30'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text list */}
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                  {filteredTexts.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectBankText(t)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        selectedBankText?.id === t.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-outline-variant/20 hover:border-primary/30 hover:bg-surface-variant/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold text-sm text-on-surface">{t.title}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[t.difficulty]}`}>
                            {'★'.repeat(DIFFICULTY_STARS[t.difficulty])}{'☆'.repeat(3 - DIFFICULTY_STARS[t.difficulty])}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-body">{t.wordCount} mots</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                          {t.gradeLevel.join(' · ')}
                        </span>
                        {t.targets.map(tgt => (
                          <span key={tgt} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TARGET_COLORS[tgt] || TARGET_COLORS.general}`}>
                            {tgt}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {t.phonologicalFeatures.slice(0, 3).map(f => (
                          <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-outline-variant/10 text-on-surface-variant font-body">
                            {f.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {t.phonologicalFeatures.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-outline-variant/10 text-on-surface-variant font-body">
                            +{t.phonologicalFeatures.length - 3}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  {filteredTexts.length === 0 && (
                    <p className="text-sm text-on-surface-variant italic text-center py-4">Aucun texte pour ces filtres.</p>
                  )}
                </div>

                {/* Selected text display */}
                {selectedBankText && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-bold text-sm text-primary">{selectedBankText.title}</span>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span>{selectedBankText.wordCount} mots</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${DIFFICULTY_COLORS[selectedBankText.difficulty]}`}>
                          {'★'.repeat(DIFFICULTY_STARS[selectedBankText.difficulty])} {selectedBankText.difficulty}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed font-body italic">&quot;{referenceText}&quot;</p>
                    {selectedBankText.notes && (
                      <p className="text-xs text-on-surface-variant font-body border-t border-primary/10 pt-2">
                        <span className="font-bold">Note :</span> {selectedBankText.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Default display if no bank text selected */}
                {!selectedBankText && (
                  <div className="text-center py-4">
                    <p className="text-sm text-on-surface-variant font-body">Texte par défaut : &quot;{referenceText}&quot;</p>
                  </div>
                )}
              </div>
            )}

            {/* LECTURE LIBRE: text bank + custom input */}
            {analysisMode === 'lecture_libre' && (
              <div className="space-y-4">
                <span className="font-headline uppercase tracking-widest text-primary font-bold text-sm bg-primary/5 px-4 py-1.5 rounded-full">Texte de Lecture</span>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value as GradeLevel | 'all')}
                    className="text-xs px-3 py-1.5 rounded-lg border border-outline-variant/30 bg-surface text-on-surface font-body focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">Tous niveaux</option>
                    {GRADE_LEVELS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <div className="flex gap-1 flex-wrap">
                    {TEXT_TARGETS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setTargetFilter(t.value as TextTarget | 'all')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          targetFilter === t.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/30'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredTexts.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectBankText(t)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        selectedBankText?.id === t.id && !customReferenceText
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-outline-variant/20 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-sm text-on-surface truncate">{t.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${DIFFICULTY_COLORS[t.difficulty]}`}>
                          {'★'.repeat(DIFFICULTY_STARS[t.difficulty])}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <span>{t.gradeLevel.join('·')}</span>
                        <span>·</span>
                        <span>{t.wordCount} mots</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {t.phonologicalFeatures.slice(0, 2).map(f => (
                          <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-outline-variant/10 text-on-surface-variant font-body">
                            {f.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Ou collez votre propre texte ici..."
                  value={customReferenceText}
                  onChange={(e) => { setCustomReferenceText(e.target.value); setSelectedBankText(null); }}
                  className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface font-body text-sm min-h-[100px] focus:ring-2 focus:ring-primary/50 focus:outline-none"
                />

                {displayedReferenceText && (
                  <div className="p-4 bg-surface-variant/30 rounded-xl border border-outline-variant/10 space-y-2">
                    {selectedBankText && !customReferenceText && (
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span className="font-bold text-on-surface">{selectedBankText.title}</span>
                        <span>·</span>
                        <span>{selectedBankText.wordCount} mots</span>
                        <span className={`font-bold px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLORS[selectedBankText.difficulty]}`}>
                          {'★'.repeat(DIFFICULTY_STARS[selectedBankText.difficulty])} {selectedBankText.difficulty}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-on-surface leading-relaxed font-body italic">&quot;{displayedReferenceText}&quot;</p>
                  </div>
                )}
              </div>
            )}

            {/* EXPRESSION LIBRE: topic cards */}
            {analysisMode === 'expression_libre' && (
              <div className="space-y-4">
                <span className="font-headline uppercase tracking-widest text-primary font-bold text-sm bg-primary/5 px-4 py-1.5 rounded-full">Sujet de Discussion</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {EXPRESSION_TOPICS.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.label)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        selectedTopic === topic.label
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                          : 'border-outline-variant/20 hover:border-primary/30'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-2xl ${selectedTopic === topic.label ? 'text-primary' : 'text-on-surface-variant'}`}>{topic.icon}</span>
                      <span className="text-xs font-headline font-bold text-center">{topic.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CONVERSATION GUIDÉE: sequential prompts */}
            {analysisMode === 'conversation_guidee' && (
              <div className="space-y-4">
                <span className="font-headline uppercase tracking-widest text-primary font-bold text-sm bg-primary/5 px-4 py-1.5 rounded-full">Conversation Guidée</span>
                <p className="text-sm text-on-surface-variant font-body mt-2">
                  Posez chaque question à l&apos;élève, puis enregistrez l&apos;échange complet en une seule prise.
                </p>
                <div className="space-y-2 mt-4">
                  {CONVERSATION_QUESTIONS.map((q, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                        i === conversationStep && isConversationActive
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : i < conversationStep ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : 'border-outline-variant/20'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        i < conversationStep ? 'bg-green-500 text-white'
                        : i === conversationStep && isConversationActive ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {i < conversationStep ? '✓' : i + 1}
                      </div>
                      <span className="text-sm font-body text-on-surface">{q}</span>
                    </div>
                  ))}
                </div>
                {!isConversationActive && (
                  <button
                    onClick={() => { setIsConversationActive(true); setConversationStep(0); }}
                    className="mt-2 px-4 py-2 bg-primary/10 text-primary font-headline font-bold text-sm rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Commencer la conversation
                  </button>
                )}
                {isConversationActive && conversationStep < CONVERSATION_QUESTIONS.length && (
                  <button
                    onClick={() => setConversationStep(prev => prev + 1)}
                    className="mt-2 px-4 py-2 bg-primary text-on-primary font-headline font-bold text-sm rounded-lg hover:bg-primary-dim transition-colors"
                  >
                    {conversationStep < CONVERSATION_QUESTIONS.length - 1 ? 'Question suivante' : 'Terminer'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Audio + Image capture */}
          <div className="relative z-10 w-full flex flex-col md:flex-row gap-6">
            {/* Audio Recorder */}
            <div className={`flex flex-col items-center p-6 bg-surface rounded-2xl border border-outline-variant/20 shadow-sm ${currentModeConfig.supportsHandwriting ? 'flex-1' : 'w-full'}`}>
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">mic</span>
                <h3 className="font-headline font-bold text-on-surface">
                  {analysisMode === 'conversation_guidee' ? 'Enregistrer l\'échange' : 'Lecture orale'}
                </h3>
              </div>
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                isProcessing={isProcessing}
                hasRecorded={!!recordedBlob}
                onReset={handleResetRecording}
              />
            </div>

            {/* Handwriting Upload (only for modes that support it) */}
            {currentModeConfig.supportsHandwriting && (
              <div className="flex-1 flex flex-col items-center p-6 bg-surface rounded-2xl border border-outline-variant/20 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-secondary">draw</span>
                  <h3 className="font-headline font-bold text-on-surface">Écriture (Optionnel)</h3>
                </div>
                <div className="w-full h-full flex flex-col items-center justify-center min-h-[200px]">
                  {imagePreview ? (
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-outline-variant/30 group">
                      <img src={imagePreview} alt="Aperçu écriture" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={removeImage}
                          disabled={isProcessing}
                          className="w-10 h-10 rounded-full bg-error text-white flex items-center justify-center hover:bg-error-dim"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/50 rounded-xl cursor-pointer hover:bg-surface-variant/30 hover:border-primary/50 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
                        <Upload size={24} />
                      </div>
                      <span className="text-sm font-bold font-headline text-on-surface">Ajouter une photo</span>
                      <span className="text-xs text-on-surface-variant font-body mt-1">JPG, PNG, WEBP</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        capture="environment"
                        disabled={isProcessing}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Mode info */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-primary/10">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <span className="material-symbols-outlined">{currentModeConfig.icon}</span>
              <h3 className="font-headline font-bold text-lg">Mode : {currentModeConfig.label}</h3>
            </div>
            <p className="text-on-surface-variant leading-relaxed font-body text-sm">{currentModeConfig.description}</p>

            <div className="mt-4 p-3 bg-surface-container-low rounded-lg">
              <p className="text-xs font-headline font-bold text-on-surface-variant mb-2">Troubles analysés :</p>
              <div className="flex gap-2">
                {currentModeConfig.bestFor.map(d => (
                  <span key={d} className={`text-xs font-bold px-3 py-1 rounded-full ${
                    d === 'DYS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : d === 'TDAH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  }`}>{d}</span>
                ))}
                {/* DYS is always checked even if not primary */}
                {!currentModeConfig.bestFor.includes('DYS') && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-900/10 dark:text-blue-400">DYS (base)</span>
                )}
              </div>
            </div>

            {/* Selected text info (when bank text selected) */}
            {selectedBankText && (analysisMode === 'dictee' || analysisMode === 'lecture_libre') && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-xs font-headline font-bold text-on-surface-variant mb-1">Texte sélectionné :</p>
                <p className="text-sm font-bold text-on-surface">{selectedBankText.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-on-surface-variant">{selectedBankText.wordCount} mots</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[selectedBankText.difficulty]}`}>
                    {'★'.repeat(DIFFICULTY_STARS[selectedBankText.difficulty])} {selectedBankText.difficulty}
                  </span>
                </div>
              </div>
            )}

            {analysisMode !== 'dictee' && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800/30">
                <p className="text-xs text-orange-700 dark:text-orange-300 font-body">
                  <span className="font-bold">Nouveau :</span> Les caractéristiques audio (pauses, prosodie, débit) seront extraites automatiquement pour affiner le repérage des indicateurs TDAH/TSA.
                </p>
              </div>
            )}
          </div>

          {/* Student Selection */}
          <div className="bg-secondary-container/20 rounded-xl p-6 shadow-sm border border-secondary/10">
            <div className="flex items-center gap-3 mb-4 text-on-secondary-container">
              <span className="material-symbols-outlined">child_care</span>
              <h3 className="font-headline font-bold text-lg">Profil</h3>
            </div>

            <select
              value={selectedStudent}
              onChange={(e) => handleSelectChange(e.target.value)}
              className="w-full p-3 mb-4 rounded-xl border border-outline-variant/20 bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-body text-on-surface shadow-sm"
              disabled={isProcessing}
            >
              <option value="" disabled>Choisir un élève...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.grade})</option>
              ))}
              <option value="new">+ Ajouter un élève</option>
            </select>

            {showNewStudentForm ? (
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Prénom" value={newStudent.firstName} onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })} className="p-2.5 rounded-lg border border-outline-variant/30 text-sm w-full font-body focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  <input placeholder="Nom" value={newStudent.lastName} onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })} className="p-2.5 rounded-lg border border-outline-variant/30 text-sm w-full font-body focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  <input placeholder="Classe" value={newStudent.grade} onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })} className="p-2.5 rounded-lg border border-outline-variant/30 text-sm w-full font-body focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                  <input placeholder="Âge" type="number" min="3" max="18" value={newStudent.age} onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })} className="p-2.5 rounded-lg border border-outline-variant/30 text-sm w-full font-body focus:ring-2 focus:ring-primary/50 focus:outline-none" />
                </div>
                <button onClick={handleAddStudent} className="w-full bg-primary text-on-primary text-sm font-bold py-3 rounded-lg hover:bg-primary-dim transition-all">Créer</button>
              </div>
            ) : currentStudentObj ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-on-secondary-container/10 pb-2">
                  <span className="text-sm text-on-secondary-container/70">Classe</span>
                  <span className="text-sm font-bold text-on-secondary-container">{currentStudentObj.grade}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-on-secondary-container/70">Âge</span>
                  <span className="text-sm font-bold text-on-secondary-container">{currentStudentObj.age} ans</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant italic py-2">Sélectionnez ou créez un élève.</p>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-4 p-5 bg-error-container/20 border border-error/20 rounded-xl">
          <span className="material-symbols-outlined text-error text-2xl">error</span>
          <div className="flex-1">
            <p className="font-headline font-bold text-error text-sm">Erreur</p>
            <p className="text-on-surface-variant font-body text-sm mt-1">{errorMessage}</p>
          </div>
          <button
            onClick={() => { setErrorMessage(null); handleAnalyze(); }}
            className="flex items-center gap-2 px-6 py-3 bg-error text-on-error font-headline font-bold rounded-xl hover:bg-error-dim transition-all active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Réessayer
          </button>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-6 mb-8 border-t border-surface-container-highest">
        <Link href="/" className="flex items-center gap-2 text-on-surface-variant font-headline font-bold hover:text-on-surface transition-all px-4 py-2 hover:bg-surface-container-low rounded-lg">
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Annuler</span>
        </Link>
        <button
          onClick={handleAnalyze}
          disabled={!recordedBlob || !selectedStudent || isProcessing}
          className={`px-8 py-4 font-headline font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${(!recordedBlob || !selectedStudent || isProcessing) ? 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary-dim hover:scale-[1.03] active:scale-95'}`}
        >
          {isProcessing ? (
            <>
              <span className="w-5 h-5 border-2 border-on-surface-variant/30 border-t-on-surface-variant rounded-full animate-spin" />
              {processingLabel}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">psychology</span>
              Analyser ({currentModeConfig.bestFor.join(' + ')})
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Page wrapper with Suspense boundary ──────────────────────────────────────

export default function NewAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
        <div>
          <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">Nouvelle Analyse</h1>
          <p className="text-on-surface-variant mt-1 font-body">Chargement...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-surface-container-low rounded-xl" />
          <div className="h-64 bg-surface-container-low rounded-xl" />
        </div>
      </div>
    }>
      <NewAnalysisContent />
    </Suspense>
  );
}
