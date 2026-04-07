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

  // Helper: add new page if needed
  function checkPage(needed = 20) {
    if (y + needed > pageHeight - margin) {
      doc.addPage()
      y = margin
      addFooter()
    }
  }

  // Helper: add page number footer
  function addFooter() {
    const pageCount = doc.getNumberOfPages()
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Page ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
    doc.setTextColor(0)
  }

  // Title page
  y = pageHeight / 3
  doc.setFontSize(28)
  doc.setTextColor(30, 64, 175) // blue
  doc.text(guide.title, pageWidth / 2, y, { align: 'center' })
  y += 15
  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text(guide.description || '', pageWidth / 2, y, { align: 'center', maxWidth: contentWidth })
  y += 20
  doc.setFontSize(10)
  doc.text(`Last updated: ${guide.lastUpdated || 'N/A'}`, pageWidth / 2, y, { align: 'center' })
  addFooter()

  // Table of Contents page
  doc.addPage()
  y = margin
  doc.setFontSize(20)
  doc.setTextColor(30, 64, 175)
  doc.text('Table of Contents', margin, y)
  y += 12
  doc.setFontSize(11)
  doc.setTextColor(50)

  let sectionNum = 0
  for (const section of guide.sections) {
    sectionNum++
    doc.setFont(undefined, 'bold')
    doc.text(`${sectionNum}. ${section.title}`, margin, y)
    y += 7
    let stepNum = 0
    for (const step of section.steps) {
      stepNum++
      doc.setFont(undefined, 'normal')
      doc.text(`   ${sectionNum}.${stepNum}  ${step.title}`, margin + 5, y)
      y += 6
      checkPage(10)
    }
    y += 3
  }
  addFooter()

  // Content pages
  sectionNum = 0
  for (const section of guide.sections) {
    sectionNum++
    doc.addPage()
    y = margin
    addFooter()

    // Section header
    doc.setFontSize(18)
    doc.setTextColor(30, 64, 175)
    doc.text(`${sectionNum}. ${section.title}`, margin, y)
    y += 12

    let stepNum = 0
    for (const step of section.steps) {
      stepNum++
      checkPage(30)

      // Step title
      doc.setFontSize(13)
      doc.setTextColor(50)
      doc.setFont(undefined, 'bold')
      doc.text(`Step ${sectionNum}.${stepNum}: ${step.title}`, margin, y)
      y += 8

      // Screenshots
      if (step.screenshots && step.screenshots.length > 0) {
        for (const imgDataUrl of step.screenshots) {
          if (imgDataUrl && imgDataUrl.startsWith('data:image')) {
            checkPage(80)
            try {
              // Add image scaled to content width, maintain aspect ratio
              const imgProps = doc.getImageProperties(imgDataUrl)
              const imgWidth = Math.min(contentWidth, imgProps.width * 0.264583) // px to mm approx
              const imgHeight = (imgWidth / imgProps.width) * imgProps.height
              const finalHeight = Math.min(imgHeight, 120) // cap height
              const finalWidth = (finalHeight / imgHeight) * imgWidth
              doc.addImage(imgDataUrl, 'PNG', margin, y, finalWidth > contentWidth ? contentWidth : finalWidth, finalHeight > 120 ? 120 : finalHeight)
              y += (finalHeight > 120 ? 120 : finalHeight) + 5
            } catch (e) {
              // Skip bad images
            }
          }
        }
      }

      // Direction text
      if (step.directionHtml) {
        doc.setFontSize(11)
        doc.setTextColor(60)
        doc.setFont(undefined, 'normal')
        const text = stripHtml(step.directionHtml)
        const lines = doc.splitTextToSize(text, contentWidth)
        for (const line of lines) {
          checkPage(7)
          doc.text(line, margin, y)
          y += 6
        }
      }
      y += 8
    }
  }

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
  }

  // Save
  doc.save(`${guide.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`)
}
