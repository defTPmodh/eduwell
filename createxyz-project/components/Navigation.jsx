"use client";
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <nav className="nav-container fixed w-full top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                <div>
                  <h1 className="text-2xl font-serif text-[#4A5D45]">EduWell</h1>
                  <p className="text-sm text-[#7C8B74]">Supporting mental wellness</p>
                </div>
              </div>
            </Link>
            
            {session && (
              <div className="hidden md:flex gap-6">
                <Link 
                  href="/dashboard"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    pathname === '/dashboard' 
                      ? 'bg-[#94A187]/20 text-[#4A5D45]' 
                      : 'hover:bg-[#94A187]/10 text-[#7C8B74]'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/wellness-tools"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    pathname === '/wellness-tools' 
                      ? 'bg-[#94A187]/20 text-[#4A5D45]' 
                      : 'hover:bg-[#94A187]/10 text-[#7C8B74]'
                  }`}
                >
                  Wellness Tools
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-[#4A5D45]">Welcome, {session.user?.name || 'User'}</span>
                <button
                  onClick={() => signOut()}
                  className="btn-secondary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="btn-primary"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 