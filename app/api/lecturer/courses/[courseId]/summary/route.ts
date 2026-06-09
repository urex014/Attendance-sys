import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as {
      id: string;
      role: "ADMIN" | "LECTURER" | "STUDENT";
    };

    if (user.role !== "LECTURER" && user.role !== "ADMIN") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { courseId } = await params;

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        ...(user.role === "LECTURER" && { lecturerId: user.id }),
      },
      include: {
        students: {
          include: {
            student: true,
          },
        },
        sessions: {
          orderBy: {
            startsAt: "asc",
          },
          include: {
            records: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    const now = new Date();

    const activeSession = course.sessions.find(
      (session) => session.startsAt <= now && session.expiresAt > now
    );

    const students = course.students.map((studentCourse) => {
      const student = studentCourse.student;

      const attendanceBySession = course.sessions.map((session) => {
        const attended = session.records.some(
          (record) => record.studentId === student.id
        );

        return {
          sessionId: session.id,
          attended,
        };
      });

      const attendedCount = attendanceBySession.filter((item) => item.attended).length;
      const totalSessions = course.sessions.length;

      const percentage =
        totalSessions > 0
          ? Math.round((attendedCount / totalSessions) * 100)
          : 0;

      return {
        id: student.id,
        fullName: student.fullName,
        identifier: student.identifier,
        email: student.email,
        attendedCount,
        totalSessions,
        percentage,
        attendanceBySession,
      };
    });

    return NextResponse.json(
      {
        course: {
          id: course.id,
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
        },
        sessions: course.sessions.map((session) => ({
          id: session.id,
          startsAt: session.startsAt,
          expiresAt: session.expiresAt,
          qrToken: session.qrToken,
        })),
        activeSession: activeSession
          ? {
              id: activeSession.id,
              startsAt: activeSession.startsAt,
              expiresAt: activeSession.expiresAt,
              qrToken: activeSession.qrToken,
            }
          : null,
        students,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}