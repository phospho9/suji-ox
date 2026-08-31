export interface SubjectTheme {
  subject: string;
  title: string;
  badge: string;
  bgGradient: string;
  primaryBtn: string;
  accentText: string;
}

export const SUBJECT_CONFIG: Record<string, SubjectTheme> = {
  'suji.haniw.com': {
    subject: '세계지리',
    title: '세계지리 정복',
    badge: '🌍',
    bgGradient: 'from-emerald-950 via-slate-900 to-slate-950',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    accentText: 'text-emerald-400',
  },
  'history.haniw.com': {
    subject: '한국사',
    title: '한국사 정복',
    badge: '📜',
    bgGradient: 'from-rose-950 via-slate-900 to-slate-950',
    primaryBtn: 'bg-rose-800 hover:bg-rose-900 text-white',
    accentText: 'text-rose-400',
  },
  'localhost': {
    subject: '세계지리',
    title: '세계지리 정복 (Dev)',
    badge: '🛠️',
    bgGradient: 'from-slate-900 via-zinc-900 to-black',
    primaryBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    accentText: 'text-indigo-400',
  }
};

export const getSubjectConfig = (): SubjectTheme => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return SUBJECT_CONFIG[host] ?? SUBJECT_CONFIG['suji.haniw.com']!;
};
