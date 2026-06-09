// app/dashboard/student/layout.tsx
//valerius' group
import React, { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import BottomNav from '@/components/dashboard/BottomNav';
import prisma from '@/lib/prisma';
import { signOut } from "next-auth/react";

export default async function StudentDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        studentCourses: {
          include: {
            course: true,
          }
        }
      }
    });

  if (!student) redirect('/login');

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col">
      
      {/* Universal Top Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-20 px-4 h-16 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-black rounded flex items-center justify-center text-white font-bold text-xs">
            AU
          </div>
          <span className="font-semibold text-zinc-900 tracking-tight">Attendance-SYS</span>
        </div>

        <span className="text-zinc-500 hidden sm:inline-block">{student.email || 'auxxx@augustine.com'}</span>
        <div className="h-8 w-8 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center overflow-hidden">
            
            
            <svg className="w-5 h-5 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
      </header>

      {/* Main Content Area - Expands to fill available space, with padding for the nav */}
      <main className="flex-grow w-full max-w-5xl mx-auto pb-24 pt-4 px-4 sm:px-6">
        {children}
      </main>

      {/* The Universal Tabs */}
      <BottomNav />

    </div>
  );
}