const { Musixmatch } = require('@bobandbob/musixmatch-lyrics').default.default;

const query = process.argv.slice(2).join(' ') || 'Imagine Dragons - Believer';
const mxm = new Musixmatch();

(async () => {
    try {
        // Use getLrc to fetch lyrics
        const lyricsResult = await mxm.getLrc(query);
        if (!lyricsResult || (!lyricsResult.synced && !lyricsResult.unsynced)) {
            console.log('No lyrics found for:', query);
        } else {
            const lyricsText = lyricsResult.synced || lyricsResult.unsynced;
            const track = lyricsResult.track || { title: query, author: '' };
            console.log(`\nLyrics for: ${track.title} by ${track.author}`);
            console.log('----------------------------------------');
            console.log(lyricsText);
            console.log('----------------------------------------');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
})();
