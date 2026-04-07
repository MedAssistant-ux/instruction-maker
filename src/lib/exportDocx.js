import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType, PageBreak, Header, Footer, PageNumber } from 'docx'
import { saveAs } from 'file-saver'

function stripHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.split(',')[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function exportToDocx(guide) {
  const children = []

  // Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: guide.title, bold: true, size: 56, color: '1E40AF' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  )

  // Description
  if (guide.description) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: guide.description, size: 24, color: '666666' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    )
  }

  // Last updated
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Last updated: ${guide.lastUpdated || 'N/A'}`, size: 20, color: '999999' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  )

  // Page break after title
  children.push(new Paragraph({ children: [new PageBreak()] }))

  // Table of Contents
  children.push(
    new Paragraph({
      text: 'Table of Contents',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  )

  // TOC entries (manual since docx TOC needs Word to render)
  let sn = 0
  for (const section of guide.sections) {
    sn++
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `${sn}. ${section.title}`, bold: true, size: 24 })],
        spacing: { after: 80 },
      })
    )
    let stepN = 0
    for (const step of section.steps) {
      stepN++
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `    ${sn}.${stepN}  ${step.title}`, size: 22 })],
          spacing: { after: 40 },
        })
      )
    }
  }

  children.push(new Paragraph({ children: [new PageBreak()] }))

  // Content
  sn = 0
  for (const section of guide.sections) {
    sn++
    children.push(
      new Paragraph({
        text: `${sn}. ${section.title}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    )

    let stepN = 0
    for (const step of section.steps) {
      stepN++
      children.push(
        new Paragraph({
          text: `Step ${sn}.${stepN}: ${step.title}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      )

      // Screenshots
      if (step.screenshots) {
        for (const imgDataUrl of step.screenshots) {
          if (imgDataUrl && imgDataUrl.startsWith('data:image')) {
            try {
              const buffer = dataUrlToBuffer(imgDataUrl)
              children.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: buffer,
                      transformation: { width: 550, height: 350 },
                      type: 'png',
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 100 },
                })
              )
            } catch (e) {
              // Skip bad images
            }
          }
        }
      }

      // Direction text
      if (step.directionHtml) {
        const text = stripHtml(step.directionHtml)
        children.push(
          new Paragraph({
            children: [new TextRun({ text, size: 22 })],
            spacing: { after: 200 },
          })
        )
      }
    }
  }

  const doc = new Document({
    sections: [{
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [new TextRun({ text: guide.title, size: 16, color: '999999' })],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], size: 16, color: '999999' }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      children,
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${guide.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`)
}
