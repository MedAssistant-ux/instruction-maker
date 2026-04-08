const BASE = import.meta.env.BASE_URL

export async function fetchGuideIndex() {
  const res = await fetch(`${BASE}guides/index.json`)
  return res.json()
}

export async function fetchGuide(id) {
  const res = await fetch(`${BASE}guides/${id}.json`)
  return res.json()
}

// --- Drafts (work in progress) ---

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

// --- Published guides (localStorage) ---

export function publishGuide(guide) {
  guide.lastUpdated = new Date().toISOString().split('T')[0]
  localStorage.setItem(`guide-${guide.id}`, JSON.stringify(guide))
  // Remove draft if it exists
  localStorage.removeItem(`draft-${guide.id}`)
}

export function loadPublishedGuide(id) {
  const data = localStorage.getItem(`guide-${id}`)
  return data ? JSON.parse(data) : null
}

export function listPublishedGuides() {
  const guides = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('guide-')) {
      try {
        guides.push(JSON.parse(localStorage.getItem(key)))
      } catch (e) {}
    }
  }
  return guides
}

export function deletePublishedGuide(id) {
  localStorage.removeItem(`guide-${id}`)
}

// --- Delete any guide (published, draft, or static) ---

export function deleteGuide(id) {
  localStorage.removeItem(`guide-${id}`)
  localStorage.removeItem(`draft-${id}`)
  // Track deleted static guides so they don't reappear
  const deleted = JSON.parse(localStorage.getItem('deleted-static-guides') || '[]')
  if (!deleted.includes(id)) {
    deleted.push(id)
    localStorage.setItem('deleted-static-guides', JSON.stringify(deleted))
  }
}

export function getDeletedStaticGuides() {
  return JSON.parse(localStorage.getItem('deleted-static-guides') || '[]')
}

// --- PDF guides ---

export function publishPdfGuide({ title, category, description, pdfDataUrl }) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const guide = {
    id,
    title,
    category: category || '',
    description: description || '',
    lastUpdated: new Date().toISOString().split('T')[0],
    type: 'pdf',
    pdfDataUrl,
  }
  localStorage.setItem(`guide-${id}`, JSON.stringify(guide))
  return guide
}

// --- Empty guide factory ---

export function createEmptyGuide(title) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
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
