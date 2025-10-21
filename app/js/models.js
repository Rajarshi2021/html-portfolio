// IDs are strings for simplicity
export function generateId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// Taxonomy
export function createSubject(name) { return { id: generateId('subj'), name }; }
export function createTopic(subjectId, name) { return { id: generateId('topic'), subjectId, name }; }
export function createSubtopic(topicId, name) { return { id: generateId('subtopic'), topicId, name }; }

// Content
export function createQuestionBank(input) {
  const { title, description = '', subjectId = null, topicId = null, subtopicId = null, questionItems = [] } = input;
  return { id: generateId('qb'), title, description, subjectId, topicId, subtopicId, questionItems };
}

export function createVideo(input) {
  const { title, url, subjectId = null, topicId = null, subtopicId = null, description = '' } = input;
  return { id: generateId('vid'), title, url, description, subjectId, topicId, subtopicId };
}

export function createTest(input) {
  const { title, description = '', questions = [], subjectId = null, topicId = null, subtopicId = null } = input;
  return { id: generateId('test'), title, description, questions, subjectId, topicId, subtopicId };
}

export function createNote(input) {
  const { title, body = '', subjectId = null, topicId = null, subtopicId = null } = input;
  return { id: generateId('note'), title, body, subjectId, topicId, subtopicId };
}

export function createFlashcard(input) {
  const { front, back, subjectId = null, topicId = null, subtopicId = null } = input;
  return { id: generateId('card'), front, back, subjectId, topicId, subtopicId };
}
