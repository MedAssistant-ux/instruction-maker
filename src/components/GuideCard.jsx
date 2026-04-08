import { BookOpen, Clock, Tag, Trash2, FileText, Copy, Pin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const categoryColors = {
  Methasoft: 'bg-blue-500/20 text-blue-400',
  Pharmacy: 'bg-green-500/20 text-green-400',
  Equipment: 'bg-orange-500/20 text-orange-400',
  default: 'bg-gray-500/20 text-gray-400',
}

function relativeTime(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffDay > 30) return date.toLocaleDateString()
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  return 'just now'
}

export default function GuideCard({ guide, isDraft, onDelete, onDuplicate, isPinned, onTogglePin }) {
  const navigate = useNavigate()
  const colorClass = categoryColors[guide.category] || categoryColors.default
  const isPdf = guide.type === 'pdf'

  return (
    <div
      onClick={() => navigate(isDraft ? `/editor/${guide.id}` : `/guide/${guide.id}`)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer
                 hover:border-blue-500/50 hover:bg-gray-900/80 transition-all duration-200
                 group relative"
    >
      {/* Top-right action buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onTogglePin && (
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin(guide.id) }}
            className={`p-1.5 rounded-lg transition-colors ${
              isPinned
                ? 'text-yellow-400 bg-yellow-500/10'
                : 'text-gray-600 hover:text-yellow-400 hover:bg-yellow-500/10'
            }`}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={16} />
          </button>
        )}
        {onDuplicate && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(guide) }}
            className="p-1.5 text-gray-600 hover:text-blue-400 hover:bg-blue-500/10
                       rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10
                       rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Pinned badge */}
      {isPinned && (
        <div className="absolute top-3 left-3">
          <Pin size={14} className="text-yellow-400" />
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        {isDraft && (
          <span className="inline-block px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400">
            Draft
          </span>
        )}
        {isPdf && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400">
            <FileText size={10} />
            PDF
          </span>
        )}
        {guide.version && (
          <span className="inline-block px-2 py-0.5 text-xs rounded bg-indigo-500/20 text-indigo-400">
            v{guide.version}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors mb-2">
        {guide.title}
      </h3>
      {guide.category && (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${colorClass} mb-3`}>
          <Tag size={12} />
          {guide.category}
        </span>
      )}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{guide.description}</p>
      <div className="flex flex-col gap-1 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {!isPdf && (
            <span className="flex items-center gap-1">
              <BookOpen size={14} />
              {guide.stepCount || guide.sections?.reduce((n, s) => n + s.steps.length, 0) || 0} steps
            </span>
          )}
          {guide.lastUpdated && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {guide.lastUpdated}
            </span>
          )}
        </div>
        {guide.lastEdited && (
          <span className="text-gray-600">
            Edited: {relativeTime(guide.lastEdited)}
          </span>
        )}
      </div>
    </div>
  )
}
