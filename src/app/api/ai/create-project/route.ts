import { NextResponse } from 'next/server'
import { z } from 'zod'
import { MAX_CATEGORIES } from '@/components/project/CreateProjectFullForm'
import { CHAINS } from '@/lib/constants/chain'
import { createEmptyCreateProjectSocialMedia } from '@/lib/create-project/types'
import { serverEnv } from '@/lib/env/server'
import { createGraphQLClient } from '@/lib/graphql/client'
import { ChainType } from '@/lib/graphql/generated/graphql'
import { mainCategoriesQuery } from '@/lib/graphql/queries'

type DraftChainType = ChainType

type Draft = {
  title: string
  description: string
  image: string
  impactLocation: string
  categoryIds: number[]
  socialMedia: { type: string; link: string }[]
  recipientAddresses: {
    chainType: DraftChainType
    networkId: number
    address: string
  }[]
}

type CategoryOption = {
  id: number
  name: string
  group?: string
}

const requestSchema = z.object({
  message: z.string().min(1),
  draft: z.unknown(),
  attachmentImageUrl: z.string().min(1).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['assistant', 'user']),
        content: z.string(),
      }),
    )
    .optional(),
})

// NOTE: With OpenAI Structured Outputs + strict=true, all object keys must be required.
// We model optional fields as nullable, then normalize nulls away.
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const apiKey = serverEnv.OPENAI_API_KEY
  const openAiBaseUrl = serverEnv.OPENAI_BASE_URL || 'https://api.openai.com'
  if (!apiKey?.trim()) {
    return NextResponse.json(
      {
        assistantMessage:
          'AI is not configured on this environment (missing OPENAI_API_KEY). You can still fill the form manually.',
      },
      { status: 200 },
    )
  }

  const parsedReq = requestSchema.safeParse(await req.json().catch(() => null))
  if (!parsedReq.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const message = parsedReq.data.message
  const draft = sanitizeDraft(parsedReq.data.draft)
  const attachmentImageUrl =
    typeof parsedReq.data.attachmentImageUrl === 'string' &&
    parsedReq.data.attachmentImageUrl.trim()
      ? parsedReq.data.attachmentImageUrl.trim()
      : undefined

  const supportedEvmNetworkIds = Object.values(CHAINS)
    .filter(c => !c.isTestnet)
    .map(c => c.id)
    // Exclude non-EVM chain ids that are present in CHAINS for other parts of the app.
    .filter(id => id !== 101 && id !== 1500 && id !== 3000)
    .sort((a, b) => a - b)
  const categoryOptions = await getCategoryOptions().catch(() => [])

  const schema = {
    name: 'CreateProjectAssistantExtraction',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        assistantMessage: { type: 'string' },
        patch: {
          anyOf: [
            { type: 'null' },
            {
              type: 'object',
              additionalProperties: false,
              properties: {
                title: { type: ['string', 'null'] },
                description: { type: ['string', 'null'] },
                image: { type: ['string', 'null'] },
                impactLocation: { type: ['string', 'null'] },
                categoryIds: {
                  type: ['array', 'null'],
                  items: { type: 'integer' },
                  maxItems: MAX_CATEGORIES,
                },
                socialMedia: {
                  type: ['array', 'null'],
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      type: { type: 'string' },
                      link: { type: 'string' },
                    },
                    required: ['type', 'link'],
                  },
                },
                recipientAddresses: {
                  type: ['array', 'null'],
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      chainType: {
                        type: 'string',
                        enum: ['EVM', 'SOLANA', 'STELLAR'],
                      },
                      networkId: { type: 'integer' },
                      address: { type: 'string' },
                    },
                    required: ['chainType', 'networkId', 'address'],
                  },
                },
              },
              required: [
                'title',
                'description',
                'image',
                'impactLocation',
                'categoryIds',
                'socialMedia',
                'recipientAddresses',
              ],
            },
          ],
        },
        updatedFields: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['assistantMessage', 'patch', 'updatedFields'],
    },
  } as const

  const structuredSystem = [
    'You are an AI assistant helping a user create a Giveth project.',
    '',
    'You must return ONE JSON object only, and it must match the provided JSON schema.',
    'Do not wrap the JSON in markdown fences.',
    'Put the user-facing chat reply in assistantMessage.',
    '',
    'assistantMessage behavior (this is what the user will see in chat):',
    '- Write a natural, supportive reply, not a checklist.',
    '- Guide the user conversationally instead of requesting many form fields at once.',
    '- If you filled empty fields, you may briefly confirm what changed (no need to list everything).',
    '- If you are suggesting a replacement for information already present in CURRENT_DRAFT_JSON, describe it as a suggestion the user can confirm instead of saying it was already updated.',
    '- Ask at most ONE short follow-up question, and only when truly necessary.',
    '- Prefer helping with wording, structure, and next best step over raw field prompts.',
    '- Do NOT mention JSON, schemas, or internal rules.',
    '- Do NOT claim you updated something unless it is present in the patch.',
    '',
    'You must output JSON only and it must match the provided JSON schema.',
    'Because the schema is strict, you MUST return null for any field you are NOT patching.',
    '',
    'DEFAULT behavior: extract facts into form fields from the user message and the choices you make in assistantMessage.',
    'This includes values you recommended, selected, or generated on behalf of the user.',
    'Treat CURRENT_DRAFT_JSON as context only. Do not copy it into patched fields unless the user explicitly asks to replace that field.',
    'Never set any field to raw JSON, chat-history scaffolding, schema text, or meta-conversation text.',
    'Do NOT invent factual details (numbers, partners, locations, outcomes, claims).',
    '',
    'Reset / clear behavior:',
    '- If the user asks to reset/clear/wipe/remove a specific field, you MUST set that field to its empty value in the patch (and set other fields to null).',
    '- Empty values:',
    '  - title/description/image/impactLocation: empty string ""',
    '  - recipientAddresses: empty array []',
    `  - socialMedia: keep types but clear links, e.g. ${JSON.stringify(
      createEmptyCreateProjectSocialMedia(),
    )}`,
    '- If the user asks to reset everything / start over, clear all fields above.',
    '',
    'EVM recipient address behavior:',
    `- The product supports these EVM networkIds: ${supportedEvmNetworkIds.join(
      ', ',
    )}.`,
    '- If the user says "set this wallet for all EVM chains/networks" and provides ONE EVM address, create recipientAddresses entries for ALL the EVM networkIds listed above, using the same address for each one.',
    '- If the user implies different addresses per EVM network but does not provide a mapping, do NOT guess. Leave recipientAddresses as null and ask which address should be used for which EVM network.',
    '',
    'EXCEPTION (opt-in generation): If the user explicitly asks you to "generate / draft / write" a project description, you MAY create a neutral draft description.',
    '- Aim for ~300–500 words.',
    '- Base it only on the project title and any facts in the current draft/user message.',
    '- Avoid unverifiable specifics; keep wording general.',
    '- If title is missing, ask for it and do not draft.',
    '',
    'Description behavior:',
    '- Only patch description when the latest user message clearly provides description content, asks to edit it, asks to clear it, or explicitly asks you to draft/write/generate it.',
    '- Description must be plain project prose only.',
    '- Do NOT copy CURRENT_DRAFT_JSON, RECENT_CHAT_HISTORY, USER_MESSAGE labels, ASSISTANT_MESSAGE, or helper text such as follow-up questions into description.',
    '',
    'Fields you may patch:',
    '- title',
    '- description',
    '- image (URL only, if explicitly provided)',
    '- impactLocation',
    '- categoryIds: array of category IDs',
    '- socialMedia: array of {type, link}',
    '- recipientAddresses: array of {chainType, networkId, address}.',
    '',
    'Category behavior:',
    '- You will receive CATEGORY_OPTIONS_JSON in the prompt (id/name/group).',
    '- If the user or assistantMessage mentions, recommends, or selects category names, map them to IDs and set categoryIds.',
    '- When the user asks you to choose/pick/suggest categories, if assistantMessage contains the chosen categories, you MUST extract those into categoryIds.',
    '- categoryIds must only include IDs from CATEGORY_OPTIONS_JSON.',
    `- categoryIds must include at most ${MAX_CATEGORIES} IDs.`,
    '- If no category clearly matches user intent, leave categoryIds as null and ask one concise follow-up.',
    '',
    'Attachments:',
    '- If the user attached an image, you will receive ATTACHED_IMAGE_URL in the prompt.',
    '- Do NOT set image unless the user explicitly asks to use the attached image as the project image.',
  ].join('\n')

  const history = Array.isArray(parsedReq.data.history)
    ? parsedReq.data.history
    : []
  const userContext = [
    'CURRENT_DRAFT_JSON:',
    JSON.stringify(draft),
    '',
    'ATTACHED_IMAGE_URL:',
    attachmentImageUrl ?? '(none)',
    '',
    'CATEGORY_OPTIONS_JSON:',
    JSON.stringify(categoryOptions),
    '',
    'RECENT_CHAT_HISTORY:',
    history
      .slice(-12)
      .map(h => `${h.role.toUpperCase()}: ${h.content}`)
      .join('\n'),
    '',
    'USER_MESSAGE:',
    message,
  ].join('\n')

  return createOpenAiBackedEventStreamResponse({
    apiKey,
    model: serverEnv.OPENAI_MODEL || 'gpt-5-mini',
    baseUrl: openAiBaseUrl,
    structuredSystem,
    userContext,
    schema,
  })
}

