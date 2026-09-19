import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import type { JSONContent } from '@tiptap/react'

const EXTENSIONS = [StarterKit, Image, Link]

export function renderMaterialBody(body: unknown): string {
  if (!body || typeof body !== 'object') return ''
  try {
    return generateHTML(body as JSONContent, EXTENSIONS)
  } catch {
    return ''
  }
}
