// app/(auth)/signup/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { registerUser } from '@/actions/auth.actions';

type Course = {
  id: string;
  courseCode: string;
  courseTitle: string;
};

export default function Signup() {
  const router = useRouter();

  const [role, setRole] = useState('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [password, setPassword] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCourses() {
      try {
        const endpoint =
          role === 'LECTURER'
            ? '/api/courses/unassigned'
            : role === 'STUDENT'
            ? '/api/courses/available'
            : null;

        if (!endpoint) {
          setCourses([]);
          return;
        }

        const res = await fetch(endpoint);
        const data = await res.json();

        if (res.ok) {
          setCourses(data.courses || []);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchCourses();
    setSelectedCourseIds([]);
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (role === 'LECTURER') {
        if (selectedCourseIds.length < 1 || selectedCourseIds.length > 3) {
          throw new Error('Lecturers must select between 1 and 3 courses.');
        }
      }

      if (role === 'STUDENT') {
        if (selectedCourseIds.length < 1) {
          throw new Error('Students must select at least one course.');
        }
      }

      const payload = {
        name,
        email,
        password,
        role,
        courseIds: selectedCourseIds,
        ...(role === 'STUDENT' && { matricNumber }),
      };

      const response = await registerUser(payload);

      if (response.error) {
        throw new Error(response.error);
      }

      const signInResult = await signIn('credentials', {
        redirect: false,
        identifier: role === 'STUDENT' ? matricNumber : email,
        password,
      });

      if (signInResult?.error) {
        throw new Error('Account created, but failed to log in automatically.');
      }

      if (role === 'ADMIN') router.push('/dashboard/admin');
      else if (role === 'LECTURER') router.push('/dashboard/lecturer');
      else router.push('/dashboard/student');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (newRole !== 'STUDENT') setMatricNumber('');
    setError('');
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans">
      <div className="hidden lg:flex w-1/2 bg-zinc-950 flex-col justify-between p-12 border-r border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-white rounded-sm"></div>
          <span className="text-white text-xl font-bold tracking-tight">ATD</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl text-white font-medium tracking-tighter leading-tight">
            Try to attend al your lectures.<br />
            <span className="text-zinc-500">Beat the 75%.</span>
          </h1>
          <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
            Prevent being chased out of the exam hall.
            Remember, meeting the 75% threshold is mandatory for exam eligibility.
            No excuses.
            Prevent being chased out of the exam hall. 
            Remember, we no send you for here.
          </p>
        </div>

        <div className="text-zinc-600 text-xs font-mono">
          v1.0.0 - &copy; 2026 IFT (xxx) group 1
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">Create an account</h2>
            <p className="text-sm text-zinc-500">Set up your profile to access the attendance portal.</p>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex p-1 bg-zinc-100 rounded-lg">
            {['STUDENT', 'LECTURER', 'ADMIN'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`flex-1 py-2 text-xs font-medium rounded-md capitalize transition-all duration-200 ${
                  role === r
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {r.toLowerCase()}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="e.g. Amarachukwu Onuoha"
              />
            </div>

            {role === 'STUDENT' && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 uppercase tracking-wider">
                  Matriculation Number
                </label>
                <input
                  type="text"
                  required
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  placeholder="e.g. AU202301027"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700 uppercase tracking-wider">
                {role === 'STUDENT' ? 'Student Email Address' : 'Work Email Address'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder={role === 'STUDENT' ? 'name@student.augustineuniversity.edu.ng' : 'name@augustineuniversity.edu.ng'}
              />
            </div>

            {(role === 'STUDENT' || role === 'LECTURER') && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-700 uppercase tracking-wider">
                  {role === 'LECTURER'
                    ? `Select Courses to Teach (${selectedCourseIds.length}/3 max)`
                    : `Select Your Courses (${selectedCourseIds.length} selected)`}
                </label>

                <div className="max-h-56 overflow-y-auto border border-zinc-200 rounded-lg p-3 space-y-2">
                  {courses.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      {role === 'LECTURER'
                        ? 'No unassigned courses available.'
                        : 'No lecturer-assigned courses available yet.'}
                    </p>
                  ) : (
                    courses.map((course) => (
                      <label key={course.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCourseIds.includes(course.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (role === 'LECTURER' && selectedCourseIds.length >= 3) {
                                alert('Lecturers can only select a maximum of 3 courses.');
                                return;
                              }

                              setSelectedCourseIds((prev) => [...prev, course.id]);
                            } else {
                              setSelectedCourseIds((prev) =>
                                prev.filter((id) => id !== course.id)
                              );
                            }
                          }}
                        />

                        <span>
                          {course.courseCode} - {course.courseTitle}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1 pt-2">
              <label className="text-xs font-medium text-zinc-700 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="Create a strong password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 mt-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex justify-center items-center h-12"
            >
              {isSubmitting ? 'Creating Account...' : 'Register Profile'}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-zinc-600">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-zinc-900 hover:underline">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}