'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline-block">Logout</span>
    </button>
  );
}