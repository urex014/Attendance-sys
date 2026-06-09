"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { QRCodeCanvas } from "qrcode.react";

type Course = {
  id: string;
  courseCode: string;
  courseTitle: string;
};

type CourseSummary = {
  course: Course;
  sessions: {
    id: string;
    startsAt: string;
    expiresAt: string;
    qrToken: string;
  }[];
  activeSession: {
    id: string;
    startsAt: string;
    expiresAt: string;
    qrToken: string;
  } | null;
  students: {
    id: string;
    fullName: string;
    identifier: string;
    email: string | null;
    attendedCount: number;
    totalSessions: number;
    percentage: number;
    attendanceBySession: {
      sessionId: string;
      attended: boolean;
    }[];
  }[];
};

export default function LecturerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [summary, setSummary] = useState<CourseSummary | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [loading, setLoading] = useState(false);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();

      if (res.ok) {
        setCourses(data.courses || []);

        if (data.courses?.length > 0 && !selectedCourseId) {
          setSelectedCourseId(data.courses[0].id);
        }
      } else {
        alert(data.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching courses");
    }
  }

  async function fetchCourseSummary(courseId: string) {
    if (!courseId) return;

    try {
      const res = await fetch(`/api/lecturer/courses/${courseId}/summary`);
      const data = await res.json();

      if (res.ok) {
        setSummary(data);
      } else {
        alert(data.message || "Failed to fetch course summary");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching course summary");
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseSummary(selectedCourseId);
    }
  }, [selectedCourseId]);

  async function startAttendance() {
    if (!selectedCourseId) {
      alert("Select a course first");
      return;
    }

    if (durationMinutes < 1 || durationMinutes > 30) {
      alert("Duration must be between 1 and 30 minutes");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/attendance/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: selectedCourseId,
          durationMinutes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchCourseSummary(selectedCourseId);
        alert("Attendance started successfully");
      } else {
        alert(data.message || "Failed to start attendance");
      }
    } catch (error) {
      console.error(error);
      alert("Error starting attendance");
    }

    setLoading(false);
  }

  async function endAttendance() {
    if (!summary?.activeSession?.id) {
      alert("No active attendance session");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/attendance/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: summary.activeSession.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await fetchCourseSummary(selectedCourseId);
        alert("Attendance ended successfully");
      } else {
        alert(data.message || "Failed to end attendance");
      }
    } catch (error) {
      console.error(error);
      alert("Error ending attendance");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Lecturer Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Manage attendance, QR sessions, and student records.
            </p>
          </div>

          <button
            onClick={() => signOut()}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            Logout
          </button>
        </header>

        <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">
            Courses You Teach
          </h2>

          {courses.length === 0 ? (
            <p className="text-sm text-slate-500">
              You have not been assigned any course.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    selectedCourseId === course.id
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {course.courseCode}
                </button>
              ))}
            </div>
          )}
        </section>

        {summary && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                label="Course"
                value={summary.course.courseCode}
                accent="bg-blue-50 text-blue-600"
              />

              <StatCard
                label="Students"
                value={summary.students.length}
                accent="bg-emerald-50 text-emerald-600"
              />

              <StatCard
                label="Sessions"
                value={summary.sessions.length}
                accent="bg-amber-50 text-amber-600"
              />

              <StatCard
                label="Status"
                value={summary.activeSession ? "Live" : "Closed"}
                accent={
                  summary.activeSession
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-600"
                }
              />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {summary.course.courseCode}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {summary.course.courseTitle}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">
                    Attendance Duration
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={durationMinutes}
                    onChange={(e) =>
                      setDurationMinutes(Number(e.target.value))
                    }
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />

                  <p className="text-xs text-slate-500">
                    Duration must be between 1 and 30 minutes.
                  </p>
                </div>

                {!summary.activeSession ? (
                  <button
                    onClick={startAttendance}
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:bg-emerald-300"
                  >
                    {loading ? "Starting..." : "Start Attendance"}
                  </button>
                ) : (
                  <button
                    onClick={endAttendance}
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-red-300"
                  >
                    {loading ? "Ending..." : "End Attendance"}
                  </button>
                )}

                {summary.activeSession && (
                  <div className="border-t pt-5 space-y-4 text-center">
                    <div>
                      <p className="text-xs font-semibold uppercase text-emerald-700">
                        Live QR Code
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Expires{" "}
                        {new Date(
                          summary.activeSession.expiresAt
                        ).toLocaleTimeString("en-NG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex justify-center bg-white p-4 rounded-xl border">
                      <QRCodeCanvas
                        value={summary.activeSession.qrToken}
                        size={220}
                      />
                    </div>

                    <p className="text-[11px] break-all text-slate-400">
                      {summary.activeSession.qrToken}
                    </p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">
                    Student Attendance Table
                  </h2>
                  <p className="text-sm text-slate-500">
                    ✓ means attended, × means missed.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-4 font-semibold text-slate-600">
                          Student
                        </th>

                        <th className="text-left p-4 font-semibold text-slate-600">
                          Matric No
                        </th>

                        {summary.sessions.map((session, index) => (
                          <th
                            key={session.id}
                            className="text-center p-4 font-semibold text-slate-600 whitespace-nowrap"
                          >
                            Class {index + 1}
                          </th>
                        ))}

                        <th className="text-center p-4 font-semibold text-slate-600">
                          %
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {summary.students.length === 0 ? (
                        <tr>
                          <td
                            colSpan={summary.sessions.length + 3}
                            className="p-6 text-center text-slate-500"
                          >
                            No student is offering this course yet.
                          </td>
                        </tr>
                      ) : (
                        summary.students.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50">
                            <td className="p-4 font-medium text-slate-900 whitespace-nowrap">
                              {student.fullName}
                            </td>

                            <td className="p-4 text-slate-500 whitespace-nowrap">
                              {student.identifier}
                            </td>

                            {summary.sessions.map((session) => {
                              const record = student.attendanceBySession.find(
                                (item) => item.sessionId === session.id
                              );

                              return (
                                <td
                                  key={session.id}
                                  className="p-4 text-center"
                                  title={new Date(
                                    session.startsAt
                                  ).toLocaleString("en-NG")}
                                >
                                  {record?.attended ? (
                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold">
                                      ×
                                    </span>
                                  )}
                                </td>
                              );
                            })}

                            <td className="p-4 text-center">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  student.percentage < 75 &&
                                  student.totalSessions > 0
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {student.totalSessions === 0
                                  ? "0%"
                                  : `${student.percentage}%`}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-3 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}