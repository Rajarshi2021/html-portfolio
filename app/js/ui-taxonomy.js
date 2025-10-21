import { generateId, createSubject, createTopic, createSubtopic } from './models.js';
import { saveData } from './storage.js';

export function renderTaxonomyTree(rootEl, data, onSelect) {
  rootEl.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'tree';

  for (const subject of data.subjects) {
    const li = document.createElement('li');
    li.appendChild(renderSubjectNode(subject, data, onSelect));
    ul.appendChild(li);
  }
  rootEl.appendChild(ul);
}

function renderSubjectNode(subject, data, onSelect) {
  const container = document.createElement('div');
  container.className = 'node';

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = subject.name;
  title.onclick = () => onSelect({ type: 'subject', id: subject.id });

  const addTopicBtn = document.createElement('button');
  addTopicBtn.className = 'tiny ghost';
  addTopicBtn.textContent = '+ Topic';
  addTopicBtn.onclick = () => {
    const name = prompt('New topic name');
    if (!name) return;
    data.topics.push(createTopic(subject.id, name));
    saveData(data);
    renderTaxonomyTree(container.parentElement.parentElement, data, onSelect);
  };

  const renameBtn = document.createElement('button');
  renameBtn.className = 'tiny ghost';
  renameBtn.textContent = 'Rename';
  renameBtn.onclick = () => {
    const name = prompt('Subject name', subject.name);
    if (!name) return;
    subject.name = name;
    saveData(data);
    renderTaxonomyTree(container.parentElement.parentElement, data, onSelect);
  };

  const delBtn = document.createElement('button');
  delBtn.className = 'tiny ghost';
  delBtn.textContent = 'Delete';
  delBtn.onclick = () => {
    if (!confirm('Delete subject and all child topics/subtopics?')) return;
    const topicIds = data.topics.filter(t => t.subjectId === subject.id).map(t => t.id);
    data.subtopics = data.subtopics.filter(s => !topicIds.includes(s.topicId));
    data.topics = data.topics.filter(t => t.subjectId !== subject.id);
    data.subjects = data.subjects.filter(s => s.id !== subject.id);
    saveData(data);
    renderTaxonomyTree(container.parentElement.parentElement, data, onSelect);
  };

  container.appendChild(title);
  container.appendChild(addTopicBtn);
  container.appendChild(renameBtn);
  container.appendChild(delBtn);

  // topics
  const ul = document.createElement('ul');
  ul.className = 'tree';
  for (const topic of data.topics.filter(t => t.subjectId === subject.id)) {
    const li = document.createElement('li');
    li.appendChild(renderTopicNode(topic, data, onSelect));
    ul.appendChild(li);
  }
  container.appendChild(ul);

  return container;
}

function renderTopicNode(topic, data, onSelect) {
  const container = document.createElement('div');
  container.className = 'node';

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = topic.name;
  title.onclick = () => onSelect({ type: 'topic', id: topic.id });

  const addSubBtn = document.createElement('button');
  addSubBtn.className = 'tiny ghost';
  addSubBtn.textContent = '+ Subtopic';
  addSubBtn.onclick = () => {
    const name = prompt('New subtopic name');
    if (!name) return;
    data.subtopics.push(createSubtopic(topic.id, name));
    saveData(data);
    renderTaxonomyTree(container.parentElement.parentElement, data, onSelect);
  };

  const renameBtn = document.createElement('button');
  renameBtn.className = 'tiny ghost';
  renameBtn.textContent = 'Rename';
  renameBtn.onclick = () => {
    const name = prompt('Topic name', topic.name);
    if (!name) return;
    topic.name = name;
    saveData(data);
    renderTaxonomyTree(container.parentElement.parentElement, data, onSelect);
  };

  const delBtn = document.createElement('button');
  delBtn.className = 'tiny ghost';
  delBtn.textContent = 'Delete';
  delBtn.onclick = () => {
    if (!confirm('Delete topic and all child subtopics?')) return;
    data.subtopics = data.subtopics.filter(s => s.topicId !== topic.id);
    data.topics = data.topics.filter(t => t.id !== topic.id);
    saveData(data);
    renderTaxonomyTree(container.parentElement.parentElement, data, onSelect);
  };

  container.appendChild(title);
  container.appendChild(addSubBtn);
  container.appendChild(renameBtn);
  container.appendChild(delBtn);

  // subtopics
  const ul = document.createElement('ul');
  ul.className = 'tree';
  for (const sub of data.subtopics.filter(s => s.topicId === topic.id)) {
    const li = document.createElement('li');
    li.appendChild(renderSubtopicNode(sub, data, onSelect));
    ul.appendChild(li);
  }
  container.appendChild(ul);
  return container;
}

function renderSubtopicNode(sub, data, onSelect) {
  const container = document.createElement('div');
  container.className = 'node';

  const title = document.createElement('span');
  title.className = 'title';
  title.textContent = sub.name;
  title.onclick = () => onSelect({ type: 'subtopic', id: sub.id });

  const renameBtn = document.createElement('button');
  renameBtn.className = 'tiny ghost';
  renameBtn.textContent = 'Rename';
  renameBtn.onclick = () => {
    const name = prompt('Subtopic name', sub.name);
    if (!name) return;
    sub.name = name;
    saveData(data);
    renderTaxonomyTree(container.parentElement.parentElement, data, onSelect);
  };

  const delBtn = document.createElement('button');
  delBtn.className = 'tiny ghost';
  delBtn.textContent = 'Delete';
  delBtn.onclick = () => {
    if (!confirm('Delete subtopic?')) return;
    data.subtopics = data.subtopics.filter(s => s.id !== sub.id);
    saveData(data);
    renderTaxonomyTree(container.parentElement.parentElement, data, onSelect);
  };

  container.appendChild(title);
  container.appendChild(renameBtn);
  container.appendChild(delBtn);

  return container;
}
