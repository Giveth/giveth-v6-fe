import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
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
  'w-full rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#d81a72] focus:ring-2 focus:ring-[#fbcfe8]'

export const EditProfileModal = ({ open, token, onClose }: Props) => {
  const { data, isLoading, refetch } = useProfile(token)
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
  const [verifyCode, setVerifyCode] = useState('')
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
      setMessage('Avatar uploaded. Save changes to update your profile.')
    } catch (error) {
      console.error('Avatar upload failed', error)
      setMessage('Unable to upload avatar. Please try again.')
    }
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
      setMessage('Profile updated')
      onClose()
    } catch (error) {
      console.error(error)
      setMessage('Failed to save changes')
    }
  }

  const handleSendCode = async () => {
    try {
      await requestEmailVerification.mutateAsync(email)
      setMessage('Verification code sent.')
      await refetch()
    } catch (error) {
      console.error(error)
      setMessage('Failed to send verification code')
    }
  }

  const handleVerifyCode = async () => {
    try {
      await confirmEmailVerification.mutateAsync({ email, verifyCode })
      setMessage('Email verified')
      setVerifyCode('')
      await refetch()
    } catch (error) {
      console.error(error)
      setMessage('Verification failed')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Edit profile</h2>
            <p className="text-sm text-[#6b7280]">
              Update your public information and email verification.
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={handleClose}
            className="rounded-full p-2 text-[#6b7280] hover:bg-[#f3f4f6]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-[#374151]">
            First name
            <input
              className={fieldClass}
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              disabled={isLoading || updateProfile.isPending}
            />
          </label>
          <label className="space-y-1 text-sm text-[#374151]">
            Last name
            <input
              className={fieldClass}
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              disabled={isLoading || updateProfile.isPending}
            />
          </label>
          <label className="space-y-1 text-sm text-[#374151]">
            Location
            <input
              className={fieldClass}
              value={location}
              onChange={e => setLocation(e.target.value)}
              disabled={isLoading || updateProfile.isPending}
              placeholder="City, Country"
            />
          </label>
          <label className="space-y-1 text-sm text-[#374151]">
            Website
            <input
              className={fieldClass}
              value={website}
              onChange={e => setWebsite(e.target.value)}
              disabled={isLoading || updateProfile.isPending}
              placeholder="https://"
            />
          </label>
          <label className="space-y-1 text-sm text-[#374151]">
            X / Twitter profile
            <input
              className={fieldClass}
              value={twitterName}
              onChange={e => setTwitterName(e.target.value)}
              disabled={isLoading || updateProfile.isPending}
              placeholder="@username or https://twitter.com/username"
            />
          </label>
          <label className="space-y-1 text-sm text-[#374151]">
            Telegram handle
            <input
              className={fieldClass}
              value={telegramName}
              onChange={e => setTelegramName(e.target.value)}
              disabled={isLoading || updateProfile.isPending}
              placeholder="@username"
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[160px_1fr]">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-[#f3f4f6]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm text-[#9ca3af]">No avatar</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelect}
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
            >
              {uploadAvatar.isPending ? 'Uploading...' : 'Upload avatar'}
            </Button>
          </div>

          <div className="space-y-3 rounded-xl border border-[#e5e7eb] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#111827]">Email</p>
                <p className="text-xs text-[#6b7280]">
                  {profile?.isEmailVerified
                    ? 'Email verified'
                    : 'Email not verified'}
                </p>
              </div>
              {profile?.isEmailVerified ? (
                <span className="rounded-full bg-[#d1fae5] px-3 py-1 text-xs font-semibold text-[#065f46]">
                  Verified
                </span>
              ) : (
                <span className="rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-semibold text-[#92400e]">
                  Not verified
                </span>
              )}
            </div>
            <label className="space-y-1 text-sm text-[#374151]">
              Email address
              <input
                className={fieldClass}
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={requestEmailVerification.isPending}
              />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                onClick={handleSendCode}
                disabled={requestEmailVerification.isPending || !email}
              >
                {requestEmailVerification.isPending
                  ? 'Sending...'
                  : 'Send verification code'}
              </Button>
              <div className="flex flex-1 items-center gap-2">
                <input
                  className={fieldClass}
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value)}
                  placeholder="Enter code"
                  disabled={confirmEmailVerification.isPending}
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={
                    confirmEmailVerification.isPending || !verifyCode || !email
                  }
                >
                  {confirmEmailVerification.isPending
                    ? 'Verifying...'
                    : 'Verify'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-3 rounded-lg bg-[#f3f4f6] px-3 py-2 text-sm text-[#374151]">
            {message}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
