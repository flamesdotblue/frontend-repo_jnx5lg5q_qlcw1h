import React from 'react';

export default function Header() {
  return (
    <header className="w-full py-8 bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">AI Timetable Generation System</h1>
        <p className="mt-2 text-sm md:text-base text-white/90">
          Generate complete, balanced weekly timetables for multiple sections with fixed lunch breaks and smart distribution.
        </p>
      </div>
    </header>
  );
}
