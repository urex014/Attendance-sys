// app/dashboard/student/page.tsx
// valerius group — real-data student dashboard/redesigned as a modern SaaS dashboard

import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function StudentDashboard() {
  // ------------------------------
  // 1. Authentication & Protection
  // ------------------------------
  const session = await auth();

  if (!session?.user?.id) redirect('/login');

  const userRole = (session.user as { role?: string })?.role;

  if (userRole !== 'STUDENT') redirect('/dashboard/admin');
  // ------------------------------
  // 2. Data Fetching
  // ------------------------------

  const now = new Date();

  const [student, activeSession] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        studentCourses: {
          include: {
            course: true,
          },
        },
      },
    }),

    prisma.attendanceSession.findFirst({
      where: {
        startsAt: { lte: now },
        expiresAt: { gt: now },
        course: {
          students: {
            some: {
              studentId: session.user.id,
            },
          },
        },
      },
      orderBy: { expiresAt: 'asc' },
      select: {
        expiresAt: true,
        course: {
          select: {
            courseCode: true,
            courseTitle: true,
          },
        },
        lecturer: {
          select: {
            fullName: true,
          },
        },
      },
    }),
  ]);

  if (!student) redirect('/login');
   // ------------------------------
  // 3. Course Statistics (Real Data)
  // ------------------------------

  const coursesWithStats = await Promise.all(
    student.studentCourses.map(async (sc) => {
      const totalSessions = await prisma.attendanceSession.count({
        where: {
          courseId: sc.course.id,
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      const attendedSessions = await prisma.attendanceRecord.count({
        where: {
          studentId: student.id,
          session: {
            courseId: sc.course.id,
            expiresAt: {
              lt: new Date(),
            },
          },
        },
      });

      const percentage =
        totalSessions > 0
          ? Math.round((attendedSessions / totalSessions) * 100)
          : 0;

      return {
        id: sc.course.id,
        code: sc.course.courseCode,
        title: sc.course.courseTitle,
        attended: attendedSessions,
        totalSessions,
        percentage,
        isAtRisk: totalSessions > 0 && percentage < 75,
      };
    })
  );

  const recentAttendance = await prisma.attendanceRecord.findMany({
    where: {
      studentId: student.id,
    },
    orderBy: {
      scannedAt: 'desc',
    },
    take: 5,
    include: {
      session: {
        include: {
          course: true,
        },
      },
    },
  });

  const totalCourses = coursesWithStats.length;

  const avgAttendance =
    totalCourses > 0
      ? Math.round(
          coursesWithStats.reduce((sum, course) => sum + course.percentage, 0) /
            totalCourses
        )
      : 0;

      // ------------------------------
      // 4. Render: Full SaaS Dashboard Layout
      // ------------------------------
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
       {/* ---------- Main Content ---------- */}
      <div className="flex-1 flex flex-col w-full h-screen overflow-auto">
        {/* Dashboard Body */}
        <main className="flex-1 p-6 lg:p-8 space-y-8">
          {/* Welcome & Quick Stats Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, {student.fullName?.split(' ')[0] || 'Student'}
              </h1>
              <p className="text-slate-500 mt-1">
                Matric No:{' '}
                <span className="font-medium text-slate-700">
                  {student.identifier}
                </span>
              </p>
            </div>

            <Link
              href="/dashboard/student/scan"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              Scan Attendance QR
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Courses"
              value={totalCourses}
              icon="book-open"
              accent="bg-blue-50 text-blue-600"
            />

            <StatCard
              label="Avg. Attendance"
              value={`${avgAttendance}%`}
              icon="trending-up"
              accent="bg-emerald-50 text-emerald-600"
            />

            <StatCard
              label="Active Sessions"
              value={activeSession ? '1' : '0'}
              icon="radio"
              accent="bg-amber-50 text-amber-600"
            />

            <StatCard
              label="Risk Level"
              value={coursesWithStats.some((course) => course.isAtRisk) ? 'At Risk' : 'Good'}
              icon="alert-triangle"
              accent={
                coursesWithStats.some((course) => course.isAtRisk)
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }
            />
          </div>

        {/* Main grid: Courses + Active Session / Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Your Courses
              </h2>

              <div className="space-y-4">
                {coursesWithStats.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 shadow-sm">
                    No courses found. Your form might still be pending review.
                  </div>
                ) : (
                  coursesWithStats.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {course.code}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {course.title}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            course.isAtRisk
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {course.totalSessions === 0
                            ? 'No sessions'
                            : `${course.percentage}%`}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{course.attended} attended</span>
                          <span>{course.totalSessions} sessions</span>
                        </div>

                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              course.isAtRisk ? 'bg-rose-500' : 'bg-slate-900'
                            }`}
                            style={{ width: `${course.percentage}%` }}
                          />
                        </div>

                        {course.isAtRisk && (
                          <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                            Below 75% – go for class!
                          </p>
                        )}

                        {course.totalSessions === 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            No completed attendance session yet.
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Active Session & Recent Scans */}
            <div className="space-y-6">
              {/* Active QR Card */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {activeSession ? (
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Live Session
                      </p>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900">
                      {activeSession.course.courseCode}
                    </h2>

                    <p className="text-sm text-slate-500 mb-4">
                      {activeSession.course.courseTitle}
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Lecturer</span>
                        <span className="font-medium text-slate-900">
                          {activeSession.lecturer.fullName}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Expires at</span>
                        <span className="font-medium text-slate-900">
                          {activeSession.expiresAt.toLocaleTimeString('en-NG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/student/scan"
                      className="mt-5 block w-full text-center bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                      Mark Attendance
                    </Link>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="h-3 w-3 rounded-full bg-slate-300"></span>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        No Active Session
                      </p>
                    </div>

                    <p className="text-sm text-slate-500">
                      There is no attendance QR code available for your enrolled courses right now.
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Scans (real) */}
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-3">
                  Recent Activity
                </h2>

                <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
                  {recentAttendance.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500">
                      No attendance records yet.
                    </div>
                  ) : (
                    recentAttendance.map((record) => (
                      <RecentScanItem
                        key={record.id}
                        status="success"
                        course={`${record.session.course.courseCode} - ${record.session.course.courseTitle}`}
                        time={record.scannedAt.toLocaleString('en-NG', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
/** Stats Card */

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    'book-open': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    'trending-up': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    radio: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
    'alert-triangle': (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4.99c-.77-1.333-2.694-1.333-3.464 0L3.34 16.49c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`p-2 rounded-lg ${accent}`}>{icons[icon]}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

/** Recent Activity Item */
function RecentScanItem({
  status,
  course,
  time,
}: {
  status: 'success' | 'missed';
  course: string;
  time: string;
}) {
  const isSuccess = status === 'success';

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          isSuccess ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />

      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            isSuccess ? 'text-slate-900' : 'text-rose-700'
          }`}
        >
          {course}
        </p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
    </div>
  );
}