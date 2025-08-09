import fetch from 'node-fetch';

const BASE_URL = 'https://lrclib.net/api';

/**
 * Fetch lyrics from LRCLib by track and artist name
 * @param {Object} options
 * @param {string} options.track_name
 * @param {string} options.artist_name
 * @param {string} [options.album_name]
 * @param {number} [options.duration]
 * @returns {Promise<Object>} LRCLib API response
 */
async function getLyrics({ track_name, artist_name, album_name, duration }) {
  const params = new URLSearchParams({
    track_name,
    artist_name,
  });
  if (album_name) params.append('album_name', album_name);
  if (duration) params.append('duration', duration);
  const url = `${BASE_URL}/get?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`LRCLib API error: ${res.status}`);
  return res.json();
}

/**
 * Search for tracks in LRCLib
 * @param {Object} options
 * @param {string} options.track_name
 * @param {string} options.artist_name
 * @returns {Promise<Object>} LRCLib API response
 */
async function searchLyrics({ track_name, artist_name }) {
  const params = new URLSearchParams({
    track_name,
    artist_name,
  });
  const url = `${BASE_URL}/search?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`LRCLib API error: ${res.status}`);
  return res.json();
}

/**
 * Fetch cached lyrics from LRCLib
 * @param {Object} options
 * @param {string} options.track_name
 * @param {string} options.artist_name
 * @param {string} [options.album_name]
 * @param {number} [options.duration]
 * @returns {Promise<Object>} LRCLib API response
 */
async function getCachedLyrics({ track_name, artist_name, album_name, duration }) {
  const params = new URLSearchParams({
    track_name,
    artist_name,
  });
  if (album_name) params.append('album_name', album_name);
  if (duration) params.append('duration', duration);
  const url = `${BASE_URL}/get-cached?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`LRCLib API error: ${res.status}`);
  return res.json();
}

export default {
  getLyrics,
  searchLyrics,
  getCachedLyrics,
};
