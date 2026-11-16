import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/features/auth/LoginPage'
import { SignupPage } from '@/features/auth/SignupPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { PaymentsPage } from '@/features/payments/PaymentsPage'
import { SubscriptionsPage } from '@/features/subscriptions/SubscriptionsPage'
import { InvoicesPage } from '@/features/invoices/InvoicesPage'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'
import { SettingsLayout } from '@/features/settings/SettingsLayout'
import { ProfileSettingsPage } from '@/features/settings/ProfileSettingsPage'
import { IntegrationsSettingsPage } from '@/features/settings/IntegrationsSettingsPage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfileSettingsPage />} />
              <Route path="integrations" element={<IntegrationsSettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
