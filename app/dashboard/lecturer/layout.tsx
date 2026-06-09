import React, { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';

export default async function LecturerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 1. Authenticate & Protect Route
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  
  // Ensure only lecturers can access this layout
  if (session.user.role !== 'LECTURER') redirect('/dashboard/student');

  // 2. Fetch Lecturer Data
  const lecturer = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      lecturerCourses: true, // Updated from studentCourses to lecturerCourses
    }
  });

  if (!lecturer) redirect('/login');

  return (
    <div className="min-h-screen bg-zinc-50/50 font-sans text-zinc-900 flex flex-col">
      
      {/* SaaS Top Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white px-6 shadow-sm flex-shrink-0">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-white font-bold text-xs">
            AU
          </div>
          <span className="text-lg font-semibold tracking-tight text-zinc-900">AttendanceOS</span>
          <span className="ml-2 hidden sm:flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            Lecturer
          </span>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-zinc-500 md:inline-block">
            {lecturer.email}
          </span>
          
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100">
            <span className="text-sm font-medium text-zinc-600">
              {lecturer.fullName?.charAt(0).toUpperCase() || 'L'}
            </span>
          </div>

          <div className="h-6 w-px bg-zinc-200 mx-2" aria-hidden="true" />
          
          {/* Client-side logout button */}
          <LogoutButton />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto pb-24 pt-4">
        {children}
      </main>

    </div>
  );
}