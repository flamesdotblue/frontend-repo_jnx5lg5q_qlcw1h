import React, { useMemo, useState } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import Timetable from './components/Timetable';
import SummaryPanel from './components/SummaryPanel';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1,2,3,4,5,6,7];
const SUBJECTS = [
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

// Simple deterministic RNG for reproducibility per section
function mulberry32(a) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWithConstraints({ rng, remainingCounts, remainingDays, daySet }) {
  // Candidates: subjects with remaining > 0 and not yet used today
  const candidates = SUBJECTS.filter((s) => remainingCounts[s] > 0 && !daySet.has(s));
  if (candidates.length === 0) return null;

  // Shuffle candidates deterministically
  const shuffled = [...candidates].sort(() => rng() - 0.5);

  // Feasibility check: after choosing a subject, no subject's remaining may exceed remainingDays
  for (const c of shuffled) {
    remainingCounts[c] -= 1;
    const feasible = SUBJECTS.every((s) => remainingCounts[s] <= remainingDays);
    remainingCounts[c] += 1;
    if (feasible) return c;
  }

  // Fallback: pick the candidate with highest remaining (greedy)
  return shuffled.sort((a,b) => remainingCounts[b] - remainingCounts[a])[0];
}

function generateTimetableForSection(sectionKey) {
  // Each subject should appear 3 times/week (30 slots / 10 subjects)
  const remainingCounts = Object.fromEntries(SUBJECTS.map((s) => [s, 3]));
  const rng = mulberry32(sectionKey.split('').reduce((a,c) => a + c.charCodeAt(0), 0));

  const data = [];

  for (let d = 0; d < DAYS.length; d++) {
    const day = DAYS[d];
    const daySet = new Set(); // enforce uniqueness per day → inherently prevents consecutive duplicates
    const remainingDays = DAYS.length - d; // including today

    for (let p of PERIODS) {
      if (p === 4) {
        data.push({ day, period: p, subject: 'Break' });
        continue;
      }
      const subject = pickWithConstraints({ rng, remainingCounts, remainingDays, daySet });
      if (!subject) {
        // Extremely unlikely with our constraints; perform a simple repair by picking any remaining
        const fallback = SUBJECTS.find((s) => remainingCounts[s] > 0 && !daySet.has(s));
        if (!fallback) throw new Error('Unable to schedule subject');
        daySet.add(fallback);
        remainingCounts[fallback] -= 1;
        data.push({ day, period: p, subject: fallback });
      } else {
        daySet.add(subject);
        remainingCounts[subject] -= 1;
        data.push({ day, period: p, subject });
      }
    }

    // Small per-day rotation to differentiate sections more
    // Swap last two periods (6 and 7) for odd-numbered sections by key length parity
    if (sectionKey.length % 2 === 1) {
      const idx6 = data.findIndex((e) => e.day === day && e.period === 6);
      const idx7 = data.findIndex((e) => e.day === day && e.period === 7);
      if (idx6 !== -1 && idx7 !== -1) {
        const tmp = data[idx6].subject;
        data[idx6].subject = data[idx7].subject;
        data[idx7].subject = tmp;
      }
    }
  }

  return data;
}

function ensureSectionUniqueness(all) {
  // If any two sections share identical daily layout (excluding Break), rotate one of them
  const sections = Object.keys(all);
  const signature = (arr, day) => arr
    .filter((x) => x.day === day && x.period !== 4)
    .sort((a,b) => a.period - b.period)
    .map((x) => x.subject)
    .join('|');

  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      for (const day of DAYS) {
        const sigA = signature(all[sections[i]], day);
        const sigB = signature(all[sections[j]], day);
        if (sigA === sigB) {
          // rotate j's day periods 1 step to the right (excluding break)
          const items = all[sections[j]]
            .filter((x) => x.day === day && x.period !== 4)
            .sort((a,b) => a.period - b.period);
          const last = items[items.length - 1].subject;
          for (let k = items.length - 1; k > 0; k--) items[k].subject = items[k-1].subject;
          items[0].subject = last;
        }
      }
    }
  }

  return all;
}

export default function App() {
  const [sections, setSections] = useState(['A','B','C','D']);
  const [data, setData] = useState({});

  const json = useMemo(() => JSON.stringify(data, null, 2), [data]);

  const generate = () => {
    const result = {};
    sections.forEach((s) => {
      result[`Section ${s}`] = generateTimetableForSection(s);
    });
    ensureSectionUniqueness(result);
    setData(result);
  };

  const copyJSON = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('JSON copied to clipboard');
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-generate on first load
  React.useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <Header />
      <Controls sections={sections} setSections={setSections} onGenerate={generate} json={json} onCopy={copyJSON} />

      {/* JSON Preview */}
      <div className="max-w-6xl mx-auto px-6 pb-6">
        <h3 className="text-lg font-semibold mb-2">Generated Timetable (JSON)</h3>
        <pre className="bg-black text-emerald-300 p-4 rounded-lg overflow-auto text-xs leading-relaxed max-h-80">{json}</pre>
      </div>

      {Object.keys(data).length > 0 && <Timetable data={data} />}

      {Object.keys(data).length > 0 && <SummaryPanel data={data} />}

      <footer className="py-8 text-center text-xs text-gray-500">Built with React + Tailwind. All rules enforced client-side.</footer>
    </div>
  );
}
