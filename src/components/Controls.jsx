import React from 'react';

export default function Controls({ sections, setSections, onGenerate, json, onCopy }) {
  const toggleSection = (s) => {
    setSections((prev) => {
      const set = new Set(prev);
      if (set.has(s)) set.delete(s); else set.add(s);
      return Array.from(set).sort();
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Configuration</h2>
          <p className="text-sm text-gray-600">Select sections and generate an even, constraint-satisfying timetable.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['A','B','C','D'].map((s) => (
            <button
              key={s}
              onClick={() => toggleSection(s)}
              className={`px-3 py-1.5 rounded-full border transition ${sections.includes(s) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'}`}
            >
              Section {s}
            </button>
          ))}
          <button
            onClick={onGenerate}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition shadow"
          >
            Generate Timetable
          </button>
          <button
            onClick={() => onCopy(json)}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition"
          >
            Copy JSON
          </button>
        </div>
      </div>
    </div>
  );
}
