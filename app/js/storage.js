export const STORAGE_KEY = 'pls-data-v1';

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyData();
    const parsed = JSON.parse(raw);
    return upgradeData(parsed);
  } catch (e) {
    console.error('Failed to load data', e);
    return createEmptyData();
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pls-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importDataFromFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  return upgradeData(parsed);
}

function createEmptyData() {
  return {
    version: 1,
    subjects: [],
    topics: [],
    subtopics: [],
    questionBanks: [],
    videos: [],
    tests: [],
    notes: [],
    flashcards: []
  };
}

function upgradeData(data) {
  // future migrations go here
  if (!data.version) data.version = 1;
  for (const key of ['subjects','topics','subtopics','questionBanks','videos','tests','notes','flashcards']) {
    if (!Array.isArray(data[key])) data[key] = [];
  }
  return data;
}
