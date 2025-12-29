import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { projectUpdatesQuery } from '@/lib/graphql/queries'

export type ProjectUpdate = {
  id: string
  title: string
  projectId: number
  content: string
  contentSummary?: string | null
  createdAt: string
  isMain?: boolean | null
  totalReactions: number
}

export type ProjectUpdatesResult = {
  projectUpdates: ProjectUpdate[]
  totalCount: number
}

type ProjectUpdatesResponse = {
  projectUpdates: ProjectUpdatesResult
}

export const useProjectUpdates = ({
  projectId,
  skip = 0,
  take = 10,
  order = 'DESC',
  isMain,
}: {
  projectId?: number
  skip?: number
  take?: number
  order?: 'ASC' | 'DESC'
  isMain?: boolean
}) => {
  return useQuery({
    queryKey: ['projectUpdates', projectId, skip, take, order, isMain],
    queryFn: async () => {
      return graphQLClient.request<ProjectUpdatesResponse>(
        projectUpdatesQuery,
        {
          input: { projectId, skip, take, order, isMain },
        },
      )
    },
    enabled: typeof projectId === 'number' && projectId > 0,
  })
}

export const useProjectUpdatesCount = (projectId?: number) => {
  return useProjectUpdates({ projectId, skip: 0, take: 0 })
}
