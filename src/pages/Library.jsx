import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, ExternalLink, Calculator, Package, Trash2, FileUp, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { fetchGuideIndex, listDrafts, listPublishedGuides, deleteGuide, deleteDraft, getDeletedStaticGuides, publishPdfGuide } from '../lib/guideStore'
import GuideCard from '../components/GuideCard'
import SearchBar from '../components/SearchBar'

// --- PIN Delete Modal (inline component) ---
function PinDeleteModal({ isOpen, onClose, onConfirm }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setPin('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  function handleDelete() {
    if (pin === '1118') {
      onConfirm()
    } else {
      setError('Incorrect PIN')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
         onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl"
           onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Delete Guide</h3>
        <p className="text-sm text-gray-400 mb-4">Enter PIN to delete this guide</p>
        <input
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError('') }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleDelete() }}
          placeholder="Enter PIN"
          autoFocus
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100
                     placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-2"
        />
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600
                       rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-500
                       rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Library() {
  const navigate = useNavigate()
  const [staticGuides, setStaticGuides] = useState([])
  const [publishedGuides, setPublishedGuides] = useState([])
  const [drafts, setDrafts] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [refreshKey, setRefreshKey] = useState(0)

  // PIN modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, type: null })

  // Pinned guides
  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pinned-guides') || '[]')
    } catch { return [] }
  })

  useEffect(() => {
    fetchGuideIndex()
      .then(setStaticGuides)
      .catch(() => setStaticGuides([]))
    setPublishedGuides(listPublishedGuides())
    setDrafts(listDrafts())
  }, [refreshKey])

  // Save pinned to localStorage
  useEffect(() => {
    localStorage.setItem('pinned-guides', JSON.stringify(pinnedIds))
  }, [pinnedIds])

  function togglePin(id) {
    setPinnedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Merge static + published, exclude deleted static ones
  const allGuides = useMemo(() => {
    const deleted = getDeletedStaticGuides()
    const publishedIds = new Set(publishedGuides.map(g => g.id))
    const filtered = staticGuides.filter(g => !deleted.includes(g.id) && !publishedIds.has(g.id))
    return [...filtered, ...publishedGuides]
  }, [staticGuides, publishedGuides])

  // Categories with counts
  const categoriesWithCounts = useMemo(() => {
    const counts = {}
    allGuides.forEach(g => {
      const cat = g.category || 'Uncategorized'
      counts[cat] = (counts[cat] || 0) + 1
    })
    drafts.forEach(g => {
      const cat = g.category || 'Uncategorized'
      counts[cat] = (counts[cat] || 0) + 1
    })
    const total = allGuides.length + drafts.length
    const sorted = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))
    return [{ name: 'All', count: total }, ...sorted.map(([name, count]) => ({ name, count }))]
  }, [allGuides, drafts])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const filterFn = (g) => {
      const matchesSearch = !q ||
        g.title?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q)
      const matchesCategory = activeCategory === 'All' || g.category === activeCategory
      return matchesSearch && matchesCategory
    }

    // Sort: pinned first
    const sortByPin = (a, b) => {
      const aPin = pinnedIds.includes(a.id) ? 0 : 1
      const bPin = pinnedIds.includes(b.id) ? 0 : 1
      return aPin - bPin
    }

    return {
      guides: allGuides.filter(filterFn).sort(sortByPin),
      drafts: drafts.filter(filterFn).sort(sortByPin),
    }
  }, [allGuides, drafts, search, activeCategory, pinnedIds])

  // PIN-protected delete handlers
  function handleDeleteGuide(id, e) {
    e.stopPropagation()
    setDeleteModal({ open: true, id, type: 'guide' })
  }

  function handleDeleteDraft(id, e) {
    e.stopPropagation()
    setDeleteModal({ open: true, id, type: 'draft' })
  }

  function confirmDelete() {
    if (deleteModal.type === 'guide') {
      deleteGuide(deleteModal.id)
    } else {
      deleteDraft(deleteModal.id)
    }
    setDeleteModal({ open: false, id: null, type: null })
    setRefreshKey(k => k + 1)
  }

  // Duplicate handler
  function handleDuplicate(guide) {
    const newId = guide.id + '-copy-' + Date.now()
    const copy = {
      ...guide,
      id: newId,
      title: guide.title + ' (copy)',
      lastUpdated: new Date().toISOString().split('T')[0],
      version: 1,
      lastEdited: new Date().toISOString(),
    }
    localStorage.setItem(`guide-${newId}`, JSON.stringify(copy))
    setRefreshKey(k => k + 1)
  }

  function handleUploadPdf() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const title = file.name.replace(/\.pdf$/i, '')
        const category = prompt('Category (e.g., Methasoft, Pharmacy, Equipment):', '') || ''
        const description = prompt('Short description:', '') || ''
        publishPdfGuide({ title, category, description, pdfDataUrl: reader.result })
        setRefreshKey(k => k + 1)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* PIN Delete Modal */}
      <PinDeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, type: null })}
        onConfirm={confirmDelete}
      />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={28} className="text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-100">Instruction Maker</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUploadPdf}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700
                         text-gray-300 rounded-lg font-medium transition-colors"
            >
              <FileUp size={18} />
              Upload PDF
            </button>
            <button
              onClick={() => navigate('/editor')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500
                         text-white rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              Create New Guide
            </button>
          </div>
        </div>
      </header>

      {/* Other Tools Banner */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500 mr-1">Other Tools:</span>
          <a
            href="https://medassistant-ux.github.io/methadone-dose-calculator/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-500/15 text-green-400
                       rounded-lg hover:bg-green-500/25 transition-colors border border-green-500/20"
          >
            <Calculator size={15} />
            Methadone Dose Calculator
            <ExternalLink size={12} />
          </a>
          <a
            href="https://medassistant-ux.github.io/nmts-inventory/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-500/15 text-purple-400
                       rounded-lg hover:bg-purple-500/25 transition-colors border border-purple-500/20"
          >
            <Package size={15} />
            NMTS Inventory
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6 max-w-xl">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Category folder navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categoriesWithCounts.map(({ name, count }) => {
            const isActive = activeCategory === name
            return (
              <button
                key={name}
                onClick={() => setActiveCategory(isActive && name !== 'All' ? 'All' : name)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:border-gray-700 hover:text-gray-200'
                }`}
              >
                {isActive ? (
                  <>
                    <FolderOpen size={16} />
                    <ChevronDown size={14} />
                  </>
                ) : (
                  <>
                    <Folder size={16} />
                    <ChevronRight size={14} />
                  </>
                )}
                <span className="font-medium">{name}</span>
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-md ${
                  isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-gray-800 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Drafts */}
        {filtered.drafts.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-300 mb-4">Drafts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {filtered.drafts.map(draft => (
                <GuideCard
                  key={draft.id}
                  guide={draft}
                  isDraft
                  onDelete={(e) => handleDeleteDraft(draft.id, e)}
                  onDuplicate={handleDuplicate}
                  isPinned={pinnedIds.includes(draft.id)}
                  onTogglePin={togglePin}
                />
              ))}
            </div>
          </>
        )}

        {/* Published guides */}
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Guides</h2>
        {filtered.guides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.guides.map(guide => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onDelete={(e) => handleDeleteGuide(guide.id, e)}
                onDuplicate={handleDuplicate}
                isPinned={pinnedIds.includes(guide.id)}
                onTogglePin={togglePin}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No guides found</p>
            <p className="text-sm mt-1">Create your first guide to get started</p>
          </div>
        )}
      </main>
    </div>
  )
}
