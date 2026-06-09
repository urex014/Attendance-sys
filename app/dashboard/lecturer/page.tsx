"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

import { 
  BookOpen, 
  Plus, 
  Play, 
  Clock, 
  QrCode, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react";

type Course = {
  id: string;
  courseCode: string;
  courseTitle: string;
};

type ActiveSessionData = {
  token: string;
  expiresAt: string;
} | null;

export default function LecturerDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(10);
  
  const [loading, setLoading] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  
  // Replace alerts with UI state
  const [uiMessage, setUiMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSessionData>(null);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  async function createCourse() {
    if (!courseCode || !courseTitle) {
      setUiMessage({ type: 'error', text: "Please fill in both course fields." });
      return;
    }

    setLoading(true);
    setUiMessage(null);

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode, courseTitle }),
      });

      const data = await res.json();

      if (res.ok) {
        setUiMessage({ type: 'success', text: `${courseCode} created successfully.` });
        setCourseCode("");
        setCourseTitle("");
        fetchCourses();
      } else {
        setUiMessage({ type: 'error', text: data.message || "Failed to create course." });
      }
    } catch (error) {
      setUiMessage({ type: 'error', text: "A network error occurred." });
    } finally {
      setLoading(false);
    }
  }

  async function startAttendance() {
    if (!selectedCourseId) {
      setUiMessage({ type: 'error', text: "Please select a course to start attendance." });
      return;
    }
    if (durationMinutes < 1 || durationMinutes > 120) {
      setUiMessage({ type: 'error', text: "Duration must be between 1 and 120 minutes." });
      return;
    }

    setIsStartingSession(true);
    setUiMessage(null);
    setActiveSession(null);

    try {
      const res = await fetch("/api/attendance/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseId, durationMinutes }),
      });

      const data = await res.json();

      if (res.ok) {
        // Render the session data in the UI instead of an alert
        setActiveSession({
          token: data.session.qrToken,
          expiresAt: new Date(data.session.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } else {
        setUiMessage({ type: 'error', text: data.message || "Failed to start attendance." });
      }
    } catch (error) {
      setUiMessage({ type: 'error', text: "Error starting attendance." });
    } finally {
      setIsStartingSession(false);
    }
  }

  const selectedCourseName = courses.find(c => c.id === selectedCourseId)?.courseCode;

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-12">
      
      

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Global UI Messages */}
        {uiMessage && (
          <div className={`flex items-center gap-2 p-4 rounded-lg border ${
            uiMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            {uiMessage.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            <p className="text-sm font-medium">{uiMessage.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Course Management */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Course Selection List */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Your Assigned Courses</h2>
              </div>
              
              {courses.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
                  <BookOpen className="h-10 w-10 mb-3 text-zinc-300" />
                  <p>You have not registered any courses yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedCourseId === course.id
                          ? "border-zinc-900 bg-zinc-50"
                          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                      }`}
                    >
                      {selectedCourseId === course.id && (
                        <div className="absolute top-4 right-4 text-zinc-900">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}
                      <span className="font-bold text-zinc-900 text-lg">{course.courseCode}</span>
                      <span className="text-sm text-zinc-500 mt-1 line-clamp-1">{course.courseTitle}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Course Inline Form */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-zinc-500" /> Add Additional Course
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Code (e.g. CSC301)"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  className="w-full sm:w-1/3 h-10 px-3 text-sm rounded-md border border-zinc-200 bg-transparent placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Full Course Title"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-zinc-200 bg-transparent placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
                <button
                  onClick={createCourse}
                  disabled={loading}
                  className="h-10 px-4 whitespace-nowrap rounded-md bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Active Session Control */}
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-900 bg-zinc-950 text-white shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold tracking-tight mb-1">Live Attendance</h2>
                <p className="text-zinc-400 text-sm mb-6">Start a secure QR session for your class.</p>

                {!activeSession ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Target Course</label>
                      <div className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 flex items-center px-3 text-sm text-zinc-300">
                        {selectedCourseName || "Select a course from the left..."}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Duration (Minutes)</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(Number(e.target.value))}
                          className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={startAttendance}
                      disabled={isStartingSession || !selectedCourseId}
                      className="w-full h-10 mt-2 flex items-center justify-center gap-2 rounded-md bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isStartingSession ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Play className="h-4 w-4" /> Start Session
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Active Session Output UI (Replaces the Alert!) */
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-500 uppercase tracking-wide">Session Active</span>
            </div>
            
            <div className="bg-white p-6 rounded-lg flex flex-col items-center justify-center mb-6">
              {/* ACTUAL DYNAMIC QR CODE */}
              <div className="mb-4 p-2 bg-white rounded-md">
                <QRCode 
                  value={activeSession.token} 
                  size={160} // Size in pixels
                  level="H" // High error correction so it scans easily from far away
                  className="text-zinc-950"
                />
              </div>
              
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider text-center">Session Token</p>
              <p className="text-xl font-mono font-bold text-zinc-950 text-center break-all">
                {activeSession.token}
              </p>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-zinc-800 pt-4 mb-4">
              <span className="text-zinc-400">Auto-expires at:</span>
              <span className="font-semibold text-amber-400">{activeSession.expiresAt}</span>
            </div>

            {/* New End Session Button */}
            <button
              onClick={setActiveSession.bind(null, null)} // For demo purposes, just clear the session. In production, you'd call an API to end it.
              
              className="w-full h-10 flex items-center justify-center gap-2 rounded-md bg-red-500/10 text-red-500 text-sm font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              End session
            </button>
          </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}