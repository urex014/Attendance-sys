'use client';

import { useState, useRef, useTransition } from 'react';
import { saveLecturerCourses } from '@/actions/lecturer.actions';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, BookOpen } from 'lucide-react';

export default function LecturerOnboardingClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  
  // Default to 9 empty slots, similar to a seed phrase grid
  const [codes, setCodes] = useState<string[]>(Array(9).fill(''));
  
  // Refs to manage focus jumping when pressing Enter
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    const newCodes = [...codes];
    // Force uppercase and remove extra spaces immediately
    newCodes[index] = value.toUpperCase().replace(/\s{2,}/g, ' ');
    setCodes(newCodes);
    setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move to next input if it exists
      if (index < codes.length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const result = await saveLecturerCourses(codes);
        if (result.success) {
          router.push('/dashboard/lecturer');
        }
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      }
    });
  };

  const activeCount = codes.filter((c) => c.trim().length > 2).length;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-zinc-900" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Set up your courses
        </h1>
        <p className="text-zinc-500 text-sm">
          Enter the codes for the courses you are taking this semester (e.g. CSC 301). You can leave unused boxes blank.
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {codes.map((code, index) => (
            <div key={index} className="relative flex items-center">
              {/* Number Badge */}
              <span className="absolute left-3 text-xs font-semibold text-zinc-400 select-none">
                {index + 1}.
              </span>
              <input
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                value={code}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                placeholder="---"
                disabled={isPending}
                maxLength={10}
                className="w-full h-12 pl-8 pr-3 rounded-lg border border-zinc-200 bg-zinc-50/50 text-sm font-medium text-zinc-900 transition-colors focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:opacity-50"
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 font-medium text-center">{error}</p>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-500">
            {activeCount} course{activeCount !== 1 ? 's' : ''} added
          </span>
          
          <button
            onClick={handleSubmit}
            disabled={isPending || activeCount === 0}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Complete Setup
            {!isPending && <ArrowRight className="w-4 h-4 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
}