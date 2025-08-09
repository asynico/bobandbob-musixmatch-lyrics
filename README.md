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
# 2.6.6 fixes everything. update your code to 2.6.6!
```

---

## 💻 Usage

### Programmatic Example

```js
// For ES6 / TypeScript (default export)
import MusixmatchLyrics from '@bobandbob/musixmatch-lyrics';

// For JavaScript (dynamic import) - CORRECT SYNTAX
const { default: MusixmatchLyrics } = await import('@bobandbob/musixmatch-lyrics');

// For CommonJS environments that support dynamic imports
const MusixmatchLyrics = (await import('@bobandbob/musixmatch-lyrics')).default;

const mxm = new MusixmatchLyrics();

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

### 🚨 Important Import Notes

**The class is exported as a DEFAULT export, not a named export!**

✅ **CORRECT:**
```js
// ES6 modules
import MusixmatchLyrics from '@bobandbob/musixmatch-lyrics';

// Dynamic import
const { default: MusixmatchLyrics } = await import('@bobandbob/musixmatch-lyrics');
```

❌ **INCORRECT:**
```js
// This will cause "MusixmatchLyrics is not a constructor" error
import { MusixmatchLyrics } from '@bobandbob/musixmatch-lyrics';

// This will also fail
const MusixmatchLyrics = require('@bobandbob/musixmatch-lyrics');
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
```

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

### LRCLib

Unofficial LRCLib lyrics API integration for even more sources.

#### Usage Example

```js
// For ES6/TypeScript (default export)
import api from '@bobandbob/musixmatch-lyrics';
// For JavaScript dynamic import
const api = (await import('@bobandbob/musixmatch-lyrics')).default;

const { lrclib } = api;

(async () => {
  const result = await lrclib.getLyrics({
    track_name: 'I Want to Live',
    artist_name: 'Borislav Slavov',
    album_name: "Baldur's Gate 3 (Original Game Soundtrack)",
    duration: 233,
  });
  console.log(result);
})();
```

#### Methods

- `getLyrics({ track_name, artist_name, album_name?, duration? })`
  - Fetches lyrics for a specific track, artist, album, and duration.
- `searchLyrics({ track_name, artist_name })`
  - Searches for tracks and lyrics by name and artist.
- `getCachedLyrics({ track_name, artist_name, album_name?, duration? })`
  - Fetches cached lyrics for a track.

---

### Genius

Genius lyrics API integration. Requires a Genius API client access token.

#### Setup

1. Get your Genius API access token from https://genius.com/api-clients
2. Set the token in your code:

```js
import api from '@bobandbob/musixmatch-lyrics';
api.genius.setAccessToken('YOUR_GENIUS_ACCESS_TOKEN');
```

#### Usage Example

```js
const { genius } = api;
genius.setAccessToken('YOUR_GENIUS_ACCESS_TOKEN');

(async () => {
  const search = await genius.searchSong('Taylor Swift - 22');
  const songId = search.response.hits[0].result.id;

  const lyricsUrl = await genius.getLyricsUrl(songId);
  console.log('Lyrics page:', lyricsUrl);
})();
```

#### Methods

- `setAccessToken(token: string)`
  - Set your Genius API access token.
- `searchSong(query: string)`
  - Search for a song on Genius.
- `getLyricsUrl(songId: number)`
  - Get the Genius lyrics page URL for a song ID.

---

### OVH

OVH lyrics API integration. No API key required.

#### Usage Example

```js
const { ovh } = api;

(async () => {
  const result = await ovh.getLyrics({
    artist: 'Taylor Swift',
    title: '22',
  });
  console.log(result.lyrics);
})();
```

#### Methods

- `getLyrics({ artist, title })`
  - Fetches lyrics for a given artist and song title.

---

## ❓ Troubleshooting

### Common Issues

#### "MusixmatchLyrics is not a constructor" Error

This happens when using incorrect import syntax. Make sure you're importing the **default export**:

```js
// ✅ Correct
const { default: MusixmatchLyrics } = await import('@bobandbob/musixmatch-lyrics');

// ❌ Wrong - will cause constructor error
const MusixmatchLyrics = require('@bobandbob/musixmatch-lyrics');
```

#### No lyrics found

- Try a different query format (e.g., "Artist - Song" or "Song Artist")
- Check your internet connection
- Verify the song exists on Musixmatch

#### Mixed module systems

If you're using this in a mixed CommonJS/ESM environment:

```js
// In async context
const MusixmatchLyrics = (await import('@bobandbob/musixmatch-lyrics')).default;

// Or create a wrapper function
async function createMusixmatch() {
  const { default: MusixmatchLyrics } = await import('@bobandbob/musixmatch-lyrics');
  return new MusixmatchLyrics();
}
```

---

## 🙏 Credits

- Inspired by Musixmatch and the open-source community
- Not affiliated with Musixmatch

---

## 📄 License

MIT

---

### Support: 
https://discord.gg/PF5WN3FEA5