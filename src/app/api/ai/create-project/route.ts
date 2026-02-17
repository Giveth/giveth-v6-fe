import { NextResponse } from 'next/server'
import { z } from 'zod'
import { CHAINS } from '@/lib/constants/chain'
import { serverEnv } from '@/lib/env/server'
import { ChainType } from '@/lib/graphql/generated/graphql'

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
const patchSchema = z
  .object({
    title: z.string().nullable(),
    description: z.string().nullable(),
    image: z.string().nullable(),
    impactLocation: z.string().nullable(),
    socialMedia: z
      .array(z.object({ type: z.string(), link: z.string() }))
      .nullable(),
    recipientAddresses: z
      .array(
        z.object({
          chainType: z.enum([
            ChainType.Evm,
            ChainType.Solana,
            ChainType.Stellar,
          ]),
          networkId: z.number().int(),
          address: z.string(),
        }),
      )
      .nullable(),
  })
  .strict()

const modelResponseSchema = z
  .object({
    patch: patchSchema.nullable(),
    assistantMessage: z.string(),
    updatedFields: z.array(z.string()),
  })
  .strict()

type PatchOut = {
  title?: string
  description?: string
  image?: string
  impactLocation?: string
  socialMedia?: { type: string; link: string }[]
  recipientAddresses?: {
    chainType: Draft['recipientAddresses'][number]['chainType']
    networkId: number
    address: string
  }[]
}

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

  const chatSystem = [
    'You are an AI assistant helping a user create a Giveth project.',
    'Be conversational and supportive, not a rigid form checker.',
    'Ask at most one short follow-up question if absolutely needed.',
    'Avoid asking for multiple form fields in one message.',
    'Do not mention internal rules or schemas.',
    'Do not invent unverifiable facts.',
  ].join('\n')

  const extractionSystem = [
    'You are an AI assistant helping a user create a Giveth project.',
    '',
    'You must output JSON only and it must match the provided JSON schema.',
    'Because the schema is strict, you MUST return null for any field you are NOT patching.',
    '',
    'DEFAULT behavior: extract explicit user-provided facts into form fields.',
    'Do NOT invent factual details (numbers, partners, locations, outcomes, claims).',
    '',
    'assistantMessage behavior (this is what the user will see in chat):',
    '- Write a natural, supportive reply, not a checklist.',
    '- Guide the user conversationally instead of requesting many form fields at once.',
    '- If you applied any patch fields, briefly confirm what changed (no need to list everything).',
    '- Ask at most ONE short follow-up question, and only when truly necessary.',
    '- Prefer helping with wording, structure, and next best step over raw field prompts.',
    '- Do NOT mention JSON, schemas, or internal rules.',
    '- Do NOT claim you updated something unless it is present in the patch.',
    '',
    'Reset / clear behavior:',
    '- If the user asks to reset/clear/wipe/remove a specific field, you MUST set that field to its empty value in the patch (and set other fields to null).',
    '- Empty values:',
    '  - title/description/image/impactLocation: empty string ""',
    '  - recipientAddresses: empty array []',
    '  - socialMedia: keep types but clear links, e.g. [{type:"website",link:""}, {type:"facebook",link:""}, {type:"x",link:""}, {type:"linkedin",link:""}]',
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
    'Fields you may patch:',
    '- title',
    '- description',
    '- image (URL only, if explicitly provided)',
    '- impactLocation',
    '- socialMedia: array of {type, link}',
    '- recipientAddresses: array of {chainType, networkId, address}.',
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
    chatSystem,
    extractionSystem,
    userContext,
    schema,
  })
}

