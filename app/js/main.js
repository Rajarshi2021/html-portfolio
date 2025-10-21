import { loadData, saveData, exportData, importDataFromFile } from './storage.js';
import { createSubject } from './models.js';
import { renderTaxonomyTree } from './ui-taxonomy.js';
import { renderTabs, renderContent, TABS } from './ui-content.js';
import { getSampleData } from './sample-data.js';

let data = loadData();
// Seed sample data on first load if everything is empty
if (
  data.subjects.length === 0 &&
  data.topics.length === 0 &&
  data.subtopics.length === 0 &&
  data.questionBanks.length === 0 &&
  data.videos.length === 0 &&
  data.tests.length === 0 &&
  data.notes.length === 0 &&
  data.flashcards.length === 0
) {
  data = getSampleData();
  saveData(data);
}
let activeTab = 'questionBanks';
let selection = null; // { type: 'subject'|'topic'|'subtopic', id }

const tabsEl = document.getElementById('tabs');
const contentEl = document.getElementById('content');
const treeEl = document.getElementById('taxonomy-tree');

renderTabs(tabsEl, activeTab, (key) => { activeTab = key; render(); });

function render() {
  renderTaxonomyTree(treeEl, data, (sel) => { selection = sel; render(); });
  renderTabs(tabsEl, activeTab, (key) => { activeTab = key; render(); });
  renderContent(contentEl, data, selection, activeTab);
}

render();

// global actions
const addSubjectBtn = document.getElementById('add-subject-btn');
addSubjectBtn.onclick = () => {
  const name = prompt('New subject name (e.g., Anatomy)');
  if (!name) return;
  data.subjects.push(createSubject(name));
  saveData(data);
  render();
};

const exportBtn = document.getElementById('export-json-btn');
exportBtn.onclick = () => exportData(data);

const importInput = document.getElementById('import-json-input');
importInput.onchange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const imported = await importDataFromFile(file);
    data = imported;
    saveData(data);
    render();
    alert('Import successful');
  } catch (err) {
    console.error(err);
    alert('Failed to import file');
  } finally {
    importInput.value = '';
  }
};
