import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, ChevronDown, List } from 'lucide-react'
import { fetchGuide } from '../lib/guideStore'
import ExportButtons from '../components/ExportButtons'

export default function Viewer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    fetchGuide(id)
      .then(data => { setGuide(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

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
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-20">
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
        <aside className="hidden lg:block w-64 shrink-0 border-r border-gray-800 p-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contents</h3>
          {tocContent}
        </aside>

        {/* Mobile TOC toggle */}
        <div className="lg:hidden fixed bottom-4 right-4 z-30">
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
          {guide.description && (
            <p className="text-gray-400 mb-8 text-lg">{guide.description}</p>
          )}

          {guide.sections?.map(section => (
            <div key={section.id} className="mb-10">
              <h2 className="text-xl font-bold text-gray-100 mb-6 pb-2 border-b border-gray-800">
                {section.title}
              </h2>
              <div className="space-y-8">
                {section.steps?.map((step, stepIdx) => (
                  <div key={step.id} id={`step-${step.id}`} className="scroll-mt-20">
                    <h3 className="text-base font-semibold text-gray-200 mb-3">
                      <span className="text-blue-400 mr-2">Step {stepIdx + 1}.</span>
                      {step.title}
                    </h3>
                    {step.screenshots?.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`${step.title} screenshot ${i + 1}`}
                        className="rounded-lg border border-gray-800 mb-3 max-w-full"
                      />
                    ))}
                    {step.directionHtml && (
                      <div
                        className="prose prose-invert prose-sm max-w-none text-gray-300"
                        dangerouslySetInnerHTML={{ __html: step.directionHtml }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}
