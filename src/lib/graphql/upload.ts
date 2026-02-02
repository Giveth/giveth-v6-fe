import { env } from '@/lib/env'

// v6-core exposes a dedicated project image upload mutation which returns a
// public URL (no user/profile side effects).
const UPLOAD_IMAGE_MUTATION = `
  mutation UploadImage($file: Upload!) {
    createProjectImageUploadUrl(file: $file)
  }
`

type UploadResponse = {
  data?: { createProjectImageUploadUrl?: string }
  errors?: Array<{ message?: string }>
}

export async function uploadImageFile(params: {
  file: File
  token?: string | null
}): Promise<string> {
  const form = new FormData()
  form.append(
    'operations',
    JSON.stringify({
      query: UPLOAD_IMAGE_MUTATION,
      variables: { file: null },
    }),
  )
  form.append('map', JSON.stringify({ '0': ['variables.file'] }))
  form.append('0', params.file)

  const res = await fetch(env.GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      ...(params.token ? { Authorization: `Bearer ${params.token}` } : {}),
      // Apollo Server CSRF prevention blocks multipart/form-data unless we
      // explicitly require a preflight (or send a custom header).
      'apollo-require-preflight': 'true',
    },
    body: form,
  })

  let json: UploadResponse | null = null
  try {
    json = (await res.json()) as UploadResponse
  } catch {
    json = null
  }

  if (!res.ok) {
    throw new Error(
      json?.errors?.[0]?.message || `Upload failed (${res.status})`,
    )
  }

  if (json?.errors?.length) {
    throw new Error(json.errors[0]?.message || 'Upload failed')
  }

  const url = json?.data?.createProjectImageUploadUrl
  if (!url || typeof url !== 'string') {
    throw new Error('Upload failed: missing image URL')
  }

  return url
}
