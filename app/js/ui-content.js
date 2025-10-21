import { saveData } from './storage.js';
import { createQuestionBank, createVideo, createTest, createNote, createFlashcard } from './models.js';

export const TABS = [
  { key: 'questionBanks', label: 'Question Banks' },
  { key: 'videos', label: 'Videos' },
  { key: 'tests', label: 'Tests' },
  { key: 'notes', label: 'Notes' },
  { key: 'flashcards', label: 'Flashcards' },
];

export function renderTabs(el, activeKey, onChange) {
  el.innerHTML = '';
  for (const tab of TABS) {
    const btn = document.createElement('button');
    btn.textContent = tab.label;
    btn.className = tab.key === activeKey ? 'active' : '';
    btn.onclick = () => onChange(tab.key);
    el.appendChild(btn);
  }
}

export function renderContent(el, data, selection, activeKey) {
  el.innerHTML = '';
  switch (activeKey) {
    case 'questionBanks':
      renderQuestionBanks(el, data, selection);
      break;
    case 'videos':
      renderVideos(el, data, selection);
      break;
    case 'tests':
      renderTests(el, data, selection);
      break;
    case 'notes':
      renderNotes(el, data, selection);
      break;
    case 'flashcards':
      renderFlashcards(el, data, selection);
      break;
  }
}

function taxonomyFilter(selection) {
  if (!selection) return () => true;
  if (selection.type === 'subject') return item => item.subjectId === selection.id;
  if (selection.type === 'topic') return item => item.topicId === selection.id;
  if (selection.type === 'subtopic') return item => item.subtopicId === selection.id;
  return () => true;
}

function taxonomySelectors(data) {
  const subjectSelect = document.createElement('select');
  subjectSelect.innerHTML = '<option value="">Subject</option>' + data.subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  const topicSelect = document.createElement('select');
  topicSelect.innerHTML = '<option value="">Topic</option>' + data.topics.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  const subtopicSelect = document.createElement('select');
  subtopicSelect.innerHTML = '<option value="">Subtopic</option>' + data.subtopics.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  return { subjectSelect, topicSelect, subtopicSelect };
}

function renderQuestionBanks(el, data, selection) {
  const header = document.createElement('div');
  header.className = 'card';

  const titleInput = document.createElement('input');
  titleInput.placeholder = 'Question Bank title';
  titleInput.className = 'input';
  const desc = document.createElement('textarea');
  desc.placeholder = 'Description (optional)';

  const { subjectSelect, topicSelect, subtopicSelect } = taxonomySelectors(data);

  const createBtn = document.createElement('button');
  createBtn.className = 'primary';
  createBtn.textContent = 'Create Question Bank';
  createBtn.onclick = () => {
    const qb = createQuestionBank({
      title: titleInput.value.trim(),
      description: desc.value.trim(),
      subjectId: subjectSelect.value || null,
      topicId: topicSelect.value || null,
      subtopicId: subtopicSelect.value || null,
      questionItems: []
    });
    if (!qb.title) return alert('Title required');
    data.questionBanks.push(qb);
    saveData(data);
    renderQuestionBanks(el, data, selection);
  };

  header.appendChild(makeLabeled('Title', titleInput));
  header.appendChild(makeLabeled('Description', desc));
  header.appendChild(makeRow(makeLabeled('Subject', subjectSelect), makeLabeled('Topic', topicSelect), makeLabeled('Subtopic', subtopicSelect)));
  header.appendChild(makeActions(createBtn));

  el.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'grid';
  const items = data.questionBanks.filter(taxonomyFilter(selection));
  for (const qb of items) {
    grid.appendChild(renderQBCard(qb, data));
  }
  el.appendChild(grid);
}

