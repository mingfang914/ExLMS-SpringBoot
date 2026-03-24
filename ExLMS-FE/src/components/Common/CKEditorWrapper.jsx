import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Custom Upload Adapter for CKEditor
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }
  upload() {
    return this.loader.file.then(file => new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('upload', file);
      const token = localStorage.getItem('token');
      fetch('/api/cke/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
        .then(res => res.json())
        .then(res => {
          if (res.uploaded) resolve({ default: res.url });
          else reject(res.error?.message || 'Upload failed');
        })
        .catch(err => reject(err));
    }));
  }
  abort() { }
}

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

const CKEditorWrapper = ({ value, onChange, placeholder, minHeight = '300px' }) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let editorInstance = null;
    let isMounted = true;

    const initEditor = async () => {
      if (!containerRef.current || editorRef.current) return;

      // Wait for script if needed
      if (!window.ClassicEditor) {
        let attempts = 0;
        while (!window.ClassicEditor && attempts < 100) {
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
      }

      if (!isMounted) return;

      if (window.ClassicEditor && containerRef.current) {
        try {
          editorInstance = await window.ClassicEditor.create(containerRef.current, {
            extraPlugins: [MyCustomUploadAdapterPlugin],
            placeholder: placeholder || 'Nhập nội dung...',
          });

          if (!isMounted) {
            editorInstance.destroy();
            return;
          }

          editorRef.current = editorInstance;
          editorInstance.setData(value || '');
          setIsReady(true);

          editorInstance.model.document.on('change:data', () => {
            const data = editorInstance.getData();
            onChange(data);
          });
        } catch (err) {
          console.error(`[CKEditor] Initialization failed:`, err);
        }
      }
    };

    initEditor();

    return () => {
      isMounted = false;
      if (editorRef.current) {
        editorRef.current.destroy()
          .then(() => {
            editorRef.current = null;
          })
          .catch(err => console.error('Error destroying editor:', err));
      }
    };
  }, []); // Only on mount

  // Sync value if changed externally (but not if it's the same data to avoid loops)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getData()) {
      editorRef.current.setData(value || '');
    }
  }, [value]);

  return (
    <Box sx={{
      mt: 1,
      minHeight: minHeight,
      border: isReady ? 'none' : '1px dashed #ccc',
      borderRadius: 1,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {!isReady && (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          <CircularProgress size={24} sx={{ mb: 1 }} /><br />
          Đang tải bộ soạn thảo...
        </Box>
      )}
      <Box sx={{ '& .ck-editor__editable': { minHeight: minHeight } }}>
        <div ref={containerRef} />
      </Box>
    </Box>
  );
};

export default CKEditorWrapper;
