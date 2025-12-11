# Real-Time Chat Application Design Guidelines

## Design Approach
**System:** Material Design with inspiration from Slack and Discord's proven chat patterns
**Rationale:** Chat applications demand familiar, efficient interfaces where users can focus on conversations. We'll use established patterns that users already understand while ensuring the interface feels modern and polished.

## Core Layout Structure

### Main Application Layout
Three-column layout for desktop:
- Left sidebar (280px): Room/conversation list with search
- Middle panel (flexible): Active conversation with message thread
- Right sidebar (320px, collapsible): User list, thread details, or shared files

Mobile: Stack layout with bottom navigation for switching between rooms, active chat, and user profile.

### Sidebar Navigation
- Workspace/app title at top with user profile dropdown
- Search bar for finding rooms/users
- Scrollable list of:
  - Direct messages (with online status indicators)
  - Public chat rooms (with unread badges)
  - Starred/pinned conversations
- "New conversation" and "Create room" action buttons

### Chat Message Area
- Fixed header: Room/conversation name, participant count, search icon, settings icon
- Scrollable message thread (grows from bottom)
- Fixed footer: Message input with send button, emoji picker, file attachment icons

## Typography System

**Font Families:**
- Primary: Inter (via Google Fonts) for UI and messages
- Monospace: JetBrains Mono for code snippets shared in chat

**Hierarchy:**
- Room/conversation titles: text-lg font-semibold
- Message sender names: text-sm font-medium
- Message content: text-base font-normal
- Timestamps: text-xs text-gray-500
- System messages: text-sm italic

## Spacing System
Use Tailwind units: **2, 3, 4, 6, 8** for consistent rhythm
- Message bubbles: p-3 with mb-2 between messages
- Sidebar padding: p-4
- Section gaps: space-y-6
- Input areas: p-4

## Component Library

### Message Bubbles
- Own messages: Aligned right with distinct styling
- Others' messages: Aligned left with avatar (32px rounded-full)
- Group consecutive messages from same user (show avatar only on first)
- Include sender name, message text, timestamp (text-xs)
- Support for reactions (emoji reactions below message)

### User Presence Indicators
- 10px circle badge on avatar: green (online), gray (offline), yellow (away)
- Position: bottom-right corner of avatar with white border

### Chat Rooms List Items
- Room icon or # symbol (20px)
- Room name (truncate with ellipsis)
- Unread count badge (rounded-full px-2 py-1)
- Last message preview (text-sm, truncated)

### Input Components
**Message Composer:**
- Multi-line textarea with auto-expand (max-h-32)
- Rounded container with border
- Toolbar row above input: formatting options (bold, italic, code), emoji, attach file
- Send button: Icon-only circle button, positioned bottom-right of input area

**Search Bar:**
- Full-width input with search icon prefix
- Placeholder: "Search messages, rooms, or people"
- Dropdown results panel on focus

### User List (Right Sidebar)
- Section headers: "ONLINE — 12" and "OFFLINE — 5"
- Each user: avatar (32px), name, optional status message
- Hover state reveals quick action (message, call icons)

### Typing Indicators
Show "Username is typing..." with animated dots at bottom of message thread when users are composing

### Modals
- Create Room: Modal with form (room name, privacy settings, description)
- User Profile: Overlay showing full profile, shared files, mutual rooms
- Image/File Preview: Full-screen modal with close button

## Navigation Patterns
- Click room/conversation to open in main panel
- Right-click context menus for quick actions (mute, leave, pin)
- Keyboard shortcuts: Cmd/Ctrl+K for quick search, Esc to close modals
- Infinite scroll for message history (load more on scroll up)

## Notification & Status System
- Unread badges: Rounded pill with count, positioned on room list items
- Desktop notifications: Toast messages for new messages when app not focused
- Sound notifications: Brief, non-intrusive chime (library: Howler.js)

## Responsive Behavior
**Desktop (lg:):** Full three-column layout
**Tablet (md:):** Two columns (hide right sidebar by default, toggle via icon)
**Mobile:** Single column with tab navigation at bottom (Rooms | Active Chat | Profile)

## Loading & Empty States
- Skeleton loaders for message history and room lists
- Empty chat: Centered message "No messages yet. Start the conversation!"
- No rooms joined: Illustration with "Join or create a room to get started"

## Icons
**Library:** Heroicons (via CDN)
**Usage:**
- Navigation: home, chat-bubble, user-group, cog icons
- Actions: paper-airplane (send), paper-clip (attach), emoji-happy
- Status: check-circle, exclamation-circle
- Interface: x-mark, chevron-down, magnifying-glass

## Accessibility
- ARIA labels on all icon buttons
- Focus visible states on all interactive elements
- Message thread marked as role="log" with aria-live="polite"
- Keyboard navigation for room switching (Tab, Arrow keys)
- High contrast mode support

## Performance Considerations
- Virtual scrolling for long message lists (use library like react-window)
- Lazy load images and file attachments
- Debounce typing indicators (send after 500ms pause)
- Message pagination: Load 50 messages at a time

This design creates a professional, efficient chat experience that prioritizes usability and real-time communication while maintaining a polished, modern aesthetic.