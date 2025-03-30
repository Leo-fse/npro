"use client";
import { useRef, useEffect, useState } from 'react';

export default function QuillEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    async function initQuill() {
      if (typeof window !== 'undefined') {
        const Quill = (await import('quill')).default;
        
        if (editorRef.current && !quillRef.current) {
          const toolbarOptions = [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
          ];

          quillRef.current = new Quill(editorRef.current, {
            modules: {
              toolbar: toolbarOptions
            },
            placeholder: placeholder || 'ここに入力...',
            theme: 'snow'
          });

          // 初期値を設定
          if (value) {
            quillRef.current.root.innerHTML = value;
          }

          // エディタの変更を監視
          quillRef.current.on('text-change', () => {
            if (onChange) {
              onChange(quillRef.current.root.innerHTML);
            }
          });

          setEditorReady(true);
        }
      }
    }

    initQuill();

    // クリーンアップ
    return () => {
      if (quillRef.current) {
        // Quillインスタンスのクリーンアップ処理（必要に応じて）
        quillRef.current = null;
      }
    };
  }, []);

  // valueが外部から変更された場合の対応
  useEffect(() => {
    if (quillRef.current && editorReady && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value, editorReady]);

  return (
    <div className="quill-editor-container">
      <div ref={editorRef} className="h-64" />
    </div>
  );
}