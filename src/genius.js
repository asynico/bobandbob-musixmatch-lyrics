const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

let GENIUS_ACCESS_TOKEN = null;

/**
 * Set Genius API access token
 * @param {string} token
 */
function setAccessToken(token) {
  GENIUS_ACCESS_TOKEN = token;
}

/**
 * Search for a song on Genius
 * @param {string} query
 * @returns {Promise<Object>} Genius API response
 */
async function searchSong(query) {
  if (!GENIUS_ACCESS_TOKEN) throw new Error('Genius API access token not set. Use setAccessToken(token).');
  const url = `https://api.genius.com/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}`,
    },
  });
  if (!res.ok) throw new Error(`Genius API error: ${res.status}`);
  return res.json();
}

/**
 * Get lyrics page URL for a Genius song ID
 * @param {number} songId
 * @returns {Promise<string>} Lyrics page URL
 */
async function getLyricsUrl(songId) {
  if (!GENIUS_ACCESS_TOKEN) throw new Error('Genius API access token not set. Use setAccessToken(token).');
  const url = `https://api.genius.com/songs/${songId}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GENIUS_ACCESS_TOKEN}`,
    },
  });
  if (!res.ok) throw new Error(`Genius API error: ${res.status}`);
  const data = await res.json();
  return data.response.song.url;
}

export default {
  setAccessToken,
  searchSong,
  getLyricsUrl,
};
