import { BookOpen, Clock, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const categoryColors = {
  Methasoft: 'bg-blue-500/20 text-blue-400',
  Pharmacy: 'bg-green-500/20 text-green-400',
  Equipment: 'bg-orange-500/20 text-orange-400',
  default: 'bg-gray-500/20 text-gray-400',
}

export default function GuideCard({ guide, isDraft }) {
  const navigate = useNavigate()
  const colorClass = categoryColors[guide.category] || categoryColors.default

  return (
    <div
      onClick={() => navigate(isDraft ? `/editor/${guide.id}` : `/guide/${guide.id}`)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer
                 hover:border-blue-500/50 hover:bg-gray-900/80 transition-all duration-200
                 group"
    >
      {isDraft && (
        <span className="inline-block mb-2 px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400">
          Draft
        </span>
      )}
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
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <BookOpen size={14} />
          {guide.stepCount || guide.sections?.reduce((n, s) => n + s.steps.length, 0) || 0} steps
        </span>
        {guide.lastUpdated && (
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {guide.lastUpdated}
          </span>
        )}
      </div>
    </div>
  )
}
