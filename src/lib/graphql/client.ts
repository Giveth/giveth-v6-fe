import { GraphQLClient, type RequestMiddleware } from "graphql-request";

import { env } from "@/lib/env";

export const createGraphQLClient = (options?: {
    headers?: Record<string, string>;
}) => {
    const middleware: RequestMiddleware = async (request) => {
        return {
            ...request,
            headers: {
                ...request.headers,
                ...options?.headers,
            },
        };
    };

    return new GraphQLClient(env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, {
        requestMiddleware: middleware,
    });
};

export const graphQLClient = createGraphQLClient();

