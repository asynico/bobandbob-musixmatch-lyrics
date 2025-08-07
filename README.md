# 🎵 musixmatch-lyrics

Unofficial Musixmatch lyrics API wrapper for Node.js  
No official API key required. Simple, clean, and efficient.

---

## ✨ Features

- 🎶 Fetch synced and unsynced lyrics from Musixmatch  
- 🔐 Automatic token management with caching  
- 🔍 Track search with subtitle parsing  
- ✅ No official Musixmatch API key needed  

---

## 📦 Installation

```bash
npm install @bobandbob/musixmatch-lyrics
```

---

## 💻 Usage

### Programmatic Example

```js
import { Musixmatch } from '@bobandbob/musixmatch-lyrics';

const mxm = new Musixmatch();

(async () => {
  const lyricsResult = await mxm.getLrc('Imagine Dragons - Believer');

  if (!lyricsResult || (!lyricsResult.synced && !lyricsResult.unsynced)) {
    console.log('No lyrics found');
  } else {
    const lyricsText = lyricsResult.synced || lyricsResult.unsynced;
    const track = lyricsResult.track || { title: 'Imagine Dragons - Believer', author: '' };
    console.log(`Lyrics for: ${track.title} by ${track.author}`);
    console.log(lyricsText);
  }
})();
```

---

## 📄 Sample Output

```
Lyrics for: Believer by Imagine Dragons

First things first
I'ma say all the words inside my head
The way that things have been, oh-ooh
Second things second
Don't you tell me what you think that I could be
I'm the one at the sail, I'm the master of my sea, oh-ooh
The master of my sea, oh-ooh
... (truncated for brevity)

---

## 🛠 Command-Line Usage

You can use this package directly from the command line:

```bash
node src/example.cjs "Imagine Dragons - Believer"
```

---

## 🧩 API

### Musixmatch

#### Methods

- `getLrc(query: string): Promise<{ synced?: string, unsynced?: string, track?: object }>`
  - Fetches lyrics for a given song or artist.
- `findLyrics(query: string): Promise<string>`
  - Returns unsynced lyrics only.

---

## ❓ Troubleshooting

- If you get `No lyrics found`, try a different query or check your internet connection.
- For ESM/CJS compatibility, use the correct import style for your project.

---

## 🙏 Credits

- Inspired by Musixmatch and the open-source community
- Not affiliated with Musixmatch

---

## 📄 License

MIT
The way that things