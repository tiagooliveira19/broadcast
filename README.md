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

## Funcionalidades

- Login e cadastro (Firebase Auth)
- Conexões: CRUD, tempo real (Firestore)
- Contatos por conexão: CRUD, tempo real
- Mensagens: criar, enviar (fake), agendar; filtros (todas / enviadas / agendadas); tempo real
- Cloud Function roda a cada minuto e marca mensagens agendadas como enviadas quando `scheduledAt` passa
