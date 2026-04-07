import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { exportToPdf } from '../lib/exportPdf'
import { exportToDocx } from '../lib/exportDocx'

export default function ExportButtons({ guide }) {
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingDocx, setExportingDocx] = useState(false)

  const handlePdf = async () => {
    setExportingPdf(true)
    try {
      await exportToPdf(guide)
    } catch (e) {
      alert('PDF export failed: ' + e.message)
    }
    setExportingPdf(false)
  }

  const handleDocx = async () => {
    setExportingDocx(true)
    try {
      await exportToDocx(guide)
    } catch (e) {
      alert('Word export failed: ' + e.message)
    }
    setExportingDocx(false)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handlePdf}
        disabled={exportingPdf}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-500/20 text-red-400
                   rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
      >
        {exportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
        PDF
      </button>
      <button
        onClick={handleDocx}
        disabled={exportingDocx}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400
                   rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
      >
        {exportingDocx ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
        Word
      </button>
    </div>
  )
}
