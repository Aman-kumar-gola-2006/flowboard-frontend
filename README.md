# FlowBoard — Angular 16+ Kanban App

A production-ready Trello-like task management frontend built with Angular 16+, Tailwind CSS, and Angular CDK drag-and-drop.

---

## Tech Stack

- **Angular 16+** — standalone components, signals, `inject()`, `takeUntilDestroyed`
- **Tailwind CSS 3** — utility-first styling with glassmorphism & gradients
- **Angular CDK** — `cdkDrag` / `cdkDropList` for Kanban drag-and-drop
- **RxJS 7** — `BehaviorSubject`, `forkJoin`, `takeUntilDestroyed`

---

## Project Structure

```
src/app/
├── models/
│   ├── user.model.ts
│   ├── workspace.model.ts
│   ├── board.model.ts
│   ├── list.model.ts
│   └── card.model.ts
├── services/
│   ├── auth.service.ts
│   ├── workspace.service.ts
│   ├── board.service.ts
│   ├── list.service.ts
│   └── card.service.ts
├── guards/
│   └── auth.guard.ts
├── interceptors/
│   └── auth.interceptor.ts
├── components/
│   ├── navbar/
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── board-view/
│   └── card-detail/
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (proxies /api → http://localhost:8080)
npm start

# 3. Open browser
open http://localhost:4200
```

---

## API Endpoints Expected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login — returns `{ token, user }` |
| POST | `/api/auth/register` | Register — returns `{ token, user }` |
| GET | `/api/workspaces/user/:userId` | Get user's workspaces |
| POST | `/api/workspaces` | Create workspace |
| GET | `/api/boards/workspace/:workspaceId` | Get boards in workspace |
| POST | `/api/boards` | Create board |
| GET | `/api/lists/board/:boardId` | Get lists on board |
| POST | `/api/lists` | Create list |
| GET | `/api/cards/list/:listId` | Get cards in list |
| POST | `/api/cards` | Create card |
| PUT | `/api/cards/:cardId` | Update card |
| PUT | `/api/cards/:cardId/move` | Move card (drag-drop) |

### Auth Response Shape

```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "janesmith",
    "fullName": "Jane Smith",
    "role": "MEMBER"
  }
}
```

---

## Features

### Authentication
- Login with email or username + password
- Registration with full name, email, username, password + strength indicator
- JWT token stored in `localStorage`, auto-attached via HTTP interceptor
- Route protection via `authGuard`

### Dashboard
- Lists all user workspaces with their boards in a grid
- Create workspace modal
- Create board modal with color picker
- Loading skeletons + empty states

### Board View
- Horizontal scrolling Kanban with CDK drag-and-drop
- Cards draggable between lists — calls `PUT /api/cards/:id/move` on drop
- Add card inline (quick form per list)
- Add new list inline

### Card Detail
- Click any card to open a modal
- Inline title editing
- Description textarea (auto-saves on blur)
- Priority selector (LOW / MEDIUM / HIGH / URGENT)
- Due date picker
- Label toggle buttons
- Comments section (UI ready — wire up POST endpoint when available)

---

## Auth Interceptor

Every HTTP request automatically includes:
```
Authorization: Bearer <token>
X-User-Id: <userId>
```

---

## Customization

### Proxy target
Edit `proxy.conf.json` to change the backend URL:
```json
{ "/api": { "target": "http://your-backend:8080" } }
```

### Color gradients (boards)
Edit `GRADIENTS` array in `dashboard.component.ts`.

### Tailwind custom colors
Edit `tailwind.config.js` — `slate.750`, `slate.850`, `slate.950` are custom additions.
