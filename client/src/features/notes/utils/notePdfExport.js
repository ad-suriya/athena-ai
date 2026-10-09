// Export a note as a PDF with jsPDF (loaded on demand to keep the main bundle small).

export const exportToPDF = async (content, title = 'Note', metadata = {}) => {
  try {
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF();

    doc.setProperties({
      title: title,
      subject: 'Exported from Notes App',
      author: metadata.author || 'Unknown',
      creator: 'Notes App',
      keywords: 'notes, export, document',
    });

    // Header in the theme color (#E65C52)
    doc.setFontSize(20);
    doc.setTextColor(230, 92, 82);
    doc.text(title, 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    if (metadata.lastEdited) {
      doc.text(`Last edited: ${metadata.lastEdited}`, 105, 30, { align: 'center' });
    }
    if (metadata.author) {
      doc.text(`By: ${metadata.author}`, 105, 35, { align: 'center' });
    }

    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);

    const margin = 20;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 50;

    // Wrap content to the page width, adding pages as needed
    const lines = doc.splitTextToSize(content, 170);
    lines.forEach((line) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(line, margin, yPosition);
      yPosition += 7;
    });

    doc.setFontSize(10);
    doc.setTextColor(230, 92, 82);
    doc.text('Exported from Athena AI', 105, pageHeight - 10, { align: 'center' });

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}.pdf`;

    doc.save(filename);

    return { success: true, filename };
  } catch (error) {
    console.error('PDF export error:', error);
    return { success: false, error: error.message };
  }
};

// Plain text of a TipTap editor.
export const extractEditorContent = (editor) => {
  if (!editor) return '';

  try {
    return editor.getText() || '';
  } catch (error) {
    console.warn('Could not extract editor content:', error);
    return '';
  }
};

// Notes do not store author/lastEdited/wordCount today, so these fall back to defaults.
export const getNoteMetadata = (note) => ({
  title: note?.title || 'Untitled Note',
  author: note?.author || 'Unknown',
  lastEdited: note?.lastEdited ? new Date(note.lastEdited).toLocaleString() : new Date().toLocaleString(),
  wordCount: note?.wordCount || 0
});
