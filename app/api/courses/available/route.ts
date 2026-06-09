import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        lecturerId: {
          not: null,
        },
      },
      orderBy: {
        courseCode: "asc",
      },
      select: {
        id: true,
        courseCode: true,
        courseTitle: true,
        lecturerId: true,
      },
    });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to fetch available courses" },
      { status: 500 }
    );
  }
}