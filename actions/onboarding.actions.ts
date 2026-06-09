/* eslint-disable @typescript-eslint/no-explicit-any */
// actions/onboarding.actions.ts
"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary"
import Tesseract from "tesseract.js"
export async function processCourseForm(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    // 1. Convert the file into a Base64 string for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    // 2. Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64File, {
      folder: "attendance_course_forms",
      resource_type: "auto", // Accepts both PDFs and Images
    });

    // 3. Prepare URL for OCR 
    const imageUrlForOcr = uploadResult.secure_url.replace(/\.pdf$/i, '.jpg');

    console.log("Fetching processed image from Cloudinary:", imageUrlForOcr);
    
    // FETCH IT MANUALLY: This prevents Tesseract from timing out
    const imageResponse = await fetch(imageUrlForOcr);
    if (!imageResponse.ok) {
      throw new Error(`Cloudinary fetch failed with status: ${imageResponse.status}`);
    }
    const ocrBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // 4. Run AI Text Extraction (OCR) using the raw buffer
    console.log("Running Tesseract OCR on image buffer...");
    const { data: { text } } = await Tesseract.recognize(ocrBuffer, 'eng');
    
    console.log("Extracted Text:", text);

    // 5. Extract Course Codes using Regex (Matches "CSC 301", "MTH202", "GNS  101")
    const courseRegex = /[A-Z]{3}\s*\d{3}/gi;
    const rawMatches = text.match(courseRegex) || [];
    
    // Clean up matches (remove spaces and convert to uppercase: "CSC 301" -> "CSC301")
    const extractedCourseCodes = [...new Set(rawMatches.map(c => c.replace(/\s+/g, '').toUpperCase()))];

    if (extractedCourseCodes.length === 0) {
      throw new Error("Could not detect any valid course codes (e.g., CSC301) on this document. Please ensure the image is clear.");
    }

    // 6. Database Operations: Link the courses to the student
    const successfulCourses = [];

    for (const code of extractedCourseCodes) {
      // Find the course in the database. 
      // (If it doesn't exist, an admin needs to create it first, or we auto-create it depending on your exact rules).
      let dbCourse = await prisma.course.findFirst({ where: { courseCode: code } });
      
      // For the sake of this onboarding flowing smoothly, we will auto-create missing courses.
      if (!dbCourse) {
        const admin = await prisma.user.findFirst({ where: { role: "ADMIN" }});
        if (!admin) throw new Error("System configuration error: No admin found to assign new courses.");

        dbCourse = await prisma.course.create({
          data: {
            courseCode: code,
            courseTitle: `Unknown Title (${code})`, // Admin can update this later
            lecturerId: admin.id, 
          }
        });
      }

      // Link Student to Course
      await prisma.studentCourse.upsert({
        where: {
          studentId_courseId: { studentId: session.user.id, courseId: dbCourse.id }
        },
        update: {},
        create: {
          studentId: session.user.id,
          courseId: dbCourse.id
        }
      });

      successfulCourses.push({ code: dbCourse.courseCode, title: dbCourse.courseTitle });
    }

    // 7. Save the uploaded Form URL to the user's profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: { courseFormUrl: uploadResult.secure_url }
    });

    return { success: true, courses: successfulCourses };

  } catch (error: any) {
    console.error("OCR Pipeline Error:", error);
    return { error: error.message || "Failed to process course form." };
  }
}
// Add this to the bottom of actions/onboarding.actions.ts

// 2. Process Face Capture (Mock version until we wire up face-api)
// export async function verifyAndSaveFace(imageBase64: string) {
//   try {
//     const session = await auth();
//     if (!session?.user?.id) throw new Error("Unauthorized");

//     // Simulate AI processing delay for the UI
//     await new Promise((resolve) => setTimeout(resolve, 1500)); 

//     // Update user in DB to allow them into the dashboard
//     await prisma.user.update({
//       where: { id: session.user.id },
//       data: { faceVerified: true }
//     });

//     return { success: true };
//   } catch (error: any) {
//     return { error: error.message };
//   }
// }