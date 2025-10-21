export function getSampleData() {
  return {
    version: 1,
    subjects: [
      { id: 'subj_anat', name: 'Anatomy' },
      { id: 'subj_phys', name: 'Physiology' }
    ],
    topics: [
      { id: 'topic_cv', subjectId: 'subj_phys', name: 'Cardiovascular' },
      { id: 'topic_msk', subjectId: 'subj_anat', name: 'Musculoskeletal' }
    ],
    subtopics: [
      { id: 'sub_cv_heart', topicId: 'topic_cv', name: 'Heart Anatomy & Physiology' },
      { id: 'sub_msk_bones', topicId: 'topic_msk', name: 'Bones' }
    ],
    questionBanks: [
      { id: 'qb_1', title: 'Heart Basics', description: 'Intro questions', subjectId: 'subj_phys', topicId: 'topic_cv', subtopicId: 'sub_cv_heart', questionItems: [
        { q: 'What is the cardiac cycle?', a: 'Sequence of contraction and relaxation of the heart.' },
        { q: 'Define stroke volume', a: 'Amount of blood pumped by left ventricle per beat.' }
      ] }
    ],
    videos: [
      { id: 'vid_1', title: 'Heart Overview', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Overview of heart function', subjectId: 'subj_phys', topicId: 'topic_cv', subtopicId: 'sub_cv_heart' }
    ],
    tests: [
      { id: 'test_1', title: 'CV Quiz 1', description: 'Short quiz', subjectId: 'subj_phys', topicId: 'topic_cv', subtopicId: 'sub_cv_heart', questions: [] }
    ],
    notes: [
      { id: 'note_1', title: 'Preload vs Afterload', body: 'Preload is ventricular end-diastolic volume; Afterload is resistance to ejection.', subjectId: 'subj_phys', topicId: 'topic_cv', subtopicId: 'sub_cv_heart' }
    ],
    flashcards: [
      { id: 'card_1', front: 'Stroke Volume formula', back: 'SV = EDV - ESV', subjectId: 'subj_phys', topicId: 'topic_cv', subtopicId: 'sub_cv_heart' }
    ]
  };
}
