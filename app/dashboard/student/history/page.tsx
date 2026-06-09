import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { 
  ArrowLeft, 
  History, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  Award,
  SearchX
} from 'lucide-react';

export const metadata = {
  title: 'Attendance History | AttendanceOS',
};

export default async function StudentHistoryPage() {
  // 1. Authenticate & Protect
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'STUDENT') redirect('/dashboard/admin');

  // 2. Fetch all attendance records for this student
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: session.user.id },
    include: {
      session: {
        include: {
          course: {
            select: { courseCode: true, courseTitle: true }
          },
          lecturer: {
            select: { fullName: true }
          }
        }
      }
    },
    orderBy: { scannedAt: 'desc' }, // Newest first
  });

  // 3. Calculate Quick Stats for the SaaS Headers
  const totalScans = records.length;
  
  // Find the most attended course
  const courseCounts = records.reduce((acc, record) => {
    const code = record.session.course.courseCode;
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostAttendedCourse = Object.entries(courseCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-12">
      
      {/* Page Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/dashboard/student" 
            className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-lg border border-zinc-200">
              <History className="h-6 w-6 text-zinc-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Attendance Log</h1>
              <p className="text-sm text-zinc-500 mt-1">A complete history of your verified class check-ins.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Analytics Top Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Verified Scans</p>
              <p className="text-2xl font-bold text-zinc-900">{totalScans}</p>
            </div>
          </div>
          
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">First Scan</p>
              <p className="text-lg font-bold text-zinc-900">
                {records.length > 0 
                  ? new Date(records[records.length - 1].scannedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }) 
                  : '--'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Most Attended</p>
              <p className="text-lg font-bold text-zinc-900">{mostAttendedCourse}</p>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <h2 className="text-base font-semibold text-zinc-900">Scan History</h2>
          </div>
          
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4 border border-zinc-200">
                <SearchX className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900">No records found</h3>
              <p className="text-sm text-zinc-500 mt-1 max-w-sm">
                You haven't scanned into any classes yet. Once you scan a QR code, your history will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-zinc-600">
                <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium">Course</th>
                    <th scope="col" className="px-6 py-4 font-medium">Lecturer</th>
                    <th scope="col" className="px-6 py-4 font-medium">Date</th>
                    <th scope="col" className="px-6 py-4 font-medium">Time Scanned</th>
                    <th scope="col" className="px-6 py-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {records.map((record) => {
                    const scanDate = new Date(record.scannedAt);
                    return (
                      <tr key={record.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-zinc-900">{record.session.course.courseCode}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{record.session.course.courseTitle}</div>
                        </td>
                        <td className="px-6 py-4">
                          {record.session.lecturer.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-zinc-400" />
                            {scanDate.toLocaleDateString('en-NG', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 font-medium text-zinc-900">
                            <Clock className="h-4 w-4 text-zinc-400" />
                            {scanDate.toLocaleTimeString('en-NG', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Present
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}