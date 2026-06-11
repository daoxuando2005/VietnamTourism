import { Button, Card, PageHeader } from '@/components'

export function EditProfilePage() {
  return (
    <div>
      <PageHeader title="Edit Profile" description="Update your public profile information." />
      <Card padding="lg">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <Button type="submit">Save changes</Button>
        </form>
      </Card>
    </div>
  )
}
