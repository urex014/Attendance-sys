// actions/auth.actions.ts
"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function registerUser(data: any) {
  try {
    const {
      name,
      email,
      password,
      role,
      matricNumber,
      courseIds = [],
    } = data;

    const identifier = role === "STUDENT" ? matricNumber : email;

    if (!name || !email || !password || !role || !identifier) {
      return { error: "All required fields must be provided." };
    }

    if (role === "LECTURER") {
      if (!Array.isArray(courseIds) || courseIds.length < 1 || courseIds.length > 3) {
        return { error: "Lecturers must select between 1 and 3 courses." };
      }
    }

    if (role === "STUDENT") {
      if (!Array.isArray(courseIds) || courseIds.length < 1) {
        return { error: "Students must select at least one course." };
      }
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { identifier }],
      },
    });

    if (existingUser) {
      return {
        error: "A user with this email or matriculation number already exists.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName: name,
          email,
          identifier,
          passwordHash: hashedPassword,
          role,
          matricNumber: role === "STUDENT" ? matricNumber : null,
          verificationStatus: "VERIFIED",
        },
      });

      if (role === "LECTURER") {
        const unassignedCourses = await tx.course.findMany({
          where: {
            id: { in: courseIds },
            lecturerId: null,
          },
        });

        if (unassignedCourses.length !== courseIds.length) {
          throw new Error(
            "One or more selected courses have already been assigned to another lecturer."
          );
        }

        const updateResult = await tx.course.updateMany({
          where: {
            id: { in: courseIds },
            lecturerId: null,
          },
          data: {
            lecturerId: newUser.id,
          },
        });

        if (updateResult.count !== courseIds.length) {
          throw new Error(
            "One or more selected courses were just assigned to another lecturer. Please refresh and try again."
          );
        }
      }
      

      if (role === "STUDENT") {
        const availableCourses = await tx.course.findMany({
          where: {
            id: { in: courseIds },
            lecturerId: { not: null },
          },
        });

        if (availableCourses.length !== courseIds.length) {
          throw new Error(
            "One or more selected courses are not currently available."
          );
        }

        await tx.studentCourse.createMany({
          data: courseIds.map((courseId: string) => ({
            studentId: newUser.id,
            courseId,
          })),
          skipDuplicates: true,
        });
      }

      return newUser;
    });

    return { success: true, userId: result.id };
  } catch (error: any) {
    console.error("Registration Error:", error);

    return {
      error:
        error?.message ||
        "An unexpected error occurred during registration.",
    };
  }
}