function renderQBCard(qb, data) {
  const card = document.createElement('div');
  card.className = 'card';

  const h3 = document.createElement('h3');
  h3.textContent = qb.title;

  const p = document.createElement('p');
  p.textContent = qb.description || '';

  const table = document.createElement('table');
  table.className = 'table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Question</th><th>Answer</th><th></th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  for (const item of qb.questionItems) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(item.q)}</td><td>${escapeHtml(item.a)}</td>`;
    const tdActions = document.createElement('td');
    const del = document.createElement('button');
    del.className = 'ghost tiny';
    del.textContent = 'Delete';
    del.onclick = () => {
      qb.questionItems = qb.questionItems.filter(i => i !== item);
      saveData(data);
      card.replaceWith(renderQBCard(qb, data));
    };
    tdActions.appendChild(del);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  // add new question item
  const qInput = document.createElement('input');
  qInput.placeholder = 'Question';
  qInput.className = 'input';
  const aInput = document.createElement('input');
  aInput.placeholder = 'Answer';
  aInput.className = 'input';
  const addBtn = document.createElement('button');
  addBtn.className = 'ghost';
  addBtn.textContent = 'Add Q/A';
  addBtn.onclick = () => {
    const q = qInput.value.trim();
    const a = aInput.value.trim();
    if (!q || !a) return;
    qb.questionItems.push({ q, a });
    qInput.value = '';
    aInput.value = '';
    saveData(data);
    card.replaceWith(renderQBCard(qb, data));
  };

  const related = renderRelatedLinks(data, qb.subjectId, qb.topicId, qb.subtopicId, { exclude: 'questionBanks' });

  const actions = document.createElement('div');
  actions.className = 'actions';
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'ghost';
  deleteBtn.textContent = 'Delete Bank';
  deleteBtn.onclick = () => {
    if (!confirm('Delete this Question Bank?')) return;
    data.questionBanks = data.questionBanks.filter(x => x.id !== qb.id);
    saveData(data);
    card.remove();
  };

  actions.appendChild(deleteBtn);

  card.appendChild(h3);
  if (qb.description) card.appendChild(p);
  card.appendChild(table);
  card.appendChild(makeRow(makeLabeled('Question', qInput), makeLabeled('Answer', aInput)));
  card.appendChild(makeActions(addBtn));
  card.appendChild(related);
  card.appendChild(actions);
  return card;
}

function renderVideos(el, data, selection) {
  const header = document.createElement('div');
  header.className = 'card';

  const titleInput = document.createElement('input');
  titleInput.placeholder = 'Video title';
  titleInput.className = 'input';
  const urlInput = document.createElement('input');
  urlInput.placeholder = 'Video URL (YouTube, etc.)';
  urlInput.className = 'input';
  const desc = document.createElement('textarea');
  desc.placeholder = 'Description (optional)';

  const { subjectSelect, topicSelect, subtopicSelect } = taxonomySelectors(data);
  const createBtn = document.createElement('button');
  createBtn.className = 'primary';
  createBtn.textContent = 'Add Video';
  createBtn.onclick = () => {
    const item = createVideo({
      title: titleInput.value.trim(),
      url: urlInput.value.trim(),
      description: desc.value.trim(),
      subjectId: subjectSelect.value || null,
      topicId: topicSelect.value || null,
      subtopicId: subtopicSelect.value || null,
    });
    if (!item.title || !item.url) return alert('Title and URL required');
    data.videos.push(item);
    saveData(data);
    renderVideos(el, data, selection);
  };

  header.appendChild(makeLabeled('Title', titleInput));
  header.appendChild(makeLabeled('URL', urlInput));
  header.appendChild(makeLabeled('Description', desc));
  header.appendChild(makeRow(makeLabeled('Subject', subjectSelect), makeLabeled('Topic', topicSelect), makeLabeled('Subtopic', subtopicSelect)));
  header.appendChild(makeActions(createBtn));
  el.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'grid';
  for (const v of data.videos.filter(taxonomyFilter(selection))) {
    const card = document.createElement('div');
    card.className = 'card';
    const h3 = document.createElement('h3');
    h3.textContent = v.title;
    const a = document.createElement('a');
    a.href = v.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Open video';
    const related = renderRelatedLinks(data, v.subjectId, v.topicId, v.subtopicId, { exclude: 'videos' });

    const del = document.createElement('button');
    del.className = 'ghost';
    del.textContent = 'Delete';
    del.onclick = () => {
      data.videos = data.videos.filter(x => x.id !== v.id);
      saveData(data);
      card.remove();
    };

    card.appendChild(h3);
    if (v.description) { const p = document.createElement('p'); p.textContent = v.description; card.appendChild(p); }
    card.appendChild(a);
    card.appendChild(related);
    card.appendChild(makeActions(del));
    grid.appendChild(card);
  }
  el.appendChild(grid);
}

