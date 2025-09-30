import { UserNav } from '@/components/auth/user-nav';

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Learning App</h1>
            </a>
          </div>
          
          <div className="flex items-center">
            <UserNav />
          </div>
        </div>
      </div>
    </nav>
  );
}
