# OCR (Optical Character Recognition)

## Overview
OCR is used to scan and digitize menu images, allowing users to quickly add menu items from restaurants, bars, and cafes. The primary engine is Tesseract.js (WASM), running client-side for privacy and cost savings. A server-side fallback may be added for improved accuracy or performance in the future.

## Flow
1. User uploads or takes a photo of a menu.
2. Tesseract.js (WASM) runs in-browser to extract text from the image.
3. Extracted text is parsed into menu items and categories using custom logic.
4. User reviews and edits the parsed menu before saving.
5. Menu items are saved to the database, linked to the restaurant/bar.

## Client-Side (Tesseract.js)
- Runs fully in-browser for fast, private, and free OCR.
- Supports most modern browsers and mobile devices.
- No external API calls required for basic OCR.

## Fallback (Future)
- If client-side OCR fails or is insufficient, an API route can process the image server-side (using Tesseract or a more powerful engine).
- This fallback can be toggled based on user/device capability or error state.

## Menu Extraction Logic
- Extracted text is split into lines.
- Heuristics and regex are used to identify item names, prices, categories, and descriptions.
- User can manually adjust or add custom fields before saving.

## Error Handling & User Feedback
- Clear progress indicators during OCR processing.
- User-friendly error messages if OCR fails or produces poor results.
- Option to retry, edit manually, or upload a different image.
