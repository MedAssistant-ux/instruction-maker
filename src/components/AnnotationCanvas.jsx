import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react'
import { Canvas, Circle, Rect, Line, Triangle, Path, Group, FabricText, FabricImage, PencilBrush, Ellipse } from 'fabric'

const AnnotationCanvas = forwardRef(({ imageDataUrl, tool, color, thickness, onAnnotationsChange }, ref) => {
  const canvasRef = useRef(null)
  const fabricRef = useRef(null)
  const containerRef = useRef(null)
  const numberCounterRef = useRef(1)
  const drawingRef = useRef({ isDrawing: false, startX: 0, startY: 0, activeShape: null })
  const undoStack = useRef([])
  const redoStack = useRef([])
  const eventHandlersRef = useRef({})
  const toolRef = useRef(tool)
  const colorRef = useRef(color)
  const thicknessRef = useRef(thickness)

  // Keep refs in sync with props
  useEffect(() => { toolRef.current = tool }, [tool])
  useEffect(() => { colorRef.current = color }, [color])
  useEffect(() => { thicknessRef.current = thickness }, [thickness])

  const notifyChange = useCallback(() => {
    if (onAnnotationsChange && fabricRef.current) {
      onAnnotationsChange(fabricRef.current.toJSON())
    }
  }, [onAnnotationsChange])

  const pushToUndo = useCallback((obj) => {
    undoStack.current.push(obj)
    redoStack.current = []
    notifyChange()
  }, [notifyChange])

  const performUndo = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || undoStack.current.length === 0) return
    const obj = undoStack.current.pop()
    redoStack.current.push(obj)
    canvas.remove(obj)
    canvas.discardActiveObject()
    canvas.renderAll()
    notifyChange()
  }, [notifyChange])

  const performRedo = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas || redoStack.current.length === 0) return
    const obj = redoStack.current.pop()
    undoStack.current.push(obj)
    canvas.add(obj)
    canvas.renderAll()
    notifyChange()
  }, [notifyChange])

  const clearAnnotations = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const objects = canvas.getObjects().slice()
    objects.forEach(obj => canvas.remove(obj))
    undoStack.current = []
    redoStack.current = []
    canvas.discardActiveObject()
    canvas.renderAll()
    notifyChange()
  }, [notifyChange])

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    getCanvasDataUrl: () => fabricRef.current?.toDataURL({ format: 'png' }),
    undo: performUndo,
    redo: performRedo,
    clear: clearAnnotations,
    resetNumberCounter: () => { numberCounterRef.current = 1 },
    getCanvas: () => fabricRef.current,
  }))

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return

    const container = containerRef.current
    const width = container.clientWidth || 800
    const height = container.clientHeight || 500

    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#1a1a2e',
      selection: true,
    })

    fabricRef.current = canvas

    // Track free drawing paths for undo
    canvas.on('path:created', (e) => {
      if (e.path) {
        pushToUndo(e.path)
      }
    })

    return () => {
      canvas.dispose()
      fabricRef.current = null
    }
  }, [])

  // Resize canvas to fit container
  useEffect(() => {
    const container = containerRef.current
    if (!container || !fabricRef.current) return

    const observer = new ResizeObserver(() => {
      const canvas = fabricRef.current
      if (!canvas) return
      const w = container.clientWidth
      const h = container.clientHeight
      if (w > 0 && h > 0) {
        canvas.setDimensions({ width: w, height: h })
        canvas.renderAll()
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Load background image when imageDataUrl changes
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    if (!imageDataUrl) {
      canvas.backgroundImage = null
      canvas.renderAll()
      return
    }

    FabricImage.fromURL(imageDataUrl).then(img => {
      if (!fabricRef.current) return
      const container = containerRef.current
      const containerW = container.clientWidth || 800
      const containerH = container.clientHeight || 500

      const scaleX = containerW / img.width
      const scaleY = containerH / img.height
      const scale = Math.min(scaleX, scaleY, 1)

      const canvasW = Math.round(img.width * scale)
      const canvasH = Math.round(img.height * scale)

      canvas.setDimensions({ width: canvasW, height: canvasH })

      img.scaleX = scale
      img.scaleY = scale
      canvas.backgroundImage = img
      canvas.renderAll()
    }).catch(() => {
      // Silently ignore load errors
    })
  }, [imageDataUrl])

  // Remove old event handlers helper
  const cleanupEvents = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const handlers = eventHandlersRef.current
    if (handlers.mouseDown) canvas.off('mouse:down', handlers.mouseDown)
    if (handlers.mouseMove) canvas.off('mouse:move', handlers.mouseMove)
    if (handlers.mouseUp) canvas.off('mouse:up', handlers.mouseUp)
    eventHandlersRef.current = {}
  }, [])

  // Handle tool changes
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    cleanupEvents()

    // Reset modes
    canvas.isDrawingMode = false
    canvas.selection = tool === 'select'

    // Make all objects selectable only in select mode
    canvas.forEachObject(obj => {
      obj.selectable = tool === 'select'
      obj.evented = tool === 'select'
    })

    if (tool === 'select') {
      return
    }

    if (tool === 'highlight') {
      canvas.isDrawingMode = true
      const brush = new PencilBrush(canvas)
      // Convert hex color to semi-transparent
      brush.color = color + '55'
      brush.width = thickness * 6
      canvas.freeDrawingBrush = brush
      return
    }

    // Drawing tools: circle, rect, arrow, number, text, blur
    const drawing = drawingRef.current

    const onMouseDown = (opt) => {
      const pointer = canvas.getScenePoint(opt.e)
      const currentTool = toolRef.current
      const currentColor = colorRef.current
      const currentThickness = thicknessRef.current

      if (currentTool === 'number') {
        const num = numberCounterRef.current++
        const radius = 16
        const circle = new Circle({
          radius,
          fill: currentColor,
          originX: 'center',
          originY: 'center',
        })
        const text = new FabricText(String(num), {
          fontSize: 16,
          fontWeight: 'bold',
          fill: '#ffffff',
          originX: 'center',
          originY: 'center',
          fontFamily: 'Arial',
        })
        const group = new Group([circle, text], {
          left: pointer.x - radius,
          top: pointer.y - radius,
          selectable: false,
          evented: false,
        })
        canvas.add(group)
        canvas.renderAll()
        pushToUndo(group)
        return
      }

      if (currentTool === 'text') {
        const input = window.prompt('Enter text:')
        if (!input) return
        const text = new FabricText(input, {
          left: pointer.x,
          top: pointer.y,
          fontSize: 18,
          fill: currentColor,
          fontFamily: 'Arial',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: 6,
          selectable: false,
          evented: false,
        })
        canvas.add(text)
        canvas.renderAll()
        pushToUndo(text)
        return
      }

      // For drag-based tools
      drawing.isDrawing = true
      drawing.startX = pointer.x
      drawing.startY = pointer.y

      if (currentTool === 'circle') {
        const ellipse = new Ellipse({
          left: pointer.x,
          top: pointer.y,
          rx: 0,
          ry: 0,
          fill: 'transparent',
          stroke: currentColor,
          strokeWidth: currentThickness,
          selectable: false,
          evented: false,
        })
        drawing.activeShape = ellipse
        canvas.add(ellipse)
      } else if (currentTool === 'rect') {
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: currentColor,
          strokeWidth: currentThickness,
          selectable: false,
          evented: false,
        })
        drawing.activeShape = rect
        canvas.add(rect)
      } else if (currentTool === 'arrow') {
        const line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: currentColor,
          strokeWidth: currentThickness,
          selectable: false,
          evented: false,
        })
        drawing.activeShape = line
        canvas.add(line)
      } else if (currentTool === 'blur') {
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 1,
          selectable: false,
          evented: false,
        })
        drawing.activeShape = rect
        canvas.add(rect)
      }
    }

    const onMouseMove = (opt) => {
      if (!drawing.isDrawing || !drawing.activeShape) return
      const pointer = canvas.getScenePoint(opt.e)
      const currentTool = toolRef.current

      if (currentTool === 'circle') {
        const rx = Math.abs(pointer.x - drawing.startX) / 2
        const ry = Math.abs(pointer.y - drawing.startY) / 2
        const left = Math.min(pointer.x, drawing.startX)
        const top = Math.min(pointer.y, drawing.startY)
        drawing.activeShape.set({ rx, ry, left, top })
      } else if (currentTool === 'rect') {
        const left = Math.min(pointer.x, drawing.startX)
        const top = Math.min(pointer.y, drawing.startY)
        const width = Math.abs(pointer.x - drawing.startX)
        const height = Math.abs(pointer.y - drawing.startY)
        drawing.activeShape.set({ left, top, width, height })
      } else if (currentTool === 'arrow') {
        drawing.activeShape.set({ x2: pointer.x, y2: pointer.y })
      } else if (currentTool === 'blur') {
        const left = Math.min(pointer.x, drawing.startX)
        const top = Math.min(pointer.y, drawing.startY)
        const width = Math.abs(pointer.x - drawing.startX)
        const height = Math.abs(pointer.y - drawing.startY)
        drawing.activeShape.set({ left, top, width, height })
      }
      canvas.renderAll()
    }

    const onMouseUp = (opt) => {
      if (!drawing.isDrawing) return
      drawing.isDrawing = false
      const currentTool = toolRef.current
      const currentColor = colorRef.current

      if (currentTool === 'arrow' && drawing.activeShape) {
        // Replace line with line + arrowhead group
        const line = drawing.activeShape
        const x1 = line.x1, y1 = line.y1, x2 = line.x2, y2 = line.y2

        // Only create if the line has some length
        if (Math.abs(x2 - x1) > 2 || Math.abs(y2 - y1) > 2) {
          const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)
          const headSize = Math.max(10, thicknessRef.current * 3)

          canvas.remove(line)

          const arrowLine = new Line([x1, y1, x2, y2], {
            stroke: currentColor,
            strokeWidth: thicknessRef.current,
            originX: 'center',
            originY: 'center',
          })
          const arrowHead = new Triangle({
            width: headSize,
            height: headSize,
            fill: currentColor,
            left: x2,
            top: y2,
            angle: angle + 90,
            originX: 'center',
            originY: 'center',
          })
          const group = new Group([arrowLine, arrowHead], {
            selectable: false,
            evented: false,
          })
          canvas.add(group)
          drawing.activeShape = group
          pushToUndo(group)
        } else {
          canvas.remove(line)
          drawing.activeShape = null
        }
      } else if (currentTool === 'blur' && drawing.activeShape) {
        // Add REDACTED text centered on the black rect
        const rect = drawing.activeShape
        const w = rect.width
        const h = rect.height

        if (w > 5 && h > 5) {
          canvas.remove(rect)

          const blurRect = new Rect({
            width: w,
            height: h,
            fill: '#000000',
            originX: 'center',
            originY: 'center',
          })
          const fontSize = Math.min(16, h * 0.6, w * 0.15)
          const label = new FabricText('REDACTED', {
            fontSize,
            fill: '#666666',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            originX: 'center',
            originY: 'center',
          })
          const group = new Group([blurRect, label], {
            left: rect.left,
            top: rect.top,
            selectable: false,
            evented: false,
          })
          canvas.add(group)
          drawing.activeShape = group
          pushToUndo(group)
        } else {
          canvas.remove(rect)
          drawing.activeShape = null
        }
      } else if (drawing.activeShape) {
        pushToUndo(drawing.activeShape)
      }

      drawing.activeShape = null
      canvas.renderAll()
    }

    canvas.on('mouse:down', onMouseDown)
    canvas.on('mouse:move', onMouseMove)
    canvas.on('mouse:up', onMouseUp)

    eventHandlersRef.current = {
      mouseDown: onMouseDown,
      mouseMove: onMouseMove,
      mouseUp: onMouseUp,
    }

    return () => cleanupEvents()
  }, [tool, color, thickness, cleanupEvents, pushToUndo])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const canvas = fabricRef.current
      if (!canvas) return

      if (e.key === 'Delete') {
        const active = canvas.getActiveObjects()
        if (active.length > 0) {
          active.forEach(obj => {
            canvas.remove(obj)
            // Remove from undo stack as well
            const idx = undoStack.current.indexOf(obj)
            if (idx !== -1) undoStack.current.splice(idx, 1)
          })
          canvas.discardActiveObject()
          canvas.renderAll()
          notifyChange()
        }
      }

      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        performUndo()
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        performRedo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [performUndo, performRedo, notifyChange])

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] bg-gray-900 rounded-lg overflow-hidden relative">
      <canvas ref={canvasRef} />
      {!imageDataUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
          <div className="text-center">
            <p className="text-lg mb-2">No image loaded</p>
            <p className="text-sm">Upload an image or paste from clipboard (Ctrl+V)</p>
          </div>
        </div>
      )}
    </div>
  )
})

AnnotationCanvas.displayName = 'AnnotationCanvas'
export default AnnotationCanvas
