# Note Workspace — Project Documentation

A real-time collaborative note-taking application built with Next.js 16, Firebase, Liveblocks, and Clerk authentication.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | Full-stack React framework |
| **TypeScript** | Type safety across the project |
| **Tailwind CSS v4** | Utility-first styling |
| **Clerk** | Authentication (sign-in, sign-out, user sessions) |
| **Firebase / Firestore** | Database — stores documents, rooms, and users |
| **Firebase Admin SDK** | Server-side Firestore access (in Server Actions & API routes) |
| **Liveblocks** | Real-time collaboration (presence, cursors, shared Y.js document state) |
| **BlockNote** | Rich-text block editor (Notion-style) |
| **Y.js** | Conflict-free replicated data type (CRDT) for real-time text sync |
| **next-themes** | Global dark / light theme management |
| **Sonner** | Toast notifications |
| **Shadcn/UI + Radix UI** | Accessible UI primitives (dialogs, sheets, breadcrumbs, etc.) |

---

## Project Structure

```
note/
├── app/                        # Next.js App Router pages and layouts
│   ├── layout.tsx              # Root layout — wraps all pages with ClerkProvider, ThemeProvider, Header, Sidebar
│   ├── page.tsx                # Home/landing page — welcomes user, triggers document creation
│   ├── globals.css             # Global CSS — Tailwind imports, CSS variables for light/dark themes
│   ├── favicon.ico             # App icon shown in browser tabs
│   ├── auth-endpoint/
│   │   └── route.ts            # POST API route — Liveblocks session auth + upserts Clerk user into Firestore
│   └── doc/
│       ├── layout.tsx          # /doc/* layout — auth guard via Clerk + RoomProvider wrapper
│       └── [id]/
│           ├── layout.tsx      # /doc/[id] layout — sets up Liveblocks Room for the document
│           └── page.tsx        # /doc/[id] page — renders the Document component inside a room
│
├── components/                 # Reusable React components
│   ├── Header.tsx              # Top navigation bar — logo, breadcrumb, dark/light toggle, user avatar menu
│   ├── Sidebar.tsx             # Left sidebar — lists user's documents + shared documents; mobile drawer
│   ├── SidebarOption.tsx       # Individual sidebar document link — shows title, highlights active doc
│   ├── Document.tsx            # Main document view — title editing, editor, owner actions (invite/delete)
│   ├── Editor.tsx              # BlockNote rich-text editor — connected to Liveblocks Y.js provider
│   ├── NewDocumentButton.tsx   # Button that creates a new document in Firestore and navigates to it
│   ├── DeleteDocument.tsx      # Dialog to permanently delete a document from Firestore and Liveblocks
│   ├── InviteUser.tsx          # Dialog to invite a user by email to collaborate on a document
│   ├── RoomProvider.tsx        # Wraps children in a Liveblocks RoomProvider for a specific room ID
│   ├── LiveBlockProvider.tsx   # Liveblocks client context provider (wraps the whole app if needed)
│   ├── LiveCursorProvider.tsx  # Shows live cursors/follow-pointers for other users in the editor
│   ├── FollowPointer.tsx       # Renders an individual user's cursor with their name and color
│   ├── LoadingSpinner.tsx      # Generic loading spinner UI component
│   ├── ThemeProvider.tsx       # Wraps app in next-themes ThemeProvider for global dark/light mode
│   ├── breadcrumb.tsx          # Dynamic breadcrumb — fetches and shows the real document title
│   └── ui/                     # Shadcn/UI generated primitive components
│       ├── button.tsx          # Button component with variants (default, outline, destructive, ghost, etc.)
│       ├── input.tsx           # Text input component
│       ├── dialog.tsx          # Modal dialog (used by InviteUser and DeleteDocument)
│       ├── sheet.tsx           # Slide-in panel (used by Sidebar mobile drawer)
│       ├── breadcrumb.tsx      # Breadcrumb UI primitives (Root, List, Item, Link, Page, Separator)
│       └── sonner.tsx          # Toaster component — wraps Sonner with next-themes awareness
│
├── actions/
│   └── actions.ts              # Next.js Server Actions — createNewDocument, deleteDocument, inviteUserToDocument
│
├── lib/
│   ├── liveblocks.ts           # Liveblocks Node.js client instance (used server-side)
│   ├── userOwn.ts              # Custom hook — checks if the current user is the owner of the active room
│   ├── stringToColor.ts        # Utility — deterministically maps an email string to a HEX color (for cursors)
│   └── utils.ts                # Utility — cn() helper for merging Tailwind class names
│
├── types/
│   ├── types.ts                # Shared TypeScript types (e.g. Room, Document interfaces)
│   └── globles.d.ts            # Global TypeScript declarations (e.g. process.env types)
│
├── firebase.ts                 # Firebase client SDK init — exports `db` (Firestore client instance)
├── firebase-admin.ts           # Firebase Admin SDK init — exports `adminDb` (server-side Firestore)
├── liveblocks.config.ts        # Liveblocks room config — defines Presence, Storage, and UserMeta types
├── proxy.ts                    # Next.js 16 Proxy (replaces middleware) — Clerk auth protection on all routes
├── next.config.ts              # Next.js configuration — image domains, etc.
├── tsconfig.json               # TypeScript compiler configuration
├── tailwind.config / postcss   # Tailwind CSS and PostCSS configuration
└── .env.local                  # Environment secrets (NOT committed) — Clerk, Firebase, Liveblocks keys
```

