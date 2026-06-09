export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const sessionUser = await auth();

    if (!sessionUser?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = sessionUser.user as {
      id: string;
      role: string;
      // faceVerified?: boolean;
    };

    if (user.role !== "LECTURER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only lecturers can start attendance sessions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { courseId, durationMinutes } = body;

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }


    if (!durationMinutes){
      return NextResponse.json(
        { message: "Duration is required" },
        { status: 400 }
      );
    }

    const duration = Number(durationMinutes);

    if (!Number.isInteger(duration) || duration < 1 || duration > 30) {
      return NextResponse.json(
        { message: "Duration must be between 1 and 30 minutes" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    if (user.role === "LECTURER" && course.lecturerId !== user.id) {
      return NextResponse.json(
        { message: "You can only start attendance for your own course" },
        { status: 403 }
      );
    }

    await prisma.attendanceSession.updateMany({
      where: {
        courseId,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        expiresAt: new Date(),
      },
    });

    

    const activeSession = await prisma.attendanceSession.findFirst({
      where: {
        courseId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (activeSession) {
      return NextResponse.json(
        {
          message: "An attendance session is already active for this course",
          activeSession: {
            id: activeSession.id,
            courseId: activeSession.courseId,
            startsAt: activeSession.startsAt,
            expiresAt: activeSession.expiresAt,
          },
        },
        { status: 409 }
      );
    }

    const qrToken = crypto.randomBytes(32).toString("hex");

    const startsAt = new Date();
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);
    const attendanceSession = await prisma.attendanceSession.create({
      data: {
        courseId,
        lecturerId: user.id,
        qrToken,
        startsAt,
        expiresAt,
      },
    });

    return NextResponse.json(
      {
        message: "Attendance session started successfully",
        session: {
          id: attendanceSession.id,
          courseId: attendanceSession.courseId,
          qrToken: attendanceSession.qrToken,
          startsAt: attendanceSession.startsAt,
          expiresAt: attendanceSession.expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}