import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search guides..."
        className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl
                   text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500
                   transition-colors"
      />
    </div>
  )
}