---

## Key Data Flows

### Creating a Document
1. User clicks **New Document** in the sidebar or home page.
2. `createNewDocument()` Server Action (in `actions/actions.ts`) runs on the server.
3. It creates a document in Firestore under `/documents/{docId}`.
4. It creates a room entry under `/users/{userId}/rooms/{docId}` with `role: "owner"`.
5. The user is redirected to `/doc/{docId}`.

### Opening a Document
1. The `/doc/[id]/layout.tsx` calls `auth.protect()` to ensure the user is signed in.
2. `RoomProvider` connects the user to a Liveblocks room with `id = docId`.
3. The auth endpoint (`POST /auth-endpoint`) is called by Liveblocks, which:
   - Verifies the Clerk session.
   - **Upserts the user into Firestore `/users/{userId}`** (name, email, avatar).
   - Authorises the Liveblocks session with FULL_ACCESS to the room.
4. The `Editor` component creates a Y.js document synced via `LiveblocksYjsProvider`.

### Inviting a User
1. Owner clicks **Invite User** and enters an email.
2. `inviteUserToDocument()` Server Action queries `/users` collection in Firestore for that email.
3. If found, it creates `/users/{invitedUserId}/rooms/{roomId}` with `role: "editor"`.
4. The invited user's sidebar will now show the document under **Shared with Me**.
> ⚠️ The invited user must have signed in at least once (which triggers the auth endpoint upsert) before they can be found by email.

### Deleting a Document
1. Owner clicks **Delete** and confirms.
2. `deleteDocument()` Server Action:
   - Deletes the document from `/documents/{docId}`.
   - Finds and deletes all `/users/*/rooms/{docId}` entries across all users.
   - Deletes the Liveblocks room.

---

## Environment Variables (`.env.local`)

| Variable | Used In | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Client | Clerk public key |
| `CLERK_SECRET_KEY` | Server | Clerk server authentication |
| `LIVEBLOCKS_SECRET_KEY` | `auth-endpoint/route.ts`, `lib/liveblocks.ts` | Liveblocks session auth |
| Firebase config keys | `firebase.ts` | Client-side Firestore access |

> `service_key.json` — the Firebase Admin SDK private key — is loaded directly from the file system in `firebase-admin.ts` and is **never committed to git** (listed in `.gitignore`).

---

## Authentication & Route Protection

- **`proxy.ts`** (Next.js 16 Proxy, replaces `middleware.ts`) runs on every request and enforces Clerk authentication on all non-static routes.
- **`app/doc/[id]/layout.tsx`** additionally calls `auth.protect()` server-side before rendering any document page, redirecting unauthenticated users to sign in.
- **`actions/actions.ts`** server actions each call `auth()` and return an error if no session exists.
