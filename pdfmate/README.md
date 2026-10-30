# PDF Mate

Offline PDF editor by Tango Juliet Dev. Fill, sign, stamp and mark up PDFs, then merge, reorder, rotate or delete pages. Installable PWA. Files are processed on the device and never uploaded.

## Features

- Open PDFs (password-protected too), photos as pages, or blank pages. Merge several files into one.
- Fill form fields directly on the page (text, checkboxes, dropdowns, radio buttons). Values are flattened into the saved file.
- Markup: text, whiteout, highlight, rectangle, line, arrow, freehand pen, tick, cross.
- Signatures drawn on screen and imported stamp images (with white background removal), kept in a local library.
- Page sidebar: reorder by drag or buttons, rotate, delete, insert blank, multi-select, save selected pages only.
- Undo and redo, keyboard shortcuts, light and dark appearance.
- Print with page range, one-sided, two-sided (long or short edge binding, preset in the print dialog) or manual two-sided for printers without duplex.
- Save by download or share sheet (email, WhatsApp) on phones.

Editing the original text inside a PDF is not supported. Cover it with Whiteout and type over it.

## Structure

- `index.html` markup and styles
- `app.js` application (ES module)
- `vendor/` pdf.js 6.2 legacy build (Apache 2.0) with cmaps, standard fonts and wasm decoders, pdf-lib 1.17.1 (MIT)
- `sw.js` offline cache, `manifest.webmanifest`, `icons/`
