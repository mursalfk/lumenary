// src/hooks/usePasteFile.js
import { useEffect } from 'react';

// Calls onFile with the first image or video found on the clipboard.
export default function usePasteFile(onFile) {
  useEffect(() => {
    const onPaste = (e) => {
      const items = (e.clipboardData && e.clipboardData.items) || [];
      for (const item of items) {
        if (item.kind === 'file' && /^(image|video)\//.test(item.type)) { onFile(item.getAsFile()); break; }
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [onFile]);
}
