import jsPDF from 'jspdf'

function stripHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export async function exportToPdf(guide) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // Colors
  const blue = [30, 64, 175]
  const lightBlue = [59, 130, 246]
  const darkGray = [60, 60, 60]
  const medGray = [120, 120, 120]
  const ruleGray = [200, 200, 200]

  // Helper: add new page if needed
  function checkPage(needed = 20) {
    if (y + needed > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  // Helper: draw a horizontal rule
  function drawRule() {
    doc.setDrawColor(...ruleGray)
    doc.setLineWidth(0.3)
    doc.line(margin, y, margin + contentWidth, y)
    y += 4
  }

  // Helper: draw a numbered circle badge
  function drawStepBadge(x, yPos, number) {
    const radius = 4.5
    // Filled blue circle
    doc.setFillColor(...lightBlue)
    doc.circle(x + radius, yPos - 2.5, radius, 'F')
    // White number text centered in circle
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.setFont(undefined, 'bold')
    doc.text(String(number), x + radius, yPos - 1.5, { align: 'center' })
  }

  // Helper: draw section header with colored left border
  function drawSectionHeader(text) {
    // Colored left border bar
    doc.setFillColor(...blue)
    doc.rect(margin, y - 5, 3, 8, 'F')
    // Section title
    doc.setFontSize(18)
    doc.setTextColor(...blue)
    doc.setFont(undefined, 'bold')
    doc.text(text, margin + 7, y)
    y += 4
    // Underline
    doc.setDrawColor(...blue)
    doc.setLineWidth(0.5)
    doc.line(margin, y, margin + contentWidth, y)
    y += 8
  }

  // --- Title page ---
  y = pageHeight / 3
  doc.setFontSize(28)
  doc.setTextColor(...blue)
  doc.setFont(undefined, 'bold')
  doc.text(guide.title, pageWidth / 2, y, { align: 'center' })
  y += 15
  doc.setFontSize(12)
  doc.setTextColor(...medGray)
  doc.setFont(undefined, 'normal')
  doc.text(guide.description || '', pageWidth / 2, y, { align: 'center', maxWidth: contentWidth })
  y += 20
  doc.setFontSize(10)
  doc.text(`Last updated: ${guide.lastUpdated || 'N/A'}`, pageWidth / 2, y, { align: 'center' })

  // --- Table of Contents page ---
  doc.addPage()
  y = margin
  doc.setFontSize(20)
  doc.setTextColor(...blue)
  doc.setFont(undefined, 'bold')
  doc.text('Table of Contents', margin, y)
  y += 4
  doc.setDrawColor(...blue)
  doc.setLineWidth(0.5)
  doc.line(margin, y, margin + 60, y)
  y += 10

  let sectionNum = 0
  for (const section of guide.sections) {
    sectionNum++
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(...darkGray)
    doc.text(`${sectionNum}. ${section.title}`, margin, y)
    y += 7
    let stepNum = 0
    for (const step of section.steps) {
      stepNum++
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      doc.setTextColor(...medGray)
      doc.text(`${sectionNum}.${stepNum}  ${step.title}`, margin + 8, y)
      y += 6
      checkPage(10)
    }
    y += 4
  }

  // --- Content pages ---
  sectionNum = 0
  for (const section of guide.sections) {
    sectionNum++
    doc.addPage()
    y = margin

    // Section header with colored left border
    drawSectionHeader(`${sectionNum}. ${section.title}`)

    let stepNum = 0
    for (const step of section.steps) {
      stepNum++
      checkPage(35)

      // Horizontal rule between steps (skip before first step)
      if (stepNum > 1) {
        drawRule()
        y += 2
      }

      const stepLabel = `${sectionNum}.${stepNum}`

      // Draw the numbered badge circle
      drawStepBadge(margin, y, stepLabel)

      // Step title in bold next to badge
      doc.setFontSize(13)
      doc.setTextColor(...darkGray)
      doc.setFont(undefined, 'bold')
      doc.text(step.title, margin + 12, y)
      y += 10

      // Screenshots
      if (step.screenshots && step.screenshots.length > 0) {
        for (const imgDataUrl of step.screenshots) {
          if (imgDataUrl && imgDataUrl.startsWith('data:image')) {
            checkPage(80)
            try {
              const imgProps = doc.getImageProperties(imgDataUrl)
              const imgWidth = Math.min(contentWidth, imgProps.width * 0.264583)
              const imgHeight = (imgWidth / imgProps.width) * imgProps.height
              const finalHeight = Math.min(imgHeight, 120)
              const finalWidth = (finalHeight / imgHeight) * imgWidth
              const w = finalWidth > contentWidth ? contentWidth : finalWidth
              const h = finalHeight > 120 ? 120 : finalHeight
              // Light border around image
              doc.setDrawColor(...ruleGray)
              doc.setLineWidth(0.2)
              doc.rect(margin, y, w, h)
              doc.addImage(imgDataUrl, 'PNG', margin, y, w, h)
              y += h + 6
            } catch (e) {
              // Skip bad images
            }
          }
        }
      }

      // Direction text
      if (step.directionHtml) {
        doc.setFontSize(11)
        doc.setTextColor(...darkGray)
        doc.setFont(undefined, 'normal')
        const text = stripHtml(step.directionHtml)
        const lines = doc.splitTextToSize(text, contentWidth)
        for (const line of lines) {
          checkPage(7)
          doc.text(line, margin, y)
          y += 6
        }
      }
      y += 6
    }
  }

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.setFont(undefined, 'normal')
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
  }

  // Save
  doc.save(`${guide.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)
}
