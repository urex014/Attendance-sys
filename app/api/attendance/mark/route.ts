export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as {
      id: string;
      role: "ADMIN" | "LECTURER" | "STUDENT";
    };

    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Only students can mark attendance" },
        { status: 403 }
      );
    }

    const { qrToken } = await req.json();

    if (!qrToken) {
      return NextResponse.json(
        { message: "QR token is required" },
        { status: 400 }
      );
    }

    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: { qrToken },
      include: {
        course: true,
      },
    });

    if (!attendanceSession) {
      return NextResponse.json(
        { message: "Invalid QR code" },
        { status: 404 }
      );
    }

    if (attendanceSession.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "QR code has expired" },
        { status: 410 }
      );
    }

    const enrollment = await prisma.studentCourse.findFirst({
      where: {
        studentId: user.id,
        courseId: attendanceSession.courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        studentId: user.id,
        sessionId: attendanceSession.id,
      },
    });

    if (existingRecord) {
      return NextResponse.json(
        { message: "Attendance already marked for this session" },
        { status: 409 }
      );
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        studentId: user.id,
        sessionId: attendanceSession.id,
      },
      include: {
        session: {
          include: {
            course: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Attendance marked successfully",
        attendance: record,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}