function sanitizeDraft(input: unknown): Draft {
  const d = isRecord(input) ? (input as Partial<Draft>) : {}
  return {
    title: toStringOrEmpty(d.title),
    description: toStringOrEmpty(d.description),
    image: toStringOrEmpty(d.image),
    impactLocation: toStringOrEmpty(d.impactLocation),
    categoryIds: Array.isArray(d.categoryIds)
      ? d.categoryIds
          .map(n => Number(n))
          .filter(n => Number.isFinite(n) && Number.isInteger(n))
      : [],
    socialMedia: Array.isArray(d.socialMedia)
      ? d.socialMedia
          .map(item => {
            const rec = isRecord(item)
              ? (item as Record<string, unknown>)
              : ({} as Record<string, unknown>)
            return {
              type: toStringOrEmpty(rec['type']),
              link: toStringOrEmpty(rec['link']),
            }
          })
          .filter(s => s.type && typeof s.link === 'string')
      : [],
    recipientAddresses: Array.isArray(d.recipientAddresses)
      ? d.recipientAddresses.map(item => {
          const rec = isRecord(item)
            ? (item as Record<string, unknown>)
            : ({} as Record<string, unknown>)
          const chainTypeRaw = toStringOrEmpty(rec['chainType']).toUpperCase()
          const chainType: DraftChainType =
            chainTypeRaw === 'SOLANA'
              ? ChainType.Solana
              : chainTypeRaw === 'STELLAR'
                ? ChainType.Stellar
                : ChainType.Evm

          return {
            chainType,
            networkId: Number(rec['networkId'] ?? 1),
            address: toStringOrEmpty(rec['address']),
          }
        })
      : [],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

async function getCategoryOptions(): Promise<CategoryOption[]> {
  const client = createGraphQLClient()
  const data = await client.request(mainCategoriesQuery)
  const mainCategories = Array.isArray(data.mainCategories)
    ? data.mainCategories
    : []

  const options: CategoryOption[] = []
  for (const main of mainCategories) {
    const group = toStringOrEmpty(main?.title)
    const categories = Array.isArray(main?.categories) ? main.categories : []

    for (const cat of categories) {
      if (!cat?.canUseOnFrontend || !cat?.isActive) continue
      const id = Number(cat.id)
      const name = toStringOrEmpty(cat.name)
      if (!Number.isInteger(id) || !name) continue
      options.push({ id, name, group })
    }
  }

  return options
}

async function createOpenAiBackedEventStreamResponse({
  apiKey,
  model,
  baseUrl,
  structuredSystem,
  userContext,
  schema,
}: {
  apiKey: string
  model: string
  baseUrl: string
  structuredSystem: string
  userContext: string
  schema: {
    name: string
    strict: true
    schema: Record<string, unknown>
  }
}) {
  const conversationUrl = new URL('/v1/responses', baseUrl).toString()
  const conversationRes = await fetch(conversationUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      stream: true,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: structuredSystem }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: userContext }],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: schema.name,
          schema: schema.schema,
          strict: schema.strict,
        },
      },
    }),
  })

  if (!conversationRes.ok || !conversationRes.body) {
    const t = await conversationRes.text().catch(() => '')
    throw new Error(t || 'OpenAI streaming request failed')
  }

  const decoder = new TextDecoder()
  let logBuffer = ''
  const upstreamReader = conversationRes.body.getReader()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      void (async () => {
        try {
          while (true) {
            const { done, value } = await upstreamReader.read()
            if (done) break
            if (!value) continue

            controller.enqueue(value)
            logBuffer += decoder.decode(value, { stream: true })
            const events = logBuffer.split('\n\n')
            logBuffer = events.pop() ?? ''

            for (const event of events) {
              const data = parseSseData(event)
              if (!data || data === '[DONE]') continue
              console.warn('OpenAI create-project stream event:', data)
            }
          }

          logBuffer += decoder.decode()
          if (logBuffer.trim()) {
            const data = parseSseData(logBuffer)
            if (data && data !== '[DONE]') {
              console.warn('OpenAI create-project stream event:', data)
            }
          }
          controller.close()
        } catch (e) {
          controller.error(e)
        }
      })()
    },
    cancel() {
      void upstreamReader.cancel()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':
        conversationRes.headers.get('content-type') ||
        'text/event-stream; charset=utf-8',
      'Cache-Control':
        conversationRes.headers.get('cache-control') ||
        'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
function parseSseData(rawEvent: string): string | null {
  const lines = rawEvent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('data:'))
    .map(line => line.slice(5).trim())

  if (!lines.length) return null
  return lines.join('\n')
}
