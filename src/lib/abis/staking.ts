// ABI for the LM contract, this is used to get the staking data
export const LM_ABI = [
  {
    type: 'function',
    name: 'earned',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'depositTokenBalance',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'stake',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const

// ABI for the ERC20 contract, this is used to get the token balance and allowance
export const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

// ABI for the GIVpower contract, this is used to get the GIVpower balance and lock/unlock functions
export const GIVPOWER_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'lock',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'rounds', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'unlock',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'depositTokenBalance',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'userLocks',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: 'totalAmountLocked', type: 'uint256' }],
  },
] as const

// ABI for the GIVpower Unipool contract, this is used to withdraw the GIVpower
export const UNIPOOL_ABI_WITHDRAW = [
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const

// ABI for the Token Manager contract, this is used to wrap/unwrap the GIV token
export const TOKEN_MANAGER_ABI = [
  {
    type: 'function',
    name: 'wrap',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'unwrap',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const

// ABI for the GIVpower Unipool contract, this is used to get the reward
export const UNIPOOL_ABI = [
  {
    type: 'function',
    name: 'getReward',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const
