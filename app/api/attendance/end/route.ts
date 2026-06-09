export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

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
    };

    if (user.role !== "LECTURER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Only lecturers can end attendance sessions" },
        { status: 403 }
      );
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { message: "Session ID is required" },
        { status: 400 }
      );
    }

    const attendanceSession = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        course: true,
      },
    });

    if (!attendanceSession) {
      return NextResponse.json(
        { message: "Attendance session not found" },
        { status: 404 }
      );
    }

    if (
      user.role === "LECTURER" &&
      attendanceSession.lecturerId !== user.id
    ) {
      return NextResponse.json(
        { message: "You can only end your own attendance session" },
        { status: 403 }
      );
    }

    if (attendanceSession.expiresAt <= new Date()) {
      return NextResponse.json(
        { message: "Attendance session has already ended" },
        { status: 400 }
      );
    }

    const endedSession = await prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        expiresAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Attendance session ended successfully",
        session: endedSession,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}