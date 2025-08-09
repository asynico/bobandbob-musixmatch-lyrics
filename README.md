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
// For ES6 / TypeScript
import { MusixmatchLyrics } from '@bobandbob/musixmatch-lyrics';

// For JavaScript (dynamic import)
const { default: MusixmatchLyrics } = await import('@bobandbob/musixmatch-lyrics');

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


### LRCLib

Unofficial LRCLib lyrics API integration for even more sources.

#### Usage Example

```js
// For es6/typescript
import api from '@bobandbob/musixmatch-lyrics';
// For javascript 
const { default: MusixmatchLyrics } = await import('@bobandbob/musixmatch-lyrics');

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

- If you get `No lyrics found`, try a different query or check your internet connection.
- For ESM/CJS compatibility, use the correct import style for your project.

---

## 🙏 Credits

- Inspired by Musixmatch and the open-source community
- Not affiliated with Musixmatch

---

## 📄 License

MIT