import { readToken, saveToken } from './utils/cache.js';
import { cleanLyrics, parseSubtitles } from './utils/lyricsParser.js';
import { ENDPOINTS, HEADERS, REGEX } from './utils/constants.js';

let fetchInstance = null;
async function getFetch() {
    if (!fetchInstance) {
        const { default: fetch } = await import('node-fetch');
        const { default: fetchCookie } = await import('fetch-cookie');
        fetchInstance = fetchCookie(fetch);
    }
    return fetchInstance;
}

class Musixmatch {

    tokenData = null;
    tokenPromise = null;
    TOKEN_TTL = 55000;
    TOKEN_FILE = 'musixmatch_token.json';

    constructor() {
        this.initializeToken();
    }

    async initializeToken() {
        try {
            await this.getToken();
        } catch (error) {
            console.error('Musixmatch initialization failed:', error);
        }
    }

    async readTokenFromFile() {
        try {
            const data = await readToken(this.TOKEN_FILE);
            if (!data) return null;
            const json = JSON.parse(data);
            if (json.note !== "DO NOT DELETE") return null; 
            return {
                value: json.token,
                expires: json.expires
            };
        } catch {
            return null;
        }
    }

    async saveTokenToFile(token, expires) {
        try {
            const json = {
                note: "DO NOT DELETE",
                token,
                expires
            };
            await saveToken(this.TOKEN_FILE, JSON.stringify(json, null, 2));
        } catch (error) {
            console.error('Failed to save token to file:', error);
        }
    }

    async fetchToken() {
        const fetch = await getFetch();
        
        const response = await fetch(ENDPOINTS.TOKEN, {
            method: 'GET',
            headers: {
                ...HEADERS,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site'
            }
        });

        if (!response.ok) throw new Error(`Token request failed: ${response.status}`);

        const data = await response.json();
        if (data?.message?.header?.status_code !== 200) {
            throw new Error(data?.message?.header?.hint || 'Invalid token response');
        }

        return data.message.body.user_token;
    }

    async getToken() {
        const now = Date.now();

        if (!this.tokenData) {
            this.tokenData = await this.readTokenFromFile();
        }

        if (this.tokenData && now < this.tokenData.expires) {
            return this.tokenData.value;
        }

        if (this.tokenPromise) return this.tokenPromise;

        this.tokenPromise = (async () => {
            try {
                const token = await this.fetchToken();
                this.tokenData = {
                    value: token,
                    expires: now + this.TOKEN_TTL
                };
                await this.saveTokenToFile(token, this.tokenData.expires);
                return token;
            } finally {
                this.tokenPromise = null;
            }
        })();

        return this.tokenPromise;
    }

    async apiGet(url) {
        const fetch = await getFetch();
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                ...HEADERS,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return response.json();
    }

    cleanLyrics(lyrics) {
        return cleanLyrics(lyrics, REGEX);
    }

    parseSubtitles(subtitleBody) {
        return parseSubtitles(subtitleBody);
    }

    async searchTrack(title, token) {
        const url = `${ENDPOINTS.SEARCH}&q_track=${encodeURIComponent(title)}&usertoken=${token}`;
        const data = await this.apiGet(url);
        return data?.message?.body?.track_list?.[0]?.track || null;
    }

    async getAltLyrics(title, artist, token) {
        const url = `${ENDPOINTS.ALT_LYRICS}&usertoken=${token}&q_artist=${encodeURIComponent(artist)}&q_track=${encodeURIComponent(title)}`;
        const data = await this.apiGet(url);
        const calls = data?.message?.body?.macro_calls || {};
        const result = {
            lyrics: calls['track.lyrics.get']?.message?.body?.lyrics?.lyrics_body,
            track: calls['matcher.track.get']?.message?.body?.track,
            subtitles: calls['track.subtitles.get']?.message?.body?.subtitle_list?.[0]?.subtitle?.subtitle_body
        };
        return result;
    }

    parseQuery(query) {
        const cleanedQuery = query
            .replace(/\b(VEVO|Official Music Video|Lyrics)\b/gi, '')
            .trim();

        const separatorMatch = cleanedQuery.match(REGEX.ARTIST_TITLE);
        if (separatorMatch) {
            return {
                artist: separatorMatch[1].trim(),
                title: separatorMatch[2].trim()
            };
        }

        const lastSpaceIndex = cleanedQuery.lastIndexOf(' ');
        if (lastSpaceIndex > 0) {
            return {
                artist: cleanedQuery.substring(0, lastSpaceIndex).trim(),
                title: cleanedQuery.substring(lastSpaceIndex + 1).trim()
            };
        }

        return { title: cleanedQuery };
    }

    async findLyrics(query) {
        const token = await this.getToken();
        const parsed = this.parseQuery(query);

        if (parsed.artist) {
            const altResult = await this.getAltLyrics(parsed.title, parsed.artist, token);
            if (altResult?.subtitles || altResult?.lyrics) {
                return this.formatResult(altResult.subtitles, altResult.lyrics, altResult.track);
            }
        }

        const trackResult = await this.searchTrack(query, token);
        if (trackResult) {
            const lyricsData = await this.getLyricsFromTrack(trackResult, token);
            if (lyricsData?.subtitles || lyricsData?.lyrics) {
                return this.formatResult(lyricsData.subtitles, lyricsData.lyrics, trackResult);
            }
        }

        const titleOnlyResult = await this.getAltLyrics(parsed.title, '', token);
        if (titleOnlyResult?.subtitles || titleOnlyResult?.lyrics) {
            return this.formatResult(titleOnlyResult.subtitles, titleOnlyResult.lyrics, titleOnlyResult.track);
        }

        return null;
    }

    async getLyricsFromTrack(trackData, token) {
        try {
            const url = `${ENDPOINTS.LYRICS}&track_id=${trackData.track_id}&usertoken=${token}`;
            const data = await this.apiGet(url);
            const subtitles = data?.message?.body?.subtitle?.subtitle_body;
            return { subtitles, lyrics: subtitles ? this.cleanLyrics(subtitles) : null };
        } catch {
            return null;
        }
    }

    formatResult(subtitles, lyrics, trackData) {
        const lines = subtitles ? this.parseSubtitles(subtitles) : null;

        return {
            text: lyrics || null,
            lines: lines || null,
            track: {
                title: trackData?.track_name,
                author: trackData?.artist_name,
                albumArt: trackData?.album_coverart_350x350
            },
            source: 'Musixmatch'
        };
    }

    async getLrc(query) {
        const result = await this.findLyrics(query);
        if (!result) return null;

        return {
            synced: result.lines ? result.lines.map(l => l.line).join('\n') : null,
            unsynced: result.text,
            track: result.track
        };
    }
}

export default Musixmatch;