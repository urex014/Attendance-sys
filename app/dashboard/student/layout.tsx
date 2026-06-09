// app/dashboard/student/layout.tsx
//valerius' group
import React, { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import BottomNav from '@/components/dashboard/BottomNav';
import prisma from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';

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
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-20 px-4 h-16 flex items-center justify-between flex-shrink-0 shadow-sm">
  
  {/* Left: Branding */}
  <div className="flex items-center gap-2">
    <div className="h-7 w-7 bg-black rounded flex items-center justify-center text-white font-bold text-xs">
      AU
    </div>
    <span className="font-semibold text-zinc-900 tracking-tight">Attendance-SYS</span>
  </div>

  {/* Right: User Profile & Actions */}
  <div className="flex items-center gap-4">
    
    {/* Client-Side Logout Button */}
    <LogoutButton />

    {/* Vertical Divider */}
    <div className="h-6 w-px bg-zinc-200 hidden sm:block" aria-hidden="true" />

    <span className="text-zinc-500 text-sm font-medium hidden sm:inline-block">
      {student.email || 'auxxx@augustine.edu.ng'}
    </span>
    
    {/* DiceBear Dynamic Avatar */}
    <div className="h-9 w-9 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden shadow-sm">
      <img 
        src={`https://api.dicebear.com/8.x/shapes/svg?seed=${student.identifier || student.id}`} 
        alt="User Avatar" 
        className="w-full h-full object-cover"
      />
    </div>
    
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