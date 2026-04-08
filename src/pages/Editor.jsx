import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Save, Upload, MousePointer2, Circle, Square, ArrowUpRight,
  Hash, Highlighter, Type, EyeOff, Plus, MoreVertical, Trash2, Copy,
  Pencil, ChevronRight, Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, ChevronDown, ImagePlus, Clipboard, Undo2, Redo2, XCircle
} from 'lucide-react'
import AnnotationCanvas from '../components/AnnotationCanvas'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { createEmptyGuide, fetchGuide, saveDraft, loadDraft, publishGuide, loadPublishedGuide } from '../lib/guideStore'

const TOOLS = [
  { id: 'select', label: 'Select', icon: MousePointer2 },
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'rect', label: 'Rect', icon: Square },
  { id: 'arrow', label: 'Arrow', icon: ArrowUpRight },
  { id: 'number', label: '#123', icon: Hash },
  { id: 'highlight', label: 'Highlight', icon: Highlighter },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'blur', label: 'Blur', icon: EyeOff },
]

const COLORS = [
  { name: 'red', value: '#ef4444' },
  { name: 'orange', value: '#f97316' },
  { name: 'yellow', value: '#eab308' },
  { name: 'green', value: '#22c55e' },
  { name: 'blue', value: '#3b82f6' },
  { name: 'purple', value: '#a855f7' },
  { name: 'black', value: '#000000' },
  { name: 'white', value: '#ffffff' },
]

