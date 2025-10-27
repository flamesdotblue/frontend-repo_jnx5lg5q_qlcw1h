import React from 'react';

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const subjectColors = {
  Physics: 'from-sky-500 to-sky-600',
  Chemistry: 'from-amber-500 to-amber-600',
  Mathematics: 'from-emerald-500 to-emerald-600',
  Biology: 'from-green-500 to-green-600',
  'Computer Science': 'from-indigo-500 to-indigo-600',
  English: 'from-rose-500 to-rose-600',
  History: 'from-orange-500 to-orange-600',
  Geography: 'from-teal-500 to-teal-600',
  Economics: 'from-purple-500 to-purple-600',
  Bengali: 'from-pink-500 to-pink-600',
  Break: 'from-zinc-200 to-zinc-100',
};

function Block({ subject }) {
  const gradient = subjectColors[subject] || 'from-gray-200 to-gray-100';
  const isBreak = subject === 'Break';
  return (
    <div
      className={`h-14 rounded-md text-sm font-medium flex items-center justify-center select-none ${
        isBreak
          ? 'bg-white/60 backdrop-blur border border-gray-200 text-gray-700'
          : `text-white bg-gradient-to-br ${gradient} shadow`
      }`}
      title={subject}
    >
      {subject}
    </div>
  );
}

export default function Timetable({ data }) {
  const sections = Object.keys(data);

  return (
    <div className="max-w-6xl mx-auto px-6 pb-10">
      {sections.map((section) => (
        <div key={section} className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{section}</h3>
            <div className="text-xs text-gray-500">Period 4 is a common break</div>
          </div>
          <div className="grid grid-cols-8 gap-2">
            <div className="text-xs font-semibold text-gray-600">Day/Period</div>
            {[1,2,3,4,5,6,7].map((p) => (
              <div key={p} className="text-xs font-semibold text-gray-600 text-center">{p}</div>
            ))}
            {dayOrder.map((day) => (
              <React.Fragment key={day}>
                <div className="text-xs font-medium text-gray-700 flex items-center">{day}</div>
                {[1,2,3,4,5,6,7].map((period) => {
                  const slot = data[section].find((s) => s.day === day && s.period === period);
                  return <Block key={period} subject={slot?.subject || ''} />;
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
