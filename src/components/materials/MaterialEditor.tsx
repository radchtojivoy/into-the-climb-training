import { useEffect, useRef } from 'react'
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Icon } from '../ui/Icon'
import { useUploadMaterialImage } from '../../hooks/useMaterialImageUpload'

interface MaterialEditorProps {
  content: JSONContent | null
  onChange: (json: JSONContent) => void
}

export function MaterialEditor({ content, onChange }: MaterialEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadImage = useUploadMaterialImage()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Текст матеріалу...' }),
    ],
    content: content ?? '',
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  })

  const hydrated = useRef(false)

  useEffect(() => {
    if (!editor || hydrated.current || !content) return
    hydrated.current = true
    editor.commands.setContent(content)
  }, [editor, content])

  useEffect(() => {
    return () => editor?.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!editor) return null

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const url = await uploadImage.mutateAsync(file)
    editor?.chain().focus().setImage({ src: url }).run()
  }

  function handleLink() {
    const url = window.prompt('Посилання (URL):')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="editor">
      <div className="toolbar" role="toolbar" aria-label="Форматування">
        <button
          type="button"
          aria-label="Жирний"
          className={editor.isActive('bold') ? 'active' : undefined}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          aria-label="Курсив"
          style={{ fontStyle: 'italic', fontWeight: 600 }}
          className={editor.isActive('italic') ? 'active' : undefined}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          aria-label="Підзаголовок"
          className={editor.isActive('heading', { level: 3 }) ? 'active' : undefined}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H
        </button>
        <button
          type="button"
          aria-label="Список"
          className={editor.isActive('bulletList') ? 'active' : undefined}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <Icon name="list" />
        </button>
        <span className="sp" />
        <button type="button" aria-label="Додати фото" onClick={() => fileInputRef.current?.click()} disabled={uploadImage.isPending}>
          <Icon name="img" />
        </button>
        <button type="button" aria-label="Посилання" onClick={handleLink}>
          <Icon name="link" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
