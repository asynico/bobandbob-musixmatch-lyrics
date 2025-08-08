const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'https://api.lyrics.ovh/v1';

/**
 * Fetch lyrics from OVH by artist and title
 * @param {Object} options
 * @param {string} options.artist
 * @param {string} options.title
 * @returns {Promise<Object>} OVH API response
 */
async function getLyrics({ artist, title }) {
  const url = `${BASE_URL}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OVH API error: ${res.status}`);
  return res.json();
}

export default {
  getLyrics,
};
