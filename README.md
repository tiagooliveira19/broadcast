# Broadcast (SaaS)

Projeto com React (Vite + TypeScript), Firebase (Auth, Firestore, Functions), Material UI e Tailwind.

## Estrutura

- **web/** – Frontend (Vite + React + TypeScript)
- **functions/** – Firebase Cloud Functions (agendamento de mensagens)

## Configuração

### 1. Firebase

- Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
- Ative **Authentication** (E-mail/Senha) e **Firestore**
- Registre um app Web e copie o `firebaseConfig`

### 2. Variáveis de ambiente (web)

Na pasta `web`, crie `.env.local` (não commitar) com:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Use como referência o arquivo `web/.env.example`.

### 3. Vincular projeto Firebase (CLI)

Na raiz do repositório:

```bash
npm install -g firebase-tools
firebase login
firebase use <seu-project-id>
```

### 4. Deploy das regras e índices do Firestore

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 5. Deploy das Functions (agendamento de mensagens)

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

O plano Blaze é necessário para funções agendadas.

## Desenvolvimento

### Frontend

```bash
cd web
npm install
npm run dev
```

### Build

```bash
cd web
npm run build
```

## Funcionamento do sistema (fluxo)

### Multi-tenant (SaaS)

- Cada usuário (Firebase Auth) é um **cliente**: só enxerga e altera os próprios dados.
- **Conexões**, **contatos** e **mensagens** são filtrados por `clientId` (UID do usuário). Um cliente não acessa dados de outro.

### Fluxo do usuário

1. **Login / Cadastro**  
   - Tela de entrada ou cadastro (e-mail/senha). Após sucesso, o usuário é redirecionado para a lista de conexões.

2. **Conexões**  
   - Lista em tempo real das conexões do usuário (apenas nome).  
   - **Criar**, **editar** e **excluir** conexão. Ao excluir, contatos e mensagens dessa conexão são apagados em cascata.  
   - A partir da lista, o usuário acessa **Contatos** ou **Mensagens** daquela conexão.

3. **Contatos**  
   - Por conexão: lista em tempo real de contatos (nome + telefone com máscara).  
   - CRUD completo. O telefone é formatado como (00) 00000-0000.

4. **Mensagens**  
   - Por conexão: criar mensagem escolhendo contatos (multiselect), texto e uma das ações:
     - **Salvar rascunho** – status `rascunho`; pode editar depois.
     - **Enviar (fake)** – status `enviada`; não dispara envio real.
     - **Agendar** – define data/hora; status `agendada`.
   - Lista em tempo real com abas: **Todas**, **Enviadas**, **Agendadas**, **Rascunhos**.  
   - Mensagens agendadas cuja data/hora já passou viram **enviadas**:
     - Se as **Cloud Functions** estiverem no ar (plano Blaze), uma função agendada (a cada minuto) atualiza no Firestore.
     - Caso contrário, ao **abrir a tela de mensagens** o próprio frontend marca como enviadas as agendadas vencidas.

### Tempo real

- Listas de conexões, contatos e mensagens usam `onSnapshot` do Firestore: qualquer alteração (própria ou de outra aba/dispositivo) aparece na hora, sem recarregar a página.

### Dados no Firestore (sem subcoleções)

- **connections**: `clientId`, `name`, `createdAt`
- **contacts**: `clientId`, `connectionId`, `name`, `phone`, `createdAt`
- **messages**: `clientId`, `connectionId`, `contactIds[]`, `body`, `status` (draft | scheduled | sent), `scheduledAt`, `sentAt`, `createdAt`

---

## Funcionalidades (resumo)

- Login e cadastro (Firebase Auth)
- Conexões: CRUD, tempo real (Firestore)
- Contatos por conexão: CRUD, tempo real, máscara de telefone
- Mensagens: rascunho, enviar (fake), agendar; filtros por status; tempo real
- Mensagens agendadas vencidas viram “enviadas” (Cloud Function ou ao abrir a tela de mensagens)
