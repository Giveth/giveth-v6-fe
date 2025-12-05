interface AboutTabProps {
  description?: string | null
}

export function AboutTab({ description }: AboutTabProps) {
  if (!description) return <div>No description available.</div>

  return (
    <div
      className="prose prose-sm max-w-none text-gray-600"
      dangerouslySetInnerHTML={{ __html: description }}
    />
  )
}
