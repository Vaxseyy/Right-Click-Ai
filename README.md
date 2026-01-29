# 🖱️ Right Click AI

A lightweight browser extension that adds a **powerful AI menu to your right‑click**. Instantly summarize, rewrite, explain, or ask questions about **selected text or entire web pages** using **Google’s Gemini AI**.

---

## ✨ What You Get

* ⚡ **Instant AI actions** via right‑click
* 📝 Writing tools: Fix Grammar, Rewrite, Change Tone
* 🧠 Understanding tools: Explain, Simplify, Summarize
* 📚 Study tools: Notes, Flashcards, Quiz generation
* 🌐 Page‑level Q&A: *Ask about this page*

---

## 🔑 Step 1: Add Your Gemini API Key (Required)

> If you see the error **“API key not valid. Please pass a valid API key.”**, this step is missing or incorrect.

### How to add the key

1. Open **`content.js`** in a text editor.
2. Locate the line (around line ~1016):

   ```js
   const GEMINI_API_KEY = 'YOUR_GOOGLE_API_KEY_HERE';
   ```
3. Replace it with your real key:

   ```js
   const GEMINI_API_KEY = 'AIzaSy...your...actual...key';
   ```
4. **Save** the file.

🔗 Get a free API key from **Google AI Studio**:
[https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
<img width="1863" height="213" alt="{FEA11AB0-7889-49D3-BB64-AF14A3854382}" src="https://github.com/user-attachments/assets/3afe8803-9f2f-49da-9396-c784253a154e" />

⚠️ **Important**

* Do **not** share your API key publicly.
* Reload the extension after changing the key.

---

## 🧩 Step 2: Install the Extension (Developer Mode)

This extension is loaded manually in Chromium‑based browsers.

### Supported browsers

* ✅ Chrome
* ✅ Edge
* ✅ Brave
* ✅ Opera

### Installation steps

1. Open the Extensions page:

   * Paste `chrome://extensions` into the address bar.
2. Enable **Developer mode** (top‑right toggle).
3. Click **Load unpacked**.
4. Select the project folder (e.g. `Right-Click-AI/`).
5. The extension will appear as **Right Click AI**.
<img width="816" height="422" alt="{1A20092B-F829-4583-BBFE-417B06BD247E}" src="https://github.com/user-attachments/assets/79b0a872-b11c-4c5c-ac54-f8db33700fd2" />

---

## 🚀 Step 3: How to Use Right Click AI

### Basic usage

1. Open **any webpage**.
2. **Double right‑click** anywhere on the page.
3. The **AI menu** appears.

### If text is selected ✍️

You’ll see options like:

* Fix Grammar
* Rewrite
* Change Tone
* Simplify
* Explain
* Summarize
* Generate Notes
* Create Flashcards
* Generate Quiz
<img width="214" height="497" alt="{1CB40E31-F06D-49B7-A17D-CA36B8715DF1}" src="https://github.com/user-attachments/assets/39c54727-a892-4f01-a5de-56bd6c4c0e6d" />

### If no text is selected 🌐

You can:

* **Ask about this page** (page‑level understanding)
  
---

## 🧠 Example Use Cases

* 📖 Studying articles or documentation
* ✍️ Improving writing quality instantly
* 🧩 Understanding complex technical pages
* 📝 Turning webpages into notes or flashcards
* 🧪 Quick self‑testing with quizzes

---

## 🛠️ Troubleshooting

### ❌ “API key not valid” error

✔ Confirm the API key is correctly pasted
✔ Ensure quotes are not removed
✔ Reload the extension from `chrome://extensions`
✔ Check that the key is enabled in Google AI Studio

### ❌ Menu not appearing

✔ Make sure you **double right‑click**
✔ Refresh the page
✔ Ensure the extension is enabled

---

## 📌 Notes

* This extension runs **locally in your browser**.
* Requests are sent directly to **Google Gemini APIs**.
* Performance depends on page size and API limits.

---

## 🧠 Summary

**Right Click AI** turns your browser into a contextual AI workspace.
Right‑click → choose action → get results.

Simple. Fast. Powerful.