function renderTests(el, data, selection) {
  const header = document.createElement('div');
  header.className = 'card';

  const titleInput = document.createElement('input');
  titleInput.placeholder = 'Test title';
  titleInput.className = 'input';
  const desc = document.createElement('textarea');
  desc.placeholder = 'Description (optional)';
  const { subjectSelect, topicSelect, subtopicSelect } = taxonomySelectors(data);

  const createBtn = document.createElement('button');
  createBtn.className = 'primary';
  createBtn.textContent = 'Create Test';
  createBtn.onclick = () => {
    const item = createTest({
      title: titleInput.value.trim(),
      description: desc.value.trim(),
      subjectId: subjectSelect.value || null,
      topicId: topicSelect.value || null,
      subtopicId: subtopicSelect.value || null,
      questions: []
    });
    if (!item.title) return alert('Title required');
    data.tests.push(item);
    saveData(data);
    renderTests(el, data, selection);
  };

  header.appendChild(makeLabeled('Title', titleInput));
  header.appendChild(makeLabeled('Description', desc));
  header.appendChild(makeRow(makeLabeled('Subject', subjectSelect), makeLabeled('Topic', topicSelect), makeLabeled('Subtopic', subtopicSelect)));
  header.appendChild(makeActions(createBtn));
  el.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'grid';
  for (const t of data.tests.filter(taxonomyFilter(selection))) {
    const card = document.createElement('div');
    card.className = 'card';
    const h3 = document.createElement('h3'); h3.textContent = t.title;

    const related = renderRelatedLinks(data, t.subjectId, t.topicId, t.subtopicId, { exclude: 'tests' });

    const del = document.createElement('button');
    del.className = 'ghost'; del.textContent = 'Delete';
    del.onclick = () => { data.tests = data.tests.filter(x => x.id !== t.id); saveData(data); card.remove(); };

    card.appendChild(h3);
    if (t.description) { const p = document.createElement('p'); p.textContent = t.description; card.appendChild(p); }
    card.appendChild(related);
    card.appendChild(makeActions(del));
    grid.appendChild(card);
  }
  el.appendChild(grid);
}

function renderNotes(el, data, selection) {
  const header = document.createElement('div');
  header.className = 'card';

  const titleInput = document.createElement('input');
  titleInput.placeholder = 'Note title';
  titleInput.className = 'input';
  const bodyInput = document.createElement('textarea');
  bodyInput.placeholder = 'Write your note...';

  const { subjectSelect, topicSelect, subtopicSelect } = taxonomySelectors(data);
  const createBtn = document.createElement('button');
  createBtn.className = 'primary';
  createBtn.textContent = 'Add Note';
  createBtn.onclick = () => {
    const item = createNote({
      title: titleInput.value.trim(),
      body: bodyInput.value.trim(),
      subjectId: subjectSelect.value || null,
      topicId: topicSelect.value || null,
      subtopicId: subtopicSelect.value || null,
    });
    if (!item.title) return alert('Title required');
    data.notes.push(item);
    saveData(data);
    renderNotes(el, data, selection);
  };

  header.appendChild(makeLabeled('Title', titleInput));
  header.appendChild(makeLabeled('Body', bodyInput));
  header.appendChild(makeRow(makeLabeled('Subject', subjectSelect), makeLabeled('Topic', topicSelect), makeLabeled('Subtopic', subtopicSelect)));
  header.appendChild(makeActions(createBtn));
  el.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'grid';
  for (const n of data.notes.filter(taxonomyFilter(selection))) {
    const card = document.createElement('div'); card.className = 'card';
    const h3 = document.createElement('h3'); h3.textContent = n.title;
    const p = document.createElement('p'); p.textContent = n.body;
    const related = renderRelatedLinks(data, n.subjectId, n.topicId, n.subtopicId, { exclude: 'notes' });

    const del = document.createElement('button'); del.className = 'ghost'; del.textContent = 'Delete';
    del.onclick = () => { data.notes = data.notes.filter(x => x.id !== n.id); saveData(data); card.remove(); };

    card.appendChild(h3); card.appendChild(p); card.appendChild(related); card.appendChild(makeActions(del));
    grid.appendChild(card);
  }
  el.appendChild(grid);
}

