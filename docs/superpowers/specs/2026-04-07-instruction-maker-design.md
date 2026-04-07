# Instruction Maker - Design Specification (Web Edition)

## Overview

A React web application hosted on GitHub Pages for creating, viewing, and sharing software instruction documents. Features a how-to library landing page, an annotation editor for adding screenshots with markup, rich text directions, and export to PDF/Word. Deployed to `medassistant-ux.github.io/instruction-maker/`.

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS v4
- **Canvas/Annotation:** Fabric.js (shape drawing, selection, manipulation on HTML5 canvas)
- **Rich Text:** Tiptap editor
- **PDF Export:** jsPDF + html2canvas
- **Word Export:** docx (npm package)
- **Routing:** React Router v6
- **Icons:** Lucide React (matches NMTS Inventory pattern)
- **Storage:** How-tos stored as JSON files in the repo's `public/guides/` folder. LocalStorage for draft autosave.
- **Hosting:** GitHub Pages via `medassistant-ux.github.io/instruction-maker/`

## Pages

### 1. Landing Page — How-To Library (`/`)
- Grid of cards showing all available how-to guides
- Each card: title, category tag, step count, last updated date
- Search bar to filter by title/keyword
- Category filter chips (e.g., "Methasoft", "Pharmacy", "Equipment")
- "Create New Guide" button (prominent, top-right)
- Responsive grid: 3 columns desktop, 2 tablet, 1 mobile

### 2. Guide Viewer (`/guide/:id`)
- Read-only view of a how-to guide
- Table of contents sidebar (collapsible on mobile)
- Sections with headers, steps with annotated screenshots and direction text
- "Edit" button (opens editor), "Download PDF" button, "Download Word" button
- Print-friendly layout

### 3. Guide Editor (`/editor/:id?`)
- Full annotation workspace (same concept as the desktop design, adapted for web)
- Left sidebar: section/step navigator with drag-and-drop
- Top toolbar: annotation tools, color picker, thickness
- Center: Fabric.js canvas with screenshot + annotation overlays
- Bottom: Tiptap rich text editor with formatting + templates
- Image input: paste from clipboard (Ctrl+V), upload from file, drag-and-drop
- Save: exports guide JSON to localStorage (draft) and provides download
- "Publish" flow: downloads the guide JSON for committing to the repo

### 4. Export
- PDF: Client-side generation with jsPDF, title page, TOC, sections, screenshots + text
- Word: Client-side generation with docx package, same layout
- Both triggered from viewer or editor

## Data Format

Each guide is a JSON file in `public/guides/`:

```json
{
  "id": "pour-bottles",
  "title": "How To Pour Bottles for Patients",
  "category": "Methasoft",
  "description": "Ensure methadone take-home bottles are prepared, labeled, and sealed accurately.",
  "lastUpdated": "2026-04-07",
  "sections": [
    {
      "id": "sec1",
      "title": "Preparation",
      "steps": [
        {
          "id": "step1",
          "title": "Open Methasoft",
          "screenshots": [],
          "annotations": [],
          "directionHtml": "<p>Launch the Methasoft application on your workstation.</p>"
        }
      ]
    }
  ]
}
```

A `public/guides/index.json` manifest lists all available guides for the library page.

## Existing How-To Conversion

The 4 existing PDFs will be converted to the JSON format above:
1. How To Pour Bottles (1 page, ~14 steps)
2. How To Print Manually Label (1 page, ~6 steps)
3. How To Receive Methadone (2 pages, ~5 major steps with sub-steps)
4. Label Printer Troubleshooting (10 pages — this is a DYMO manual reference, will be stored as a multi-section guide)

## File Structure

```
instruction-maker/
  index.html
  vite.config.js
  package.json
  tailwind.config.js
  public/
    guides/
      index.json          — manifest of all guides
      pour-bottles.json
      print-labels.json
      receive-methadone.json
      label-printer-troubleshooting.json
  src/
    main.jsx
    App.jsx
    pages/
      Library.jsx         — Landing page with guide cards
      Viewer.jsx          — Read-only guide viewer
      Editor.jsx          — Full annotation editor
    components/
      GuideCard.jsx       — Card component for library grid
      Sidebar.jsx         — Section/step navigator
      AnnotationCanvas.jsx — Fabric.js canvas wrapper
      AnnotationToolbar.jsx — Tool selection, color, thickness
      TextEditor.jsx      — Tiptap rich text with templates
      ExportButtons.jsx   — PDF/Word download buttons
      SearchBar.jsx       — Search and filter for library
    lib/
      exportPdf.js        — PDF generation logic
      exportDocx.js       — Word generation logic
      guideStore.js       — Load/save guide data
    assets/
      styles.css          — Tailwind imports + custom styles
```

## Features (same as desktop spec, adapted for web)

- All annotation tools: circle, rectangle, arrow, numbered markers, freehand highlight, text label, blur/redact
- Color picker with presets + custom
- Line thickness control
- Undo/Redo
- Select/move/resize/delete annotations
- Rich text with bold, italic, underline, lists, font size
- Templates dropdown for common instruction patterns
- Section/step organization with drag-and-drop
- PDF and Word export (client-side)
- Dark/light theme toggle
- Responsive design
- Keyboard shortcuts
- Auto-save drafts to localStorage

## Deployment

- GitHub Pages from the `gh-pages` branch
- Build command: `npm run build`
- Deploy: `npm run deploy` (uses `gh-pages` package)
- Repository: `MedAssistant-ux/instruction-maker`
