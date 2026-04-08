import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, ChevronDown, List, Printer, Search, X } from 'lucide-react'
import { fetchGuideIndex, fetchGuide, loadPublishedGuide } from '../lib/guideStore'
import ExportButtons from '../components/ExportButtons'

function highlightText(html, query) {
  if (!query || !html) return html
  // Escape regex special chars in query
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  // We need to avoid replacing inside HTML tags
  // Split by tags, only replace in text portions
  const parts = html.split(/(<[^>]*>)/)
  const highlighted = parts.map(part => {
    if (part.startsWith('<')) return part // HTML tag, leave alone
    return part.replace(regex, '<mark class="search-highlight">$1</mark>')
  }).join('')
  return highlighted
}

function countMatches(html, query) {
  if (!query || !html) return 0
  const text = html.replace(/<[^>]*>/g, '') // strip tags to count in text only
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escaped, 'gi')
  const matches = text.match(regex)
  return matches ? matches.length : 0
}

export default function Viewer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const contentRef = useRef(null)

  useEffect(() => {
    async function loadGuide() {
      // First check localStorage published guides
      const published = loadPublishedGuide(id)
      if (published) {
        setGuide(published)
        setLoading(false)
        return
      }

      // Then check static guide index for PDF guides
      try {
        const index = await fetchGuideIndex()
        const entry = index.find(g => g.id === id)
        if (entry && entry.type === 'pdf') {
          setGuide(entry)
          setLoading(false)
          return
        }
      } catch (e) {}

      // Try fetching as JSON guide
      try {
        const data = await fetchGuide(id)
        setGuide(data)
      } catch (e) {}
      setLoading(false)
    }
    loadGuide()
  }, [id])

  // Count total matches across all steps
  const totalMatches = useMemo(() => {
    if (!searchQuery || !guide?.sections) return 0
    let count = 0
    for (const section of guide.sections) {
      for (const step of section.steps || []) {
        if (step.directionHtml) {
          count += countMatches(step.directionHtml, searchQuery)
        }
        if (step.title) {
          count += countMatches(step.title, searchQuery)
        }
      }
    }
    return count
  }, [searchQuery, guide])

  function scrollToStep(stepId) {
    const el = document.getElementById(`step-${stepId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setSidebarOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-gray-400 gap-4">
        <p>Guide not found</p>
        <button onClick={() => navigate('/')} className="text-blue-400 hover:underline">
          Back to Library
        </button>
      </div>
    )
  }

  // PDF viewer
  if (guide.type === 'pdf') {
    const BASE = import.meta.env.BASE_URL
    // pdfPath is for static guides, pdfDataUrl for user-uploaded
    const pdfSrc = guide.pdfDataUrl || `${BASE}${guide.pdfPath}`

    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        {/* Top bar */}
        <header className="viewer-header border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-20 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-lg font-semibold text-gray-100 truncate">{guide.title}</h1>
            </div>
          </div>
        </header>

        {/* PDF embed */}
        <div className="flex-1 p-4">
          <iframe
            src={pdfSrc}
            title={guide.title}
            className="w-full h-full min-h-[calc(100vh-5rem)] rounded-lg border border-gray-800"
            style={{ background: 'white' }}
          />
        </div>
      </div>
    )
  }

  // Standard guide viewer
  const tocContent = (
    <nav className="space-y-2">
      {guide.sections?.map(section => (
        <div key={section.id}>
          <h4 className="text-sm font-semibold text-gray-300 px-3 py-1.5">{section.title}</h4>
          <ul className="space-y-0.5">
            {section.steps?.map(step => (
              <li key={step.id}>
                <button
                  onClick={() => scrollToStep(step.id)}
                  className="w-full text-left text-sm text-gray-400 hover:text-blue-400
                             hover:bg-gray-800/50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {step.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top bar */}
      <header className="viewer-header border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-100 truncate">{guide.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ExportButtons guide={guide} />
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600
                         text-white rounded-lg transition-colors"
              title="Print guide"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={() => navigate(`/editor/${id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500
                         text-white rounded-lg transition-colors"
            >
              <Edit size={16} />
              Edit
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar - desktop */}
        <aside className="viewer-sidebar hidden lg:block w-64 shrink-0 border-r border-gray-800 p-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contents</h3>
          {tocContent}
        </aside>

        {/* Mobile TOC toggle */}
        <div className="mobile-toc-btn lg:hidden fixed bottom-4 right-4 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-colors"
          >
            <List size={20} />
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-20 bg-black/50" onClick={() => setSidebarOpen(false)}>
            <div
              className="absolute left-0 top-0 h-full w-72 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Contents</h3>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-100">
                  <ChevronDown size={18} />
                </button>
              </div>
              {tocContent}
            </div>
          </div>
        )}

        {/* Main content */}
        <main ref={contentRef} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
          {/* Search bar */}
          <div className="search-bar mb-6 relative">
            <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition-colors">
              <Search size={18} className="text-gray-500 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search within this guide..."
                className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 text-sm outline-none"
              />
              {searchQuery && (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">
                    {totalMatches} {totalMatches === 1 ? 'match' : 'matches'} found
                  </span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Print-only title */}
          <h1 className="print-title hidden text-2xl font-bold mb-4">{guide.title}</h1>

          {guide.description && (
            <p className="text-gray-400 mb-8 text-lg">{guide.description}</p>
          )}

          {guide.sections?.map(section => (
            <div key={section.id} className="mb-10 print-section">
              <h2 className="text-xl font-bold text-gray-100 mb-6 pb-2 border-b border-gray-800">
                {section.title}
              </h2>
              <div className="space-y-8">
                {section.steps?.map((step, stepIdx) => {
                  const titleHtml = searchQuery
                    ? highlightText(step.title, searchQuery)
                    : step.title
                  const dirHtml = searchQuery && step.directionHtml
                    ? highlightText(step.directionHtml, searchQuery)
                    : step.directionHtml

                  return (
                    <div key={step.id} id={`step-${step.id}`} className="scroll-mt-20">
                      <h3 className="text-base font-semibold text-gray-200 mb-3">
                        <span className="text-blue-400 mr-2">Step {stepIdx + 1}.</span>
                        <span dangerouslySetInnerHTML={{ __html: titleHtml }} />
                      </h3>
                      {step.screenshots?.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`${step.title} screenshot ${i + 1}`}
                          className="rounded-lg border border-gray-800 mb-3 max-w-full print-img"
                        />
                      ))}
                      {dirHtml && (
                        <div
                          className="prose prose-invert prose-sm max-w-none text-gray-300"
                          dangerouslySetInnerHTML={{ __html: dirHtml }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}
