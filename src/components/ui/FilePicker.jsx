import { useRef } from 'react';
import Button from './Button.jsx';

// A button that opens the system file chooser. Calls onFile(file).
export default function FilePicker({ onFile, accept = 'image/*', children, ...buttonProps }) {
  const ref = useRef(null);
  return (
    <>
      <Button onClick={() => ref.current && ref.current.click()} {...buttonProps}>{children}</Button>
      <input
        ref={ref} type="file" accept={accept} hidden
        onChange={(e) => { onFile(e.target.files[0]); e.target.value = ''; }}
      />
    </>
  );
}
