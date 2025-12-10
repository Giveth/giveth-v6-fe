import { GraphQLClient } from 'graphql-request'
import { SiweMessage } from 'siwe'
import { verifySiweTokenMutation } from '@/lib/graphql/mutations'
import { meQuery } from '@/lib/graphql/queries'

interface SiweAuthResponse {
  jwt: string
  expiration: number
  publicAddress: string
}

interface CoreAuthResponse {
  verifySiweToken: {
    success: boolean
    token?: string
    user?: {
      id: number
      email?: string
      name?: string
      avatar?: string
      primaryWallet?: string
    }
    error?: string
  }
}

interface User {
  id: number
  email?: string
  name?: string
  avatar?: string
  wallets?: Array<{
    address: string
    isPrimary: boolean
    chainType: string
  }>
}

export class SiweService {
  private siweAuthServiceUrl: string
  private coreServiceUrl: string
  private graphqlClient: GraphQLClient

  constructor() {
    this.siweAuthServiceUrl =
      process.env.NEXT_PUBLIC_SIWE_AUTH_SERVICE_URL || 'https://auth.giveth.io'
    this.coreServiceUrl =
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
      'http://localhost:4000/graphql'
    this.graphqlClient = new GraphQLClient(this.coreServiceUrl)
  }

  async getNonce(): Promise<string> {
    try {
      const response = await fetch(`${this.siweAuthServiceUrl}/v1/nonce`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error('Failed to get nonce')
      }

      return data.message
    } catch (error) {
      console.error('Error getting nonce:', error)
      throw error
    }
  }

  createSiweMessage(
    address: string,
    nonce: string,
    chainId: number = 1,
    domain: string = window.location.host,
    uri: string = window.location.origin,
  ): SiweMessage {
    return new SiweMessage({
      domain,
      address,
      statement: 'Sign in with Ethereum to Giveth',
      uri,
      version: '1',
      chainId,
      nonce,
    })
  }

  async authenticateWithSiwe(
    message: SiweMessage,
    signature: string,
    nonce: string,
  ): Promise<SiweAuthResponse> {
    try {
      const response = await fetch(
        `${this.siweAuthServiceUrl}/v1/authentication`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message.toMessage(),
            signature,
            nonce,
          }),
        },
      )

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`SIWE authentication failed: ${error}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error authenticating with SIWE:', error)
      throw error
    }
  }

  async verifyTokenWithCore(jwt: string): Promise<CoreAuthResponse> {
    try {
      const result = await this.graphqlClient.request<CoreAuthResponse>(
        verifySiweTokenMutation,
        { jwt },
      )

      return result
    } catch (error) {
      console.error('Error verifying token with core:', error)
      throw error
    }
  }

  async validateToken(
    token: string,
  ): Promise<{ valid: boolean; user?: User; error?: string }> {
    try {
      const client = new GraphQLClient(this.coreServiceUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const response = await client.request<{ me: User }>(meQuery)

      if (response.me) {
        // Find primary wallet from user's wallets
        const primaryWallet = response.me.wallets?.find(
          w => w.isPrimary,
        )?.address
        const user = {
          id: response.me.id,
          email: response.me.email,
          name: response.me.name,
          avatar: response.me.avatar,
          primaryWallet,
        }

        return { valid: true, user }
      } else {
        return { valid: false, error: 'No user found' }
      }
    } catch (error) {
      console.error('Error validating token:', error)
      return { valid: false, error: 'Invalid token' }
    }
  }

  async signInWithEthereum(
    address: string,
    signMessage: (message: string) => Promise<string>,
  ): Promise<CoreAuthResponse> {
    try {
      // Step 1: Get nonce from SIWE auth service
      const nonce = await this.getNonce()

      // Step 2: Create SIWE message
      const siweMessage = this.createSiweMessage(address, nonce)

      // Step 3: Get user's signature
      const signature = await signMessage(siweMessage.toMessage())

      // Step 4: Authenticate with SIWE auth service to get JWT
      const siweResponse = await this.authenticateWithSiwe(
        siweMessage,
        signature,
        nonce,
      )

      // Step 5: Verify JWT with core service and get core token
      const coreResponse = await this.verifyTokenWithCore(siweResponse.jwt)

      if (!coreResponse.verifySiweToken.success) {
        throw new Error(
          coreResponse.verifySiweToken.error || 'Core verification failed',
        )
      }

      return coreResponse
    } catch (error) {
      console.error('Error in SIWE sign-in flow:', error)
      throw error
    }
  }
}