function renderFlashcards(el, data, selection) {
  const header = document.createElement('div'); header.className = 'card';

  const frontInput = document.createElement('textarea'); frontInput.placeholder = 'Front';
  const backInput = document.createElement('textarea'); backInput.placeholder = 'Back';
  const { subjectSelect, topicSelect, subtopicSelect } = taxonomySelectors(data);

  const createBtn = document.createElement('button'); createBtn.className = 'primary'; createBtn.textContent = 'Add Flashcard';
  createBtn.onclick = () => {
    const item = createFlashcard({
      front: frontInput.value.trim(),
      back: backInput.value.trim(),
      subjectId: subjectSelect.value || null,
      topicId: topicSelect.value || null,
      subtopicId: subtopicSelect.value || null,
    });
    if (!item.front || !item.back) return alert('Front and Back required');
    data.flashcards.push(item);
    saveData(data);
    renderFlashcards(el, data, selection);
  };

  header.appendChild(makeRow(makeLabeled('Front', frontInput), makeLabeled('Back', backInput)));
  header.appendChild(makeRow(makeLabeled('Subject', subjectSelect), makeLabeled('Topic', topicSelect), makeLabeled('Subtopic', subtopicSelect)));
  header.appendChild(makeActions(createBtn));
  el.appendChild(header);

  const grid = document.createElement('div'); grid.className = 'grid';
  for (const c of data.flashcards.filter(taxonomyFilter(selection))) {
    const card = document.createElement('div'); card.className = 'card';
    const h3 = document.createElement('h3'); h3.textContent = 'Flashcard';
    const front = document.createElement('p'); front.textContent = c.front;
    const back = document.createElement('p'); back.textContent = c.back;

    const related = renderRelatedLinks(data, c.subjectId, c.topicId, c.subtopicId, { exclude: 'flashcards' });

    const del = document.createElement('button'); del.className = 'ghost'; del.textContent = 'Delete';
    del.onclick = () => { data.flashcards = data.flashcards.filter(x => x.id !== c.id); saveData(data); card.remove(); };

    card.appendChild(h3); card.appendChild(front); card.appendChild(back); card.appendChild(related); card.appendChild(makeActions(del));
    grid.appendChild(card);
  }
  el.appendChild(grid);
}

function makeRow(...els) { const row = document.createElement('div'); row.className = 'row'; els.forEach(e => row.appendChild(e)); return row; }
function makeActions(...els) { const div = document.createElement('div'); div.className = 'actions'; els.forEach(e => div.appendChild(e)); return div; }
function makeLabeled(label, el) { const wrapper = document.createElement('div'); const l = document.createElement('label'); l.textContent = label; wrapper.appendChild(l); wrapper.appendChild(el); return wrapper; }

function escapeHtml(str) { return str.replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c])); }

function renderRelatedLinks(data, subjectId, topicId, subtopicId, opts = {}) {
  const container = document.createElement('div');
  container.className = 'card';
  const h4 = document.createElement('h4'); h4.textContent = 'Related';

  const lists = [];
  const filter = (x) => (
    (subjectId && x.subjectId === subjectId) ||
    (topicId && x.topicId === topicId) ||
    (subtopicId && x.subtopicId === subtopicId)
  );

  const groupDefs = [
    { key: 'questionBanks', label: 'Question Banks', getTitle: x => x.title },
    { key: 'videos', label: 'Videos', getTitle: x => x.title },
    { key: 'tests', label: 'Tests', getTitle: x => x.title },
    { key: 'notes', label: 'Notes', getTitle: x => x.title },
    { key: 'flashcards', label: 'Flashcards', getTitle: x => x.front }
  ];

  for (const def of groupDefs) {
    if (opts.exclude === def.key) continue;
    const items = data[def.key].filter(filter);
    if (items.length === 0) continue;
    const block = document.createElement('div');
    const lbl = document.createElement('div'); lbl.style.fontWeight = '600'; lbl.textContent = def.label;
    const ul = document.createElement('ul');
    for (const x of items) {
      const li = document.createElement('li'); li.textContent = def.getTitle(x);
      ul.appendChild(li);
    }
    block.appendChild(lbl); block.appendChild(ul);
    lists.push(block);
  }

  container.appendChild(h4);
  if (lists.length === 0) {
    const p = document.createElement('p'); p.textContent = 'No related content yet.'; container.appendChild(p);
  } else {
    for (const l of lists) container.appendChild(l);
  }
  return container;
}
