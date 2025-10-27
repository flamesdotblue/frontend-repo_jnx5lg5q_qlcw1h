import React, { useMemo } from 'react';

const subjects = [
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography',
  'Economics',
  'Bengali',
];

export default function SummaryPanel({ data }) {
  const analysis = useMemo(() => {
    const result = {};
    const checks = {
      noConsecutive: true,
      noEmpty: true,
      uniqueDailyLayouts: true,
    };

    const dayLayoutsBySection = {};

    Object.entries(data).forEach(([section, entries]) => {
      const freq = Object.fromEntries(subjects.map((s) => [s, 0]));
      const byDay = {};
      for (const e of entries) {
        if (e.subject !== 'Break') freq[e.subject]++;
        if (!byDay[e.day]) byDay[e.day] = [];
        byDay[e.day].push(e);
        if (!e.subject) checks.noEmpty = false;
      }
      // Sort periods within day
      Object.values(byDay).forEach((arr) => arr.sort((a,b) => a.period - b.period));

      // Consecutive duplicates check
      Object.values(byDay).forEach((arr) => {
        for (let i = 0; i < arr.length - 1; i++) {
          const a = arr[i], b = arr[i+1];
          if (a.subject !== 'Break' && b.subject !== 'Break' && a.subject === b.subject) {
            checks.noConsecutive = false;
          }
        }
      });

      result[section] = { frequency: freq };

      // Capture layout signatures per day (excluding break) to compare across sections
      const signatures = new Map();
      for (const [day, arr] of Object.entries(byDay)) {
        const sig = arr.filter((x) => x.period !== 4).map((x) => x.subject).join('|');
        signatures.set(day, sig);
      }
      dayLayoutsBySection[section] = signatures;
    });

    // Uniqueness across sections: no two sections should have the same exact daily order for any given day
    const sections = Object.keys(dayLayoutsBySection);
    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const A = dayLayoutsBySection[sections[i]];
        const B = dayLayoutsBySection[sections[j]];
        for (const day of A.keys()) {
          if (A.get(day) === B.get(day)) {
            checks.uniqueDailyLayouts = false;
          }
        }
      }
    }

    // Balance score: measure variance from perfect 3 per subject
    const balance = {};
    Object.entries(result).forEach(([section, { frequency }]) => {
      const diffs = subjects.map((s) => Math.abs(frequency[s] - 3));
      const score = 100 - Math.round((diffs.reduce((a,b) => a + b, 0) / (subjects.length * 3)) * 100);
      balance[section] = score;
    });

    return { perSection: result, checks, balance };
  }, [data]);

  return (
    <div className="max-w-6xl mx-auto px-6 pb-10">
      <h3 className="text-lg font-semibold mb-3">Summary Report</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4 bg-white">
          <h4 className="font-medium mb-2">Subject frequency per section</h4>
          <div className="space-y-3">
            {Object.entries(analysis.perSection).map(([section, { frequency }]) => (
              <div key={section} className="text-sm">
                <div className="font-semibold mb-1">{section}</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {subjects.map((s) => (
                    <div key={s} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
                      <span className="text-gray-700">{s}</span>
                      <span className="font-mono">{frequency[s]}x</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border p-4 bg-white">
          <h4 className="font-medium mb-2">Checks & Balance</h4>
          <ul className="space-y-1 text-sm">
            <li> No consecutive duplicates: {analysis.checks.noConsecutive ? '✓' : '✗'} </li>
            <li> No empty slots (except Break): {analysis.checks.noEmpty ? '✓' : '✗'} </li>
            <li> Pattern uniqueness across sections: {analysis.checks.uniqueDailyLayouts ? '✓' : '✗'} </li>
          </ul>
          <div className="mt-3">
            <div className="font-medium mb-1">Balance Score (higher is better)</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(analysis.balance).map(([section, score]) => (
                <div key={section} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-sm">
                  <span>{section}</span>
                  <span className="font-mono">{score}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Suggestions: If any subject drifts from 3x/week, regenerate or adjust sections. Consider alternating sciences and humanities across days to keep cognitive load balanced.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
