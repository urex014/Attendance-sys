'use server'

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth'; // Adjust based on your setup
import { redirect } from 'next/navigation';

export async function saveLecturerCourses(courseCodes: string[]) {
  const session = await auth();
  if (!session || session.user.role !== 'LECTURER') {
    throw new Error('Unauthorized: Lecturer access required');
  }

  // Sanitize: uppercase, trim spaces, remove empty strings, and remove duplicates
  const cleanCodes = [
    ...new Set(
      courseCodes
        .map((code) => code.trim().toUpperCase())
        .filter((code) => code.length > 2) // Basic validation for "CSC101"
    ),
  ];

  if (cleanCodes.length === 0) {
    throw new Error('Please enter at least one valid course code.');
  }

  try {
    // 1. Create the courses
    const coursesData = cleanCodes.map((code) => ({
      courseCode: code,
      courseTitle: `${code} - Title Pending`, // Placeholder since schema requires it
      lecturerId: session.user.id,
    }));

    await prisma.course.createMany({
      data: coursesData,
    });

    // 2. Mark the lecturer as verified/onboarded so they don't see this page again
    await prisma.user.update({
      where: { id: session.user.id },
      data: { verificationStatus: 'VERIFIED' },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to save lecturer courses:', error);
    throw new Error('Failed to save courses. Please try again.');
  }
}