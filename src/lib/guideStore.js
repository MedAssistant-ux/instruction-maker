const BASE = import.meta.env.BASE_URL

export async function fetchGuideIndex() {
  const res = await fetch(`${BASE}guides/index.json`)
  return res.json()
}

export async function fetchGuide(id) {
  const res = await fetch(`${BASE}guides/${id}.json`)
  return res.json()
}

export function saveDraft(guide) {
  localStorage.setItem(`draft-${guide.id}`, JSON.stringify(guide))
}

export function loadDraft(id) {
  const data = localStorage.getItem(`draft-${id}`)
  return data ? JSON.parse(data) : null
}

export function listDrafts() {
  const drafts = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('draft-')) {
      try {
        drafts.push(JSON.parse(localStorage.getItem(key)))
      } catch (e) {}
    }
  }
  return drafts
}

export function deleteDraft(id) {
  localStorage.removeItem(`draft-${id}`)
}

export function createEmptyGuide(title) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return {
    id,
    title,
    category: '',
    description: '',
    lastUpdated: new Date().toISOString().split('T')[0],
    sections: [
      {
        id: 'sec1',
        title: 'Section 1',
        steps: [
          {
            id: 'step1',
            title: 'Step 1',
            screenshots: [],
            annotations: [],
            directionHtml: ''
          }
        ]
      }
    ]
  }
}
