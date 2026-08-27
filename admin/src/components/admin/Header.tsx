"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Admin Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
            A
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              Administrator
            </p>
            <p className="text-xs text-gray-500">
              Store Manager
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}