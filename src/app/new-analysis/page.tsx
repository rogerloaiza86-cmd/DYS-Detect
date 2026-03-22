"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AudioRecorder from '@/components/AudioRecorder';
import { getStudents, createStudent, saveResult } from '@/lib/store';
import { Student } from '@/lib/types';
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

export default function NewAnalysisPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNewStudentForm, setShowNewStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', grade: '', age: '' });

  // Steps: 1: Capture, 2: Transcription, 3: Analyse IA
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    getStudents().then(setStudents);
  }, []);

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

  const currentStudentObj = students.find(s => s.id === selectedStudent);

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

  const handleAnalyze = async () => {
    if (!recordedBlob || !selectedStudent) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setCurrentStep(2); // Transcription in progress

    try {
      const formData = new FormData();
      formData.append('audio', recordedBlob);
      formData.append('studentId', selectedStudent);

      const transcribeRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      const transcribeData = await transcribeRes.json();

      if (transcribeData.error) throw new Error(transcribeData.error);

      setCurrentStep(3); // Analysis in progress

      // Compress handwriting image before sending
      let compressedImage = imagePreview;
      if (imagePreview) {
        compressedImage = await compressImage(imagePreview);
      }

      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription: transcribeData.text,
          studentId: selectedStudent,
          handwritingImage: compressedImage
        })
      });
      const analysisData = await analyzeRes.json();

      if (analysisData.error) throw new Error(analysisData.error);

      // Save locally and also attach handwriting info to display later
      const finalAnalysis = {
        ...analysisData,
        handwritingImage: imagePreview // Keep original for display
      };

      await saveResult(finalAnalysis);
      router.push(`/results/${analysisData.id}`);

    } catch (error) {
      console.error("Error during analysis:", error);
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue lors de l'analyse.");
      setIsProcessing(false);
      setCurrentStep(1);
    }
  };

  return (
    <div className="flex flex-col gap-12 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">
          Nouvelle Analyse Multimodale {currentStudentObj ? `- ${currentStudentObj.firstName} ${currentStudentObj.lastName}` : ''}
        </h1>
      </div>

      {/* Stepper Indicator */}
      <div className="flex items-center justify-center gap-8">
        <div className={`flex items-center gap-3 transition-opacity ${currentStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold transition-colors ${currentStep >= 1 ? 'bg-primary text-on-primary shadow-md shadow-primary/20' : 'bg-surface-container-highest text-on-surface-variant'}`}>1</div>
          <span className={`font-headline font-bold transition-colors ${currentStep >= 1 ? 'text-primary' : ''}`}>Capture D&E</span>
        </div>
        <div className={`h-px w-16 bg-outline-variant transition-opacity ${currentStep >= 2 ? 'opacity-100' : 'opacity-30'}`}></div>
        <div className={`flex items-center gap-3 transition-opacity ${currentStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold transition-colors ${currentStep >= 2 ? 'bg-primary text-on-primary shadow-md shadow-primary/20' : 'bg-surface-container-highest text-on-surface-variant'}`}>2</div>
          <span className={`font-headline font-bold transition-colors ${currentStep >= 2 ? 'text-primary' : ''}`}>Transcription</span>
        </div>
        <div className={`h-px w-16 bg-outline-variant transition-opacity ${currentStep >= 3 ? 'opacity-100' : 'opacity-30'}`}></div>
        <div className={`flex items-center gap-3 transition-opacity ${currentStep >= 3 ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold transition-colors ${currentStep >= 3 ? 'bg-primary text-on-primary shadow-md shadow-primary/20' : 'bg-surface-container-highest text-on-surface-variant'}`}>3</div>
          <span className={`font-headline font-bold transition-colors ${currentStep >= 3 ? 'text-primary' : ''}`}>Analyse IA</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Interaction Card */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 md:p-12 flex flex-col items-center justify-center gap-8 shadow-sm border border-outline-variant/10 relative overflow-hidden min-h-[500px]">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="text-center space-y-4 relative z-10 w-full">
            <span className="font-headline uppercase tracking-widest text-primary font-bold text-sm bg-primary/5 px-4 py-1.5 rounded-full">Texte de Référence</span>
            <h2 className="font-headline text-3xl font-medium text-on-surface max-w-lg mx-auto leading-relaxed mt-6">
              "Le petit chat boit son lait dans la cuisine."
            </h2>
          </div>

          <div className="relative z-10 w-full flex flex-col md:flex-row gap-6 mt-4">
            
            {/* Audio Recorder section */}
            <div className="flex-1 flex flex-col items-center p-6 bg-surface rounded-2xl border border-outline-variant/20 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary">mic</span>
                  <h3 className="font-headline font-bold text-on-surface">1. Lecture orale (Requis)</h3>
                </div>
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  isProcessing={isProcessing}
                  hasRecorded={!!recordedBlob}
                  onReset={handleResetRecording}
                />
            </div>

            {/* Handwriting Upload section */}
            <div className="flex-1 flex flex-col items-center p-6 bg-surface rounded-2xl border border-outline-variant/20 shadow-sm w-full">
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-secondary">draw</span>
                  <h3 className="font-headline font-bold text-on-surface">2. Écriture (Optionnel)</h3>
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
                  {imagePreview && (
                    <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-secondary-container/30 border border-secondary/20 text-secondary rounded-full font-bold text-sm w-full justify-center">
                       <span className="material-symbols-outlined text-[18px]">check_circle</span>
                       Photo ajoutée
                    </div>
                  )}
                </div>
            </div>

          </div>
        </div>

        {/* Guidance & Help Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-primary/10">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <span className="material-symbols-outlined">lightbulb</span>
              <h3 className="font-headline font-bold text-lg">Instructions Multiples</h3>
            </div>
            <p className="text-on-surface-variant leading-relaxed font-body text-sm">
              Vous pouvez maintenant évaluer la phonologie (dyslexie) et le geste graphique (dysgraphie) simultanément. L'IA analysera les deux composants et mettra en évidence leurs liens probables.
            </p>
            <div className="mt-6 p-4 bg-surface-container-low rounded-lg">
              <ul className="space-y-3 text-sm text-on-surface-variant font-body">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sm mt-0.5 text-secondary">check_circle</span>
                  <span>Enregistrement oral : Micro à 15cm.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sm mt-0.5 text-secondary">check_circle</span>
                  <span>Photo : Éclairez bien la feuille, évitez les ombres.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Student Selection */}
          <div className="bg-secondary-container/20 rounded-xl p-8 shadow-sm border border-secondary/10">
            <div className="flex items-center gap-3 mb-6 text-on-secondary-container">
              <span className="material-symbols-outlined">child_care</span>
              <h3 className="font-headline font-bold text-lg">Profil de l'enfant</h3>
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
               <div className="p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                   <input
                     placeholder="Prénom"
                     value={newStudent.firstName}
                     onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                     className="p-2.5 rounded-lg border border-outline-variant/30 text-sm w-full font-body focus:ring-2 focus:ring-primary/50 focus:outline-none"
                   />
                   <input
                     placeholder="Nom"
                     value={newStudent.lastName}
                     onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                     className="p-2.5 rounded-lg border border-outline-variant/30 text-sm w-full font-body focus:ring-2 focus:ring-primary/50 focus:outline-none"
                   />
                   <input
                     placeholder="Classe"
                     value={newStudent.grade}
                     onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                     className="p-2.5 rounded-lg border border-outline-variant/30 text-sm w-full font-body focus:ring-2 focus:ring-primary/50 focus:outline-none"
                   />
                   <input
                     placeholder="Âge"
                     type="number"
                     min="3"
                     max="18"
                     value={newStudent.age}
                     onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                     className="p-2.5 rounded-lg border border-outline-variant/30 text-sm w-full font-body focus:ring-2 focus:ring-primary/50 focus:outline-none"
                   />
                 </div>
                 <button onClick={handleAddStudent} className="w-full bg-primary text-on-primary text-sm font-bold py-3 rounded-lg hover:bg-primary-dim transition-all">Créer l'élève</button>
               </div>
            ) : currentStudentObj ? (
              <div className="space-y-4 mt-2">
                <div className="flex justify-between items-center border-b border-on-secondary-container/10 pb-3">
                  <span className="text-sm text-on-secondary-container/70 font-medium">Langue</span>
                  <span className="text-sm font-bold text-on-secondary-container">Français (FR)</span>
                </div>
                <div className="flex justify-between items-center border-b border-on-secondary-container/10 pb-3">
                  <span className="text-sm text-on-secondary-container/70 font-medium">Classe</span>
                  <span className="text-sm font-bold text-on-secondary-container">{currentStudentObj.grade}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-sm text-on-secondary-container/70 font-medium">Âge</span>
                  <span className="text-sm font-bold text-on-secondary-container">{currentStudentObj.age} ans</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant italic py-2">Sélectionnez ou créez un élève pour commencer l'analyse.</p>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {errorMessage && (
        <div className="flex items-center gap-4 p-5 bg-error-container/20 border border-error/20 rounded-xl">
          <span className="material-symbols-outlined text-error text-2xl">error</span>
          <div className="flex-1">
            <p className="font-headline font-bold text-error text-sm">Erreur lors de l'analyse</p>
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
      <div className="flex justify-between items-center pt-8 mb-8 border-t border-surface-container-highest">
        <Link href="/" className="flex items-center gap-2 text-on-surface-variant font-headline font-bold hover:text-on-surface transition-all px-4 py-2 hover:bg-surface-container-low rounded-lg">
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Annuler l'analyse</span>
        </Link>
        <div className="flex gap-4 cursor-auto">
          <button 
            onClick={handleAnalyze}
            disabled={!recordedBlob || !selectedStudent || isProcessing}
            className={`px-10 py-4 font-headline font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 ${(!recordedBlob || !selectedStudent || isProcessing) ? 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed' : 'bg-primary text-on-primary hover:bg-primary-dim hover:scale-[1.03] active:scale-95'}`}
          >
            {isProcessing ? (
              <>
                <span className="w-5 h-5 border-2 border-on-surface-variant/30 border-t-on-surface-variant rounded-full animate-spin"></span>
                Traitement Multimodal...
              </>
            ) : (
              <>
                 <span className="material-symbols-outlined">psychology</span>
                 Évaluer Dyslexie {imagePreview ? '& Dysgraphie' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
