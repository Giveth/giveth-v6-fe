import {
  dehydrate,
  type DehydratedState,
  type QueryClient,
} from '@tanstack/react-query'

export const getDehydratedState = (client: QueryClient): DehydratedState =>
  dehydrate(client)
