'use server'

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth'; // Assuming you are using Auth.js
import { VerificationStatus } from '@prisma/client';

// Security check helper
async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
}

export async function getPendingStudents() {
  await checkAdminAuth();

  try {
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        verificationStatus: 'PENDING',
      },
      select: {
        id: true,
        fullName: true,
        matricNumber: true,
        department: true,
        courseFormUrl: true,
        createdAt: true,
        studentCourses: {
          include: {
            course: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
    });

    return students;
  } catch (error) {
    console.error('Error fetching pending students:', error);
    throw new Error('Failed to fetch pending students');
  }
}

export async function updateStudentStatus(studentId: string, status: VerificationStatus) {
  await checkAdminAuth();

  try {
    await prisma.user.update({
      where: { id: studentId },
      data: { verificationStatus: status },
    });

    // Revalidate the page so the table updates automatically
    revalidatePath('/admin/verify');
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating student status to ${status}:`, error);
    throw new Error('Failed to update student status');
  }
}