const TEMPLATES = [
  { label: 'Click button', html: 'Click the <strong>[Button]</strong> button' },
  { label: 'Navigate menu', html: 'Navigate to <strong>[Menu]</strong> &gt; <strong>[Submenu]</strong>' },
  { label: 'Enter value', html: 'Enter <strong>[value]</strong> in the <strong>[Field]</strong> field' },
  { label: 'Select dropdown', html: 'Select <strong>[Option]</strong> from the dropdown' },
  { label: 'Toggle checkbox', html: 'Check/Uncheck the <strong>[Setting]</strong> checkbox' },
  { label: 'Right-click action', html: 'Right-click on <strong>[Element]</strong> and select <strong>[Option]</strong>' },
]

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [guide, setGuide] = useState(null)
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0)
  const [selectedStepIdx, setSelectedStepIdx] = useState(0)
  const [activeTool, setActiveTool] = useState('select')
  const [activeColor, setActiveColor] = useState('#ef4444')
  const [thickness, setThickness] = useState(3)
  const [contextMenu, setContextMenu] = useState(null)
  const [templateOpen, setTemplateOpen] = useState(false)
  const autoSaveRef = useRef(null)
  const canvasComponentRef = useRef(null)
  const [imageDataUrl, setImageDataUrl] = useState(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      Placeholder.configure({ placeholder: 'Type step directions here...' }),
    ],
    content: '',
    onUpdate: ({ editor: ed }) => {
      if (!guide) return
      setGuide(prev => {
        const updated = structuredClone(prev)
        const step = updated.sections[selectedSectionIdx]?.steps[selectedStepIdx]
        if (step) step.directionHtml = ed.getHTML()
        return updated
      })
    },
  })

  // Load guide
  useEffect(() => {
    if (id) {
      // Check published first, then drafts, then fetch
      const published = loadPublishedGuide(id)
      if (published) {
        setGuide(published)
      } else {
        const draft = loadDraft(id)
        if (draft) {
          setGuide(draft)
        } else {
          fetchGuide(id)
            .then(setGuide)
            .catch(() => setGuide(createEmptyGuide('Untitled Guide')))
        }
      }
    } else {
      setGuide(createEmptyGuide('Untitled Guide'))
    }
  }, [id])

  // Sync editor content and canvas image when step selection changes
  useEffect(() => {
    if (!editor || !guide) return
    const step = guide.sections[selectedSectionIdx]?.steps[selectedStepIdx]
    if (step) {
      editor.commands.setContent(step.directionHtml || '')
    }
  }, [editor, selectedSectionIdx, selectedStepIdx, guide?.id])

  // Sync canvas image with current step's first screenshot
  useEffect(() => {
    if (!guide) return
    const step = guide.sections[selectedSectionIdx]?.steps[selectedStepIdx]
    if (step?.screenshots?.length > 0) {
      setImageDataUrl(step.screenshots[step.screenshots.length - 1])
    } else {
      setImageDataUrl(null)
    }
  }, [guide, selectedSectionIdx, selectedStepIdx])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!guide) return
    autoSaveRef.current = setInterval(() => {
      saveDraft(guide)
    }, 30000)
    return () => clearInterval(autoSaveRef.current)
  }, [guide])

  // Paste from clipboard
  useEffect(() => {
    function handlePaste(e) {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          const reader = new FileReader()
          reader.onload = () => {
            if (!guide) return
            setImageDataUrl(reader.result)
            setGuide(prev => {
              const updated = structuredClone(prev)
              const step = updated.sections[selectedSectionIdx]?.steps[selectedStepIdx]
              if (step) {
                if (!step.screenshots) step.screenshots = []
                step.screenshots.push(reader.result)
              }
              return updated
            })
          }
          reader.readAsDataURL(file)
          break
        }
      }
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [guide, selectedSectionIdx, selectedStepIdx])

  const handleSave = useCallback(() => {
    if (guide) saveDraft(guide)
  }, [guide])

  const handleUploadImage = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        setImageDataUrl(reader.result)
        setGuide(prev => {
          const updated = structuredClone(prev)
          const step = updated.sections[selectedSectionIdx]?.steps[selectedStepIdx]
          if (step) {
            if (!step.screenshots) step.screenshots = []
            step.screenshots.push(reader.result)
          }
          return updated
        })
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [selectedSectionIdx, selectedStepIdx])

  function addSection() {
    setGuide(prev => {
      const updated = structuredClone(prev)
      const idx = updated.sections.length + 1
      updated.sections.push({
        id: `sec${Date.now()}`,
        title: `Section ${idx}`,
        steps: [{ id: `step${Date.now()}`, title: 'Step 1', screenshots: [], annotations: [], directionHtml: '' }],
      })
      setSelectedSectionIdx(updated.sections.length - 1)
      setSelectedStepIdx(0)
      return updated
    })
  }

  function addStep(sectionIdx) {
    setGuide(prev => {
      const updated = structuredClone(prev)
      const section = updated.sections[sectionIdx]
      const idx = section.steps.length + 1
      section.steps.push({
        id: `step${Date.now()}`,
        title: `Step ${idx}`,
        screenshots: [],
        annotations: [],
        directionHtml: '',
      })
      setSelectedSectionIdx(sectionIdx)
      setSelectedStepIdx(section.steps.length - 1)
      return updated
    })
  }

  function deleteItem(type, sectionIdx, stepIdx) {
    setGuide(prev => {
      const updated = structuredClone(prev)
      if (type === 'section') {
        if (updated.sections.length <= 1) return prev
        updated.sections.splice(sectionIdx, 1)
        setSelectedSectionIdx(Math.max(0, sectionIdx - 1))
        setSelectedStepIdx(0)
      } else {
        const section = updated.sections[sectionIdx]
        if (section.steps.length <= 1) return prev
        section.steps.splice(stepIdx, 1)
        setSelectedStepIdx(Math.max(0, stepIdx - 1))
      }
      return updated
    })
    setContextMenu(null)
  }

  function duplicateItem(type, sectionIdx, stepIdx) {
    setGuide(prev => {
      const updated = structuredClone(prev)
      if (type === 'section') {
        const clone = structuredClone(updated.sections[sectionIdx])
        clone.id = `sec${Date.now()}`
        clone.title += ' (copy)'
        updated.sections.splice(sectionIdx + 1, 0, clone)
      } else {
        const section = updated.sections[sectionIdx]
        const clone = structuredClone(section.steps[stepIdx])
        clone.id = `step${Date.now()}`
        clone.title += ' (copy)'
        section.steps.splice(stepIdx + 1, 0, clone)
      }
      return updated
    })
    setContextMenu(null)
  }

  function renameItem(type, sectionIdx, stepIdx) {
    const current = type === 'section'
      ? guide.sections[sectionIdx].title
      : guide.sections[sectionIdx].steps[stepIdx].title
    const newName = prompt('Rename:', current)
    if (!newName) return
    setGuide(prev => {
      const updated = structuredClone(prev)
      if (type === 'section') {
        updated.sections[sectionIdx].title = newName
      } else {
        updated.sections[sectionIdx].steps[stepIdx].title = newName
      }
      return updated
    })
    setContextMenu(null)
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    )
  }

  const currentStep = guide.sections[selectedSectionIdx]?.steps[selectedStepIdx]

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col" onClick={() => { setContextMenu(null); setTemplateOpen(false) }}>
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm shrink-0 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <input
              type="text"
              value={guide.title}
              onChange={e => setGuide(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg font-semibold text-gray-100 bg-transparent border-b border-transparent
                         hover:border-gray-700 focus:border-blue-500 focus:outline-none px-1 py-0.5 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-800 text-gray-300
                         hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Save size={16} />
              Save Draft
            </button>
            <button
              onClick={() => {
                publishGuide(guide)
                navigate('/')
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500
                         text-white rounded-lg transition-colors font-medium"
            >
              <Upload size={16} />
              Publish
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - section/step tree */}
        <aside className="w-64 shrink-0 border-r border-gray-800 bg-gray-900/50 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sections</span>
              <button
                onClick={addSection}
                className="p-1 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded transition-colors"
                title="Add Section"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-1">
              {guide.sections.map((section, si) => (
                <div key={section.id}>
                  <div
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm cursor-pointer group
                      ${selectedSectionIdx === si ? 'bg-gray-800 text-gray-100' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
                    onClick={() => { setSelectedSectionIdx(si); setSelectedStepIdx(0) }}
                  >
                    <ChevronRight size={14} className="shrink-0 text-gray-600" />
                    <span className="truncate flex-1">{section.title}</span>
                    <button
                      onClick={e => { e.stopPropagation(); setContextMenu({ type: 'section', sectionIdx: si, x: e.clientX, y: e.clientY }) }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-700 rounded transition-all"
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>

                  {/* Steps */}
                  <div className="ml-4 space-y-0.5 mt-0.5">
                    {section.steps.map((step, sti) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm cursor-pointer group
                          ${selectedSectionIdx === si && selectedStepIdx === sti
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'}`}
                        onClick={() => { setSelectedSectionIdx(si); setSelectedStepIdx(sti) }}
                      >
                        <span className="truncate flex-1">{step.title}</span>
                        <button
                          onClick={e => { e.stopPropagation(); setContextMenu({ type: 'step', sectionIdx: si, stepIdx: sti, x: e.clientX, y: e.clientY }) }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-700 rounded transition-all"
                        >
                          <MoreVertical size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addStep(si)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-400 transition-colors"
                    >
                      <Plus size={12} />
                      Add Step
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-gray-800 bg-gray-900/30 p-3 shrink-0">
            {/* Tool buttons */}
            <div className="flex flex-wrap items-center gap-1 mb-2">
              {TOOLS.map(tool => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-colors
                      ${activeTool === tool.id
                        ? 'bg-blue-600/30 text-blue-400 ring-1 ring-blue-500/50'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'}`}
                    title={tool.label}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{tool.label}</span>
                  </button>
                )
              })}
              <div className="w-px h-6 bg-gray-700 mx-1" />
              <button
                onClick={handleUploadImage}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gray-800 text-gray-400
                           hover:bg-gray-700 hover:text-gray-200 rounded-lg transition-colors"
                title="Upload image"
              >
                <ImagePlus size={14} />
                <span className="hidden sm:inline">Upload</span>
              </button>
              <button
                onClick={() => alert('Paste an image with Ctrl+V / Cmd+V')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gray-800 text-gray-400
                           hover:bg-gray-700 hover:text-gray-200 rounded-lg transition-colors"
                title="Paste from clipboard"
              >
                <Clipboard size={14} />
                <span className="hidden sm:inline">Paste</span>
              </button>
            </div>

            {/* Color swatches + thickness */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setActiveColor(c.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform
                      ${activeColor === c.value ? 'border-white scale-110' : 'border-gray-700 hover:scale-105'}`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Thickness</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={thickness}
                  onChange={e => setThickness(Number(e.target.value))}
                  className="w-20 accent-blue-500"
                />
                <span className="w-4 text-center">{thickness}</span>
              </div>
            </div>
          </div>

          {/* Canvas area */}
          <div className="flex-1 overflow-auto p-4 flex flex-col">
            <div className="flex items-center gap-1 mb-2 shrink-0">
              <button
                onClick={() => canvasComponentRef.current?.undo()}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-800 text-gray-400
                           hover:bg-gray-700 hover:text-gray-200 rounded transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={14} />
                Undo
              </button>
              <button
                onClick={() => canvasComponentRef.current?.redo()}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-800 text-gray-400
                           hover:bg-gray-700 hover:text-gray-200 rounded transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={14} />
                Redo
              </button>
              <button
                onClick={() => canvasComponentRef.current?.clear()}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-800 text-gray-400
                           hover:bg-gray-700 hover:text-red-300 rounded transition-colors"
                title="Clear annotations"
              >
                <XCircle size={14} />
                Clear
              </button>
            </div>
            <div className="flex-1 min-h-[400px]">
              <AnnotationCanvas
                ref={canvasComponentRef}
                imageDataUrl={imageDataUrl}
                tool={activeTool}
                color={activeColor}
                thickness={thickness}
                onAnnotationsChange={(data) => {
                  if (!guide) return
                  setGuide(prev => {
                    const updated = structuredClone(prev)
                    const step = updated.sections[selectedSectionIdx]?.steps[selectedStepIdx]
                    if (step) step.annotations = data
                    return updated
                  })
                }}
              />
            </div>
          </div>

          {/* Bottom: Tiptap rich text editor */}
          <div className="border-t border-gray-800 bg-gray-900/30 shrink-0">
            {/* Editor toolbar */}
            <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-800/50">
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded transition-colors ${editor?.isActive('bold') ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                title="Bold"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded transition-colors ${editor?.isActive('italic') ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                title="Italic"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded transition-colors ${editor?.isActive('underline') ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                title="Underline"
              >
                <UnderlineIcon size={16} />
              </button>
              <div className="w-px h-5 bg-gray-700 mx-1" />
              <button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded transition-colors ${editor?.isActive('bulletList') ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                title="Bullet List"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded transition-colors ${editor?.isActive('orderedList') ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                title="Ordered List"
              >
                <ListOrdered size={16} />
              </button>
              <div className="w-px h-5 bg-gray-700 mx-1" />
              {/* Templates dropdown */}
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setTemplateOpen(!templateOpen)}
                  className="flex items-center gap-1 px-2 py-1 text-sm text-gray-400 hover:bg-gray-800
                             hover:text-gray-200 rounded transition-colors"
                >
                  Templates
                  <ChevronDown size={14} />
                </button>
                {templateOpen && (
                  <div className="absolute bottom-full left-0 mb-1 w-72 bg-gray-800 border border-gray-700
                                  rounded-lg shadow-xl py-1 z-30">
                    {TEMPLATES.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          editor?.chain().focus().insertContent(t.html).run()
                          setTemplateOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700
                                   hover:text-gray-100 transition-colors"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Editor content */}
            <div className="tiptap-editor max-h-48 overflow-y-auto">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 w-40"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => renameItem(contextMenu.type, contextMenu.sectionIdx, contextMenu.stepIdx)}
            className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300
                       hover:bg-gray-700 transition-colors"
          >
            <Pencil size={14} />
            Rename
          </button>
          <button
            onClick={() => duplicateItem(contextMenu.type, contextMenu.sectionIdx, contextMenu.stepIdx)}
            className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300
                       hover:bg-gray-700 transition-colors"
          >
            <Copy size={14} />
            Duplicate
          </button>
          <button
            onClick={() => deleteItem(contextMenu.type, contextMenu.sectionIdx, contextMenu.stepIdx)}
            className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm text-red-400
                       hover:bg-gray-700 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
