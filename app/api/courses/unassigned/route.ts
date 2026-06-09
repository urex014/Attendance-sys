import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        lecturerId: null,
      },
      orderBy: {
        courseCode: "asc",
      },
    });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to fetch unassigned courses" },
      { status: 500 }
    );
  }
}