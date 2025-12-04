# Mini Notion App

---

# 1. 🔐 **Authentication & User System**

### **Core**

* Sign up with email + password (handled by Supabase Auth)
* Login with email + password
* Automatic session refresh
* Logout
* Protect backend API routes using JWT middleware
* Attach `req.user` to backend requests

### **User Data**

* Store username
* Store account settings (theme, profile data, etc.)

---

# 2. 🧭 **Workspaces**

Even in a minimal version, Notion has the concept of workspaces.

### **Basic Workspace Features**

* Each user has a default workspace
* A workspace contains pages
* User can switch between workspaces (optional for later)

### **Workspace Metadata**

* Name
* Created date
* Owner

*(For Mini-Notion, multi-user workspace membership can be skipped until later.)*

---

# 3. 📄 **Pages**

A page is the main document in Notion.

### **Page Core Features**

* Create a new page
* Rename a page
* Delete a page
* Duplicate a page (optional)
* Favorite/star a page
* List all pages belonging to the current workspace

### **Page Organization**

* Pages can be nested under other pages (optional)
* Sidebar tree-style navigation
* Recent pages list (optional)

### **Page Content**

A page contains **blocks** — you don’t store raw text on the page itself.

---

# 4. 🧱 **Blocks**

Blocks are the heart of Notion.
Your Mini-Notion needs a simplified block system.

### **Block Types**

Include at least:

* Paragraph
* Heading 1 / Heading 2 / Heading 3
* To-do item with checkbox
* Bulleted list item
* Numbered list item
* Quote
* Divider
* Toggle block
* Code block
* Image block (optional)

You can add more later, but these give you full Notion-like behavior.

---

# 5. ✏️ **Block Editing**

### **Essential Block Actions**

* Add a new block
* Update the block content
* Delete a block
* Move blocks up/down
* Change block type (e.g., paragraph → heading)
* Duplicate a block
* Nest a block inside another block
* Un-nest a block out of a parent

### **Block Structure**

Each block has:

* `id`
* `page_id`
* `parent_block_id`
* `order`
* `type`
* `content`
* `created_at`
* `updated_at`

---

# 6. 🔗 **Nested Blocks (Tree Structure)**

Blocks can be inside other blocks.

Your system needs to support:

* Parent-child relationships
* Arbitrarily deep nesting
* Correct ordering among siblings
* Expanding/collapsing nested blocks

---

# 7. 🖥️ **Rich Text Formatting**

A full Notion parser is complex, so Mini-Notion can use a simpler approach:

### **Inline Formatting**

* Bold
* Italic
* Underline
* Strikethrough
* Inline code

### **Supporting Data Structure**

You can store inline formatting as:

* Markdown
* HTML
* A mini rich-text AST (more advanced)

Markdown is easiest.

---

# 8. 📁 File & Image Support (Optional but nice)

* Upload an image to Supabase Storage
* Insert image block
* Delete image block

---

# 9. ⌨️ Keyboard Navigation (Frontend)

To behave like Notion:

* `Enter` creates a new block
* `Backspace` on an empty block deletes it
* Tab / Shift+Tab handles nesting
* Arrow keys move between blocks

---

# 10. ⚡ Real-time Sync (Optional)

Later you can add:

* Real-time editing using Supabase Realtime or websockets
* Live cursors
* Multi-user collaboration

Not needed in v1 but good for long-term goals.

---

# 11. 🔎 Search (Optional but useful)

* Search pages by title or block content
* Global search bar
* Filter pages by updated date

---

# 12. 🌙 Themes & Preferences

Simple preferences:

* Light/dark theme
* Font size
* Editor width

---

# 13. 🔄 Page History / Versioning (Optional)

Notion supports version history.
Mini-Notion can do a simpler version:

* Track last 5 versions of page content
* Restore a previous version

---

# 14. 🗄️ Backend API Endpoints (Summary)

### **/Auth (Supabase handles this)**

### **/pages**

* POST `/pages` → create
* GET `/pages` → list
* GET `/pages/:id` → get page
* PATCH `/pages/:id` → rename / update
* DELETE `/pages/:id`

### **/blocks**

* POST `/blocks` → create block
* PATCH `/blocks/:id` → update content / type / order / parent
* DELETE `/blocks/:id`
* POST `/blocks/move` → reorder blocks
* POST `/blocks/nest` → set parent
* POST `/blocks/unnest` → remove parent

---

# 🎯 Minimal Viable Product (MVP)

To launch a simple Mini-Notion, you only need:

### **✔ Auth**

Login + JWT verification

### **✔ Pages**

Create, rename, list, delete

### **✔ Blocks**

Paragraph blocks
Add, edit, delete, reorder
(You don't even need nesting at MVP stage)

### **✔ Rich Text**

Markdown or simple formatting

### **✔ Database**

Supabase + Drizzle

Once MVP works, you expand block types, nesting, etc.

---

# 🧩 Final Summary

A Mini-Notion app should include:

1. Auth system
2. Workspaces
3. Pages
4. Blocks
5. Block editing (CRUD)
6. Nested blocks
7. Rich text support
8. Image support (optional)
9. Keyboard-driven UX
10. Real-time sync (optional)
11. Search (optional)
12. Themes
13. Version history (optional)
14. Full backend API

