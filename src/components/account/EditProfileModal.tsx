import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useConfirmEmailVerification,
  useProfile,
  useRequestEmailVerification,
  useUpdateProfile,
  useUploadAvatar,
  type UserProfile,
} from '@/hooks/useAccount'

type Props = {
  open: boolean
  token?: string
  onClose: () => void
}

const fieldClass =
  'w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-3 text-sm text-[#111827] outline-none focus:border-[#8668fc] focus:ring-2 focus:ring-[#eadaff] transition-all'

const labelClass = 'block mb-1.5 text-sm font-medium text-[#374151]'

export const EditProfileModal = ({ open, token, onClose }: Props) => {
  const { data, refetch } = useProfile(token)
  const updateProfile = useUpdateProfile(token)
  const requestEmailVerification = useRequestEmailVerification(token)
  const confirmEmailVerification = useConfirmEmailVerification(token)
  const uploadAvatar = useUploadAvatar(token)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [email, setEmail] = useState('')
  const [twitterName, setTwitterName] = useState('')
  const [telegramName, setTelegramName] = useState('')

  // Email verification state
  const [verifyCode, setVerifyCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const [message, setMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const queryClient = useQueryClient()

  const profile: UserProfile | null = useMemo(() => data?.me ?? null, [data])

  useEffect(() => {
    if (!profile) return
    setFirstName(profile.firstName ?? '')
    setLastName(profile.lastName ?? '')
    setLocation(profile.location ?? '')
    setWebsite(profile.url ?? '')
    setAvatarUrl(profile.avatar ?? '')
    setEmail(profile.email ?? '')
    setTwitterName(profile.twitterName ?? '')
    setTelegramName(profile.telegramName ?? '')
  }, [profile, open])

  if (!open) return null

  const handleClose = () => {
    setMessage(null)
    setIsVerifying(false)
    setVerifyCode('')
    onClose()
  }

  const handleAvatarSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const avatarLink = await uploadAvatar.mutateAsync(file)
      setAvatarUrl(avatarLink)
      // setMessage('Avatar uploaded.') // Less intrusive, user sees the preview change
    } catch (error) {
      console.error('Avatar upload failed', error)
      setMessage('Unable to upload avatar. Please try again.')
    }
  }

  const handleDeleteAvatar = () => {
    setAvatarUrl('')
  }

  const handleSave = async () => {
    try {
      const { updateUser } = await updateProfile.mutateAsync({
        firstName,
        lastName,
        url: website,
        location,
        avatar: avatarUrl,
        twitterName,
        telegramName,
        name: `${firstName} ${lastName}`.trim() || undefined,
      })
      const mergeProfile = (prev?: { me: UserProfile | null }) =>
        prev?.me ? { me: { ...prev.me, ...updateUser } } : { me: updateUser }

      queryClient.setQueryData(['profile', token], mergeProfile)
      queryClient.setQueryData(['me', token], mergeProfile)
      await queryClient.invalidateQueries({ queryKey: ['userStats'] })
      await refetch()
      // setMessage('Profile updated')
      onClose()
    } catch (error) {
      console.error(error)
      setMessage('Failed to save changes')
    }
  }

  const handleSendCode = async () => {
    try {
      await requestEmailVerification.mutateAsync(email)
      setIsVerifying(true)
      setMessage('Verification code sent to your email.')
    } catch (error) {
      console.error(error)
      setMessage('Failed to send verification code')
    }
  }

  const handleVerifyCode = async () => {
    try {
      await confirmEmailVerification.mutateAsync({ email, verifyCode })
      setMessage('Email verified successfully!')
      setIsVerifying(false)
      setVerifyCode('')
      await refetch()
    } catch (error) {
      console.error(error)
      setMessage('Verification failed. Invalid code?')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 font-sans backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1f2333]">Edit Profile</h2>
          <button
            aria-label="Close"
            onClick={handleClose}
            className="rounded-full p-1 text-[#1f2333] hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 mb-4">
            <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <span className="text-4xl font-bold">
                    {firstName?.[0] || email?.[0] || '?'}
                  </span>
                </div>
              )}
            </div>
            {/* Hidden Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
          </div>

          <div className="flex flex-col gap-2 items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="text-[#E94886] font-semibold text-sm hover:underline disabled:opacity-50"
            >
              {uploadAvatar.isPending ? 'Uploading...' : 'Upload New Picture'}
            </button>
            {avatarUrl && (
              <button
                onClick={handleDeleteAvatar}
                className="text-[#849bfd] font-semibold text-sm hover:underline"
              >
                Delete Picture
              </button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* First Name */}
          <div>
            <label className={labelClass}>
              First name <span className="text-red-500">*</span>
            </label>
            <input
              className={fieldClass}
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Your first name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className={labelClass}>
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              className={fieldClass}
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Your last name"
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                className={`${fieldClass} pr-36`} // Extra padding for the button
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {profile?.isEmailVerified ? (
                  <div className="flex items-center gap-1 text-green-600 px-3 py-1 bg-green-50 rounded-full text-xs font-semibold">
                    <Check size={12} /> Verified
                  </div>
                ) : (
                  <button
                    onClick={handleSendCode}
                    disabled={
                      requestEmailVerification.isPending ||
                      !email ||
                      isVerifying
                    }
                    className="text-[#8668fc] border border-[#8668fc] px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#8668fc] hover:text-white transition-colors disabled:opacity-50"
                  >
                    {requestEmailVerification.isPending
                      ? 'Sending...'
                      : 'Verify Email'}
                  </button>
                )}
              </div>
            </div>

            {/* Email Verification UI */}
            {profile?.isEmailVerified ? (
              <p className="mt-2 text-xs text-[#6b7280]">
                Your email has been verified. You can now save your profile
                information.
              </p>
            ) : isVerifying ? (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                <p className="text-xs text-[#374151] mb-2">
                  Enter the code sent to your email:
                </p>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#8668fc]"
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value)}
                    placeholder="123456"
                  />
                  <Button
                    size="sm"
                    onClick={handleVerifyCode}
                    disabled={confirmEmailVerification.isPending || !verifyCode}
                    className="bg-[#8668fc] hover:bg-[#6f52e0]"
                  >
                    {confirmEmailVerification.isPending ? '...' : 'Confirm'}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {/* X/Twitter */}
          <div>
            <label className={labelClass}>X/Twitter Profile</label>
            <input
              className={fieldClass}
              value={twitterName}
              onChange={e => setTwitterName(e.target.value)}
              placeholder="Your X/Twitter username"
            />
          </div>

          {/* Telegram */}
          <div>
            <label className={labelClass}>Telegram Handle</label>
            <input
              className={fieldClass}
              value={telegramName}
              onChange={e => setTelegramName(e.target.value)}
              placeholder="Your Telegram username"
            />
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>Location (optional)</label>
            <input
              className={fieldClass}
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City, Country"
            />
          </div>

          {/* Website */}
          <div>
            <label className={labelClass}>Website or url</label>
            <input
              className={fieldClass}
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
            <p className="mt-1.5 text-xs text-[#6b7280]">
              Your homepage, blog, or company site.
            </p>
          </div>
        </div>

        {/* Global Message */}
        {message && (
          <div className="mt-6 mb-2 rounded-xl bg-[#f3f4f6] px-4 py-3 text-sm text-[#374151] text-center">
            {message}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="w-full bg-[#8668fc] hover:bg-[#6f52e0] text-white py-6 text-lg rounded-xl font-bold shadow-lg shadow-[#8668fc]/20"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save'}
          </Button>
          <button
            onClick={handleClose}
            className="w-full text-[#849bfd] font-semibold py-2 hover:bg-gray-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
