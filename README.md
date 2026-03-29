# 🍓 Teleprompter web app
A browser-based teleprompter that records video + audio while you read your script. Built with React, Tailwind CSS, and the MediaRecorder API.

> **Inspiration**: After recording numerous videos for university classes where I read off a script, I wanted a tool that combines a teleprompter with recording—just like news stations use. So I built one.

🥭 **Live Demo**: [https://teleprompter-ivory.vercel.app](https://teleprompter-ivory.vercel.app/)


## 🍉 Technologies

| Category | Tools |
|----------|-------|
| Frontend | `React`, `Vite`, `Tailwind CSS` |
| Media APIs | `MediaRecorder`, `Canvas API`, `getUserMedia` |
| Deployment | `Vercel` |

## 🫐 Features
- **Editable Script**: Click and type directly on the screen; text is center-aligned for easy reading
- **Client-Side Recording**: Records video + audio directly in the browser—no server required
- **Mirrored Preview**: Video preview is flipped horizontally so it feels natural (like a mirror)
- **Full Customization**:
  - Adjust font size (32px – 128px)
  - Change background and text colors with live preview
  - Control scroll speed (pixels per second)
- **Format Selection**: Choose WebM codec (VP9/VP8) based on browser support
- **Draggable Preview**: Move the picture-in-picture video window anywhere on screen
- **One-Click Download**: Save recordings instantly as `.webm` files
- **Privacy-First**: All processing happens locally; your video never leaves your device


## 🥝 The Process
### 1. Planning
- Defined core features: scrolling text, recording, customization
- Researched browser media APIs (`MediaRecorder`, `Canvas`)
- Decided on a **client-side only** architecture for privacy and simplicity

### 2. Development
- Set up React + Vite + Tailwind CSS for fast iteration
- Built a custom `useVideoRecorder` hook to encapsulate media logic
- Implemented time-based scrolling (`pixels per second`) for smooth, frame-rate-independent animation
- Used Canvas API to mirror video frames during recording (CSS transforms don't affect recorded output)

### 3. Polish
- Added glassmorphism UI with responsive, compact controls
- Implemented draggable preview window with touch + mouse support
- Added visual feedback (recording indicator, hover states)

### 4. Deployment
- Deployed to Vercel for automatic HTTPS and global CDN
- Configured environment for camera/mic permissions (requires HTTPS)

## 🍒 What I learned
- **Media APIs**: Deepened my understanding of `MediaRecorder`, `getUserMedia`, and `Canvas.captureStream()`  
- **Performance Optimization**: Learned to use `requestAnimationFrame` + `useRef` for smooth, jank-free animations  
- **State Management**: Balanced local state, refs, and callbacks to avoid re-render loops during drag/scroll  
- **Browser Compatibility**: Handled MIME type support detection and fallbacks for cross-browser recording  
- **UX Details**: Small touches (fade masks, center guide line, draggable preview) make a big difference in usability  
- **Deployment**: First experience deploying a media-heavy app with camera permissions to production

## 🍇 How can it be improved?
- MP4 Export
- Script import/export
- Word count / Time estimate
- Keyboard shortcuts
- Mobile optimizations
- Add optional cloud save

## 🍊 Running the project locally
```bash
# 1. Clone the repo
git clone https://github.com/stephkmn/teleprompter.git
cd teleprompter

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Open your browser
# → http://localhost:5173
```

## 📷 Screenshot
<img width="471" height="275" alt="image" src="https://github.com/user-attachments/assets/5eb13acf-9921-4818-9cce-09886d236bc7" />


## 🦦 Personal note
After building a full-stack application with my teammates at BeachHacks 9.0, I wanted to try my hand at creating one on my own so here we are. I am extremely proud of what I have created and I learned many skills that I will definitely be using at my next hackathon :3

---
<p align="center">
  Checkout my other projects <a href="https://github.com/stephkmn">here</a> 🩷
</p>
