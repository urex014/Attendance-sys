// app/(auth)/onboarding/page.tsx
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
// import { processCourseForm, verifyAndSaveFace } from '@/actions/onboarding.actions';
import {processCourseForm} from '@/actions/onboarding.actions'

export default function OnboardingPage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);

  // State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [extractedCourses, setExtractedCourses] = useState<any[]>([]);

  // Step 1: Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    const result = await processCourseForm(formData);

    if (result.error) {
      setError(result.error);
      setIsProcessing(false);
    } else {
      setExtractedCourses(result.courses || []);
      setStep(2); // Move to Face Scan
      setIsProcessing(false);
      setTimeout(() => {
        router.push('/dashboard/student');
      }, 2000);
    }
  };

  // Step 2: Handle Face Capture
  // const captureFace = useCallback(async () => {
  //   const imageSrc = webcamRef.current?.getScreenshot();
  //   if (!imageSrc) return setError("Failed to capture image. Check camera permissions.");

  //   setIsProcessing(true);
  //   setError('');

  //   const result = await verifyAndSaveFace(imageSrc);

  //   if (result.error) {
  //     setError(result.error);
  //     setIsProcessing(false);
  //   } else {
  //     setStep(3); // Move to Success
  //     setIsProcessing(false);
      
  //     // Auto-redirect to dashboard after 2 seconds
  //     setTimeout(() => {
  //       router.push('/dashboard/student');
  //     }, 2000);
  //   }
  // }, [webcamRef, router]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans text-zinc-900">
      <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 sm:p-12 overflow-hidden relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-100">
          <div 
            className="h-full bg-zinc-900 transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
          />
        </div>

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Student Onboarding</h1>
          <p className="text-zinc-500 mt-2 text-sm">
            {step === 1 && "Upload your official course form for OCR extraction."}
            {step === 2 && "Position your face in the frame for biometric registration."}
            {step === 3 && "Verification complete. Redirecting to your dashboard..."}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
           <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
             {error}
           </div>
        )}

        {/* STEP 1: Course Form Upload */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <label 
              htmlFor="dropzone-file" 
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isProcessing ? 'border-zinc-300 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50'}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isProcessing ? (
                  <svg className="animate-spin h-10 w-10 text-zinc-900 mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-10 h-10 mb-4 text-zinc-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                )}
                <p className="mb-2 text-sm text-zinc-500">
                  <span className="font-semibold text-zinc-900">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-zinc-500">PDF, JPG, or PNG (MAX. 5MB)</p>
                {isProcessing && <p className="mt-4 text-xs font-medium text-zinc-900 uppercase tracking-widest animate-pulse">Running AI OCR Extraction...</p>}
              </div>
              <input id="dropzone-file" type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} disabled={isProcessing} />
            </label>
          </div>
        )}

        {/*
        {step === 2 && (
          <div className="space-y-6 flex flex-col items-center animate-in fade-in slide-in-from-right-8 duration-500">
            
            
            <div className="w-full bg-zinc-100 p-4 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">✓ Found {extractedCourses.length} courses</span>
              <span className="text-xs text-zinc-500">Continuing to biometric check...</span>
            </div>

            <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-zinc-900 shadow-xl bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ width: 300, height: 300, facingMode: "user" }}
                className="object-cover w-full h-full"
              />
              
              <div className="absolute inset-0 border-[8px] border-dashed border-white/30 rounded-full animate-[spin_10s_linear_infinite]" />
            </div>


            <button 
              onClick={captureFace}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors flex justify-center items-center h-12"
            >
              {isProcessing ? "Analyzing Biometrics..." : "Capture & Verify Face"}
            </button>
          </div>
        )}
         */}

        {/* STEP 3: Success */}
        {step === 2 && (
          <div className="flex flex-col items-center py-12 animate-in zoom-in-95 duration-500">
            <div className="h-20 w-20 bg-black text-white rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">Profile Secured</h2>
            <p className="text-zinc-500 mt-2">Your course form is pending admin review. You are ready to log attendance.</p>
          </div>
        )}
        

      </div>
    </div>
  );
}