function normalizePatch(patch: z.infer<typeof patchSchema>): PatchOut {
  const out: PatchOut = {}

  if (typeof patch.title === 'string') out.title = patch.title
  if (typeof patch.description === 'string') out.description = patch.description
  if (typeof patch.image === 'string') out.image = patch.image
  if (typeof patch.impactLocation === 'string')
    out.impactLocation = patch.impactLocation

  if (Array.isArray(patch.socialMedia)) out.socialMedia = patch.socialMedia

  if (Array.isArray(patch.recipientAddresses)) {
    out.recipientAddresses = patch.recipientAddresses.map(a => ({
      chainType: a.chainType,
      networkId: a.networkId,
      address: a.address,
    }))
  }

  return out
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

function safeJsonParse(text: string): unknown | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function extractFirstJsonText(payload: unknown): string | null {
  // OpenAI Responses API usually returns: { output: [{ content: [{ type: "output_text", text: "..." }] }] }
  if (!isRecord(payload)) return null
  const out = payload.output
  if (!Array.isArray(out)) return null
  for (const item of out) {
    const content = isRecord(item) ? item.content : undefined
    if (!Array.isArray(content)) continue
    for (const c of content) {
      if (!isRecord(c)) continue
      if (c.type === 'output_text' && typeof c.text === 'string') {
        return c.text
      }
    }
  }
  // Fallbacks
  if (typeof payload.output_text === 'string') return payload.output_text
  if (typeof payload.text === 'string') return payload.text
  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function createOpenAiBackedEventStreamResponse({
  apiKey,
  model,
  baseUrl,
  chatSystem,
  extractionSystem,
  userContext,
  schema,
}: {
  apiKey: string
  model: string
  baseUrl: string
  chatSystem: string
  extractionSystem: string
  userContext: string
  schema: {
    name: string
    strict: true
    schema: Record<string, unknown>
  }
}) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      void (async () => {
        try {
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
                  content: [{ type: 'input_text', text: chatSystem }],
                },
                {
                  role: 'user',
                  content: [{ type: 'input_text', text: userContext }],
                },
              ],
            }),
          })

          if (!conversationRes.ok || !conversationRes.body) {
            const t = await conversationRes.text().catch(() => '')
            throw new Error(t || 'OpenAI streaming request failed')
          }

          const reader = conversationRes.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          let assistantMessage = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const events = buffer.split('\n\n')
            buffer = events.pop() ?? ''

            for (const event of events) {
              const data = parseSseData(event)
              if (!data || data === '[DONE]') continue
              const payload = safeJsonParse(data)
              if (!isRecord(payload)) continue

              const delta =
                payload.type === 'response.output_text.delta' &&
                typeof payload.delta === 'string'
                  ? payload.delta
                  : null
              if (!delta) continue

              assistantMessage += delta
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'assistant_delta', delta })}\n\n`,
                ),
              )
            }
          }

          const patch = await extractPatchFromOpenAi({
            apiKey,
            model,
            baseUrl,
            extractionSystem,
            userContext: `${userContext}\n\nASSISTANT_MESSAGE:\n${assistantMessage}`,
            schema,
          })

          if (patch) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'patch', patch })}\n\n`,
              ),
            )
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`),
          )
          controller.close()
        } catch (e) {
          const message =
            e instanceof Error ? e.message : 'Streaming response failed'
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', message })}\n\n`,
            ),
          )
          controller.close()
        }
      })()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

async function extractPatchFromOpenAi({
  apiKey,
  model,
  baseUrl,
  extractionSystem,
  userContext,
  schema,
}: {
  apiKey: string
  model: string
  baseUrl: string
  extractionSystem: string
  userContext: string
  schema: {
    name: string
    strict: true
    schema: Record<string, unknown>
  }
}): Promise<PatchOut | undefined> {
  const url = new URL('/v1/responses', baseUrl).toString()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: extractionSystem }],
        },
        { role: 'user', content: [{ type: 'input_text', text: userContext }] },
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

  if (!res.ok) return undefined
  const payload = (await res.json().catch(() => null)) as unknown
  const jsonText = extractFirstJsonText(payload)
  if (!jsonText) return undefined
  const parsed = modelResponseSchema.safeParse(safeJsonParse(jsonText) ?? null)
  if (!parsed.success) return undefined
  const patchRaw = parsed.data.patch
  return patchRaw ? normalizePatch(patchRaw) : undefined
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
