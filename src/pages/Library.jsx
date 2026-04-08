import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, ExternalLink, Calculator, Package, Trash2, FileUp } from 'lucide-react'
import { fetchGuideIndex, listDrafts, listPublishedGuides, deleteGuide, deleteDraft, getDeletedStaticGuides, publishPdfGuide } from '../lib/guideStore'
import GuideCard from '../components/GuideCard'
import SearchBar from '../components/SearchBar'

export default function Library() {
  const navigate = useNavigate()
  const [staticGuides, setStaticGuides] = useState([])
  const [publishedGuides, setPublishedGuides] = useState([])
  const [drafts, setDrafts] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchGuideIndex()
      .then(setStaticGuides)
      .catch(() => setStaticGuides([]))
    setPublishedGuides(listPublishedGuides())
    setDrafts(listDrafts())
  }, [refreshKey])

  // Merge static + published, exclude deleted static ones
  const allGuides = useMemo(() => {
    const deleted = getDeletedStaticGuides()
    const publishedIds = new Set(publishedGuides.map(g => g.id))
    // Static guides not deleted and not overridden by published
    const filtered = staticGuides.filter(g => !deleted.includes(g.id) && !publishedIds.has(g.id))
    return [...filtered, ...publishedGuides]
  }, [staticGuides, publishedGuides])

  const categories = useMemo(() => {
    const cats = new Set()
    allGuides.forEach(g => { if (g.category) cats.add(g.category) })
    drafts.forEach(g => { if (g.category) cats.add(g.category) })
    return ['All', ...Array.from(cats).sort()]
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
    return {
      guides: allGuides.filter(filterFn),
      drafts: drafts.filter(filterFn),
    }
  }, [allGuides, drafts, search, activeCategory])

  function handleDeleteGuide(id, e) {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this guide?')) return
    deleteGuide(id)
    setRefreshKey(k => k + 1)
  }

  function handleDeleteDraft(id, e) {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this draft?')) return
    deleteDraft(id)
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

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Drafts */}
        {filtered.drafts.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-300 mb-4">Drafts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {filtered.drafts.map(draft => (
                <GuideCard key={draft.id} guide={draft} isDraft onDelete={(e) => handleDeleteDraft(draft.id, e)} />
              ))}
            </div>
          </>
        )}

        {/* Published guides */}
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Guides</h2>
        {filtered.guides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.guides.map(guide => (
              <GuideCard key={guide.id} guide={guide} onDelete={(e) => handleDeleteGuide(guide.id, e)} />
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
