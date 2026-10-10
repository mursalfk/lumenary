import { useEffect } from 'react';

// Calls onFile with the first image found on the clipboard.
export default function usePasteImage(onFile) {
  useEffect(() => {
    const onPaste = (e) => {
      const items = (e.clipboardData && e.clipboardData.items) || [];
      for (const item of items) {
        if (item.type.startsWith('image/')) { onFile(item.getAsFile()); break; }
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [onFile]);
}
