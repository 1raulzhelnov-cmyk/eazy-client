import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from './auth/guard'
import { Shell } from './layout/Shell'
import DashboardPage from './pages/dashboard'
import UsersListPage from './pages/users'
import SuppliersListPage from './pages/suppliers'
import SupplierDetailPage from './pages/suppliers/detail'
import OrdersListPage from './pages/orders'
import OrderDetailPage from './pages/orders/detail'
import DeliveryListPage from './pages/delivery'
import AccessDeniedPage from './pages/denied'
import NotFoundPage from './pages/_404'
import FinancePage from './pages/finance'
import ContentPage from './pages/content'
import DisputesPage from './pages/disputes'
import CampaignsPage from './pages/campaigns'
import SettingsPage from './pages/settings'
import ReportsPage from './pages/reports'
import CommsPage from './pages/comms'
import SupportPage from './pages/support'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthGuard>
        <Shell />
      </AuthGuard>
    ),
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersListPage /> },
      { path: 'suppliers', element: <SuppliersListPage /> },
      { path: 'suppliers/:sid', element: <SupplierDetailPage /> },
      { path: 'orders', element: <OrdersListPage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
      { path: 'delivery', element: <DeliveryListPage /> },

      // Non-MVP placeholders
      { path: 'finance', element: <FinancePage /> },
      { path: 'content', element: <ContentPage /> },
      { path: 'disputes', element: <DisputesPage /> },
      { path: 'campaigns', element: <CampaignsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'comms', element: <CommsPage /> },
      { path: 'support', element: <SupportPage /> },
    ],
  },
  { path: '/denied', element: <AccessDeniedPage /> },
  { path: '*', element: <NotFoundPage /> },
])
