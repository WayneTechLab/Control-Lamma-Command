import {
  addDoc,
  collection,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore'
import type { ChatMessage, GenerationOptions } from '@/types/ollama'

type SaveConversationInput = {
  db: Firestore | null
  ownerUid?: string
  title: string
  model: string
  messages: ChatMessage[]
  options: GenerationOptions
}

const LOCAL_CONVERSATIONS_KEY = 'molc-ai.conversations'

export async function saveConversation({
  db,
  ownerUid,
  title,
  model,
  messages,
  options,
}: SaveConversationInput) {
  const payload = {
    ownerUid: ownerUid ?? 'local-preview',
    title: title.trim() || 'Untitled conversation',
    model,
    messages,
    options,
    updatedAt: new Date().toISOString(),
  }

  if (db && ownerUid) {
    const ref = await addDoc(collection(db, 'conversations'), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { id: ref.id, storage: 'firestore' as const }
  }

  const current = JSON.parse(
    window.localStorage.getItem(LOCAL_CONVERSATIONS_KEY) || '[]',
  ) as Array<typeof payload & { id: string }>
  const id = crypto.randomUUID()
  window.localStorage.setItem(
    LOCAL_CONVERSATIONS_KEY,
    JSON.stringify([{ ...payload, id }, ...current].slice(0, 50)),
  )
  return { id, storage: 'local' as const }
}

export function exportConversationMarkdown(
  title: string,
  model: string,
  messages: ChatMessage[],
) {
  const lines = [
    `# ${title.trim() || 'MOLC-AI Conversation'}`,
    '',
    `Model: ${model || 'Unknown'}`,
    `Exported: ${new Date().toISOString()}`,
    '',
    ...messages.flatMap((message) => [
      `## ${message.role === 'user' ? 'User' : 'Assistant'}`,
      '',
      message.content,
      '',
    ]),
  ]

  return lines.join('\n')
}

export function downloadText(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
