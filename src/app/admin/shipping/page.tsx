import { AdminShippingSettings } from './AdminShippingSettings'
import { AdminStoreSettings } from './AdminStoreSettings'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminStoreSettings />
      <AdminShippingSettings />
    </div>
  )
}