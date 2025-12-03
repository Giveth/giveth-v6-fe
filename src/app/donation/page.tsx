'use client'

import Link from 'next/link'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useCart } from '@/context/CartContext'

export default function DonationPage() {
  const { cartItems, removeFromCart } = useCart()

  return (
    <main className="min-h-screen bg-[#fcfcff] p-4 sm:p-8">
      {/* Back Button */}
      <div className="mx-auto mb-8 max-w-6xl">
        <Link
          href="/"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 8H1M1 8L8 1M1 8L8 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <span className="ml-4 text-sm font-medium text-gray-500">
          Donation cart
        </span>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2">
          <h1 className="mb-6 text-lg font-bold text-gray-900">
            Amount to donate
          </h1>

          {/* Global Apply */}
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#fd67ac] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">
                Apply to all projects in cart
              </span>
            </div>
            <p className="mb-4 text-xs text-gray-500">
              Same amount will be donated to all projects in your cart
            </p>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              <span>👋</span>
              Donate $30 to be eligible for GIVbacks on all projects in your
              cart
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-1 items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
                    $
                  </div>
                  <span className="font-bold text-gray-900">USDc</span>
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  defaultValue="0"
                  className="w-20 text-right font-bold text-gray-900 outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 8H12M12 8L9 5M12 8L9 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8H4M4 8L7 11M4 8L7 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium">
                  $ 70.00
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Available: 7,200 USDc ⓘ
            </div>
          </div>

          {/* Donate to Giveth */}
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#fd67ac] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  Donate to Giveth{' '}
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                    ?
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-[10px]">
                    $
                  </div>
                  <span className="text-sm font-bold text-gray-900">USDc</span>
                  <span className="ml-2 font-bold text-gray-900">0</span>
                </div>
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                  $ 0.00
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Optional: Donate to Giveth community to keep it growing
            </p>
          </div>

          {/* Projects List */}
          <div className="mb-4 rounded-t-xl bg-gray-100 px-6 py-3 text-sm font-bold text-gray-700">
            Super duper round
          </div>

          <div className="flex flex-col gap-4">
            {cartItems.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-500">
                Your cart is empty.
              </div>
            ) : (
              cartItems.map(item => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <h3 className="font-bold text-gray-900">{item.title}</h3>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Cross2Icon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#37b4a9] text-[#37b4a9]">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
                      <span>👋</span>
                      Donate $5 to be eligible for GIVbacks
                    </div>
                    <div className="ml-auto flex items-center gap-1 rounded-md bg-[#E0F8F6] px-2 py-1 text-xs font-bold text-[#37b4a9]">
                      <span className="text-[10px]">⚡</span> 0 USDc
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-1 items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
                          $
                        </div>
                        <span className="font-bold text-gray-900">USDc</span>
                      </div>
                      <input
                        type="text"
                        defaultValue="0"
                        className="w-20 text-right font-bold text-gray-900 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 8H12M12 8L9 5M12 8L9 11"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 8H4M4 8L7 11M4 8L7 5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium">
                        $ 0.00
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex items-center justify-end gap-4 rounded-2xl bg-gray-50 p-4 text-sm font-bold text-gray-600">
            <span>
              Total match <span className="text-[#37b4a9]">⚡ $0.00</span>
            </span>
            <span>Total donation $0.00</span>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">
              Summary of donations
            </h2>

            <div className="mb-6">
              <p className="mb-2 text-xs font-medium text-gray-500">
                Donating to Super duper round
              </p>
              {cartItems.map(item => (
                <div
                  key={item.id}
                  className="mb-2 flex justify-between text-sm"
                >
                  <span className="truncate pr-4 text-gray-900">
                    {item.title}
                  </span>
                  <span className="whitespace-nowrap text-gray-500">
                    0 USDc
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-6 border-t border-gray-100 pt-4">
              <div className="flex justify-between bg-gray-100 p-3 rounded-lg font-bold text-gray-900">
                <span>Your total donation</span>
                <span>0 USDc</span>
              </div>
            </div>

            <button className="mb-6 w-full rounded-xl border border-[#d81a72] bg-white py-3 text-sm font-bold text-[#d81a72] hover:bg-pink-50">
              Enter Amount First
            </button>

            <div className="flex items-start gap-3">
              <label className="relative mt-0.5 inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#fd67ac] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Make my donation anonymous
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  By checking this, we won't consider your profile information
                  as a donor for this donation and won't show it on public
                  pages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
