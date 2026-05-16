# 🚀 FlowBoard Frontend — Enterprise Kanban Workspace

A high-performance, aesthetically premium project management frontend built with **Angular 17+**. FlowBoard delivers a Trello-like experience with real-time collaboration, advanced task tracking, and a sleek, modern UI.

---

## ✨ Premium Features

### 🔔 Real-Time Ecosystem
- **Instant Notifications**: Powered by **STOMP/WebSocket**. Get notified instantly when a task is assigned, a due date is updated, or an invite is received.
- **Actionable Toasts**: Click on a notification popup to navigate directly to the relevant board or workspace.
- **Push Architecture**: No manual refresh required for system alerts.

### 🛡️ Secure Authentication
- **Multi-Provider Login**: Support for standard Email/Username login and Social Logins (**Google** & **GitHub**).
- **JWT Protection**: Secure session management with automatic token attachment via HTTP Interceptors.
- **Account Safeguards**: Immediate feedback for blocked/suspended accounts.

### 📊 Powerful Kanban Boards
- **Drag-and-Drop**: Fluid card movement across lists using **Angular CDK**.
- **Deep Card Details**: Priority management (LOW to URGENT), due date tracking, labeling, and task descriptions.
- **Dynamic Workspaces**: Organize projects into workspaces with specific collaborator access.

### 👑 Admin Control Center
- **User Management**: Search, block/unblock, and upgrade users to PRO status.
- **Global Stats**: Real-time monitoring of total users, workspaces, boards, and cards across the platform.
- **Audit Logging**: Track system activity for security and monitoring.

---

## 🛠️ Tech Stack

- **Core**: Angular 17+ (Standalone Components, Signals API)
- **Styling**: Modern Vanilla CSS + Tailwind Utility Classes (Dark/Light Mode ready)
- **Real-time**: SockJS / Stomp.js for WebSocket communication
- **State & Logic**: RxJS Observables, BehaviorSubjects, and Angular Router
- **Drag-Drop**: Angular CDK Drag & Drop module

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd flowboard-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API Proxy**:
   The frontend uses a proxy for local development. Ensure `proxy.conf.json` points to your Gateway Service (default `http://localhost:8080`).

4. **Launch Application**:
   ```bash
   npm start
   ```
   Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## 📂 Project Architecture

```
src/app/
├── components/          # Reusable UI & Page components
│   ├── navbar/          # Global navigation & Notification center
│   ├── admin/           # Admin dashboard & User controls
│   ├── board-view/      # Interactive Kanban board
│   └── toast/           # Custom interactive alert system
├── services/            # Business logic & API abstraction
│   ├── auth.service.ts  # Identity & Session management
│   ├── notification.ts  # WebSocket/Stomp logic
│   └── board.service.ts # CRUD for project entities
├── models/              # TypeScript interfaces & DTOs
├── interceptors/        # Global HTTP processing (Auth headers)
└── guards/              # Route protection (Auth & Admin guards)
```

---

## 🎨 UI & UX Design
FlowBoard is architected with **"Aesthetics First"** principle:
- **Glassmorphism**: Elegant semi-transparent backgrounds with blur effects.
- **Micro-animations**: Smooth transitions for drag-drop, modal opening, and button interactions.
- **Dynamic Themes**: Seamless switching between Deep Dark and Crisp Light modes.
- **Accessibility**: Semantic HTML and descriptive ARIA roles for better screen reader support.

---

## 🔧 Customization

### Theming
Primary colors and design tokens are defined in `src/index.css`. You can modify the CSS variables to match your brand:
```css
:root {
  --accent-indigo: #6366f1;
  --bg-color: #ffffff;
  /* ... */
}
```

### Notification Icons
Icons for different notification types can be customized in `navbar.component.ts` within the `getNotificationIcon()` method.

---

## ⚖️ License
Architected with ❤️ by **Aman Kumar Gola** (2026).
Part of the FlowBoard Microservice Ecosystem.
