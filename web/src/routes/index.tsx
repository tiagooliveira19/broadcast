import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../app/auth/hooks'
import { LoginPage } from '../app/auth/LoginPage'
import { RegisterPage } from '../app/auth/RegisterPage'
import { ConnectionsPage } from '../app/connection/ConnectionsPage'
import { ContactsPage } from '../app/contact/ContactsPage'
import { MessagesPage } from '../app/message/MessagesPage'
import { Layout } from '../components/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />
      <Route
        path="/conexoes"
        element={
          <ProtectedRoute>
            <Layout>
              <ConnectionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/conexoes/:connectionId/contatos"
        element={
          <ProtectedRoute>
            <Layout>
              <ContactsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/conexoes/:connectionId/mensagens"
        element={
          <ProtectedRoute>
            <Layout>
              <MessagesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/conexoes" replace />} />
      <Route path="*" element={<Navigate to="/conexoes" replace />} />
    </Routes>
  )
}
