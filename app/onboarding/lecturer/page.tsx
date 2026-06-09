import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LecturerOnboardingClient from './LecturerOnboardingClient';

export const metadata = {
  title: 'Lecturer Onboarding | AttendanceOS',
};

export default async function LecturerOnboardingPage() {
  const session = await auth();

  // Protect route
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'LECTURER') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LecturerOnboardingClient />
    </div>
  );
}