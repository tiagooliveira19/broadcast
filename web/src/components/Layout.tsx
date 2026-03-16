import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useAuth } from '../app/auth/hooks'
import { useHeaderAction } from '../contexts/HeaderActionContext'

type LayoutProps = {
  children?: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { headerAction } = useHeaderAction()
  const [openFlowModal, setOpenFlowModal] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      <AppBar position="static" className="header">
        <Toolbar className="flex justify-between">
          <div className="flex items-center gap-6">
            <Box
              component="button"
              type="button"
              onClick={() => navigate('/conexoes')}
              className="flex items-center border-0 bg-transparent cursor-pointer p-0"
              aria-label="Broadcast - início"
            >
              <img src="/favicon.svg" alt="Broadcast" title="Broadcast" className="h-11 w-11" />
            </Box>
            {headerAction && (
              <Typography
                component="span"
                variant="body1"
                className={headerAction.className}
                sx={{ cursor: 'pointer', opacity: 0.95, ...(headerAction.sx ?? {}) }}
                onClick={headerAction.onClick}
              >
                {headerAction.label}
              </Typography>
            )}
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              color="inherit"
              onClick={() => setOpenFlowModal(true)}
              aria-label="Como funciona o sistema"
              title="Como funciona"
              size="small"
            >
              <InfoOutlinedIcon />
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <main className="p-4 m-25">{children ?? <Outlet />}</main>

      <Dialog open={openFlowModal} onClose={() => setOpenFlowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Como funciona o Broadcast</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph sx={{ mt: 0 }}>
            O Broadcast permite organizar envios de mensagens por <strong>conexões</strong> e
            <strong> contatos</strong>. Cada usuário tem sua própria área: seus dados ficam
            separados e as listas são atualizadas em tempo real.
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            1. Conexões
          </Typography>
          <Typography variant="body2" paragraph>
            São os “grupos” que você cria (ex.: Campanha X, Lista Y). Em cada conexão você gerencia
            os contatos e as mensagens dessa campanha.
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            2. Contatos
          </Typography>
          <Typography variant="body2" paragraph>
            Dentro de cada conexão você cadastra nome e telefone dos contatos. O sistema aplica
            máscara no telefone (ex.: (11) 98765-4321).
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            3. Mensagens
          </Typography>
          <Typography variant="body2" paragraph>
            Para cada conexão você pode criar mensagens, escolher quais contatos recebem, e
            decidir entre: <strong>salvar como rascunho</strong>, <strong>enviar na hora</strong> ou
            <strong> agendar</strong> data e hora. As mensagens agendadas passam automaticamente
            para “enviada” no horário definido. As listas (conexões, contatos e mensagens) atualizam
            sozinhas, em tempo real.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Resumo: Conexões → Contatos → Mensagens (rascunho, envio imediato ou agendado), com
            tudo sincronizado em tempo real.
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  )
}
