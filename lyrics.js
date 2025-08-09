const Perms = require('../../../utils/perms.js');
const Embed = require('../../../utils/embed.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { registerPaginatedMessage } = require('../../../utils/buttonhandler.js');
const { Lyrics, TargetType, syncedToPlaintext, identifyLyricsType } = require('../../../utils/lyrics.js');

module.exports = {
    name: 'lyrics',
    aliases: ['ly'],
    category: 'music',
    description: 'Get lyrics for the currently playing song',
    usage: 'lyrics [song name/link]',
    examples: ['lyrics Never Gonna Give You Up'],
    permissions: [Perms.Flags.ViewChannel, Perms.Flags.SendMessages],
    
    async execute(message, args, client) {
        const player = client.aqua.players.get(message.guild.id);

        if ((args.length === 1 && args[0] === 'help') || (args.length === 0 && (!player || !player.playing))) {
            const helpEmbed = Embed.neutral()
                .setAuthor({
                    name: client.user.displayName,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle('Command: lyrics')
                .setDescription(`${this.description}\n\`\`\`Syntax: ${message.prefix}${this.usage}\nExample: ${message.prefix}${this.examples[0]}\n\`\`\``);

            return message.channel.send({ embeds: [helpEmbed] });
        }

        try {
            if (!player) {
                return await searchLyricsByQuery(message, args.join(' '), client);
            }

            if (!message.member.voice.channel) {
                const msg = await message.channel.send({ 
                    embeds: [Embed.error("You must be in a voice channel to use this command!")]
                });
                setTimeout(() => msg.delete().catch(() => {}), 8000);
                return;
            }

            if (message.member.voice.channel.id !== player.voiceChannel) {
                const msg = await message.channel.send({ 
                    embeds: [Embed.error("You must be in the same voice channel as me!")]
                });
                setTimeout(() => msg.delete().catch(() => {}), 8000);
                return;
            }

            const skipTrackSource = args.includes('skip-source') || args.includes('skip');
            
            const loadingMsg = await message.channel.send({
                embeds: [Embed.loading("Searching for lyrics...")]
            });

            try {
                const track = player.currentTrackInfo || player.queue.current;
                const title = track.info?.title || track.title || 'Unknown Track';
                const author = track.info?.author || track.author || track.artist || 'Unknown Artist';

                let lyricsData = null;
                
                try {
                    const { default: MusixmatchLyrics } = await import('@bobandbob/musixmatch-lyrics');
                    const musixmatch = new MusixmatchLyrics();
                    
                    let lyricsResult = await musixmatch.getLrc(`${title} ${author}`);
                    
                    if (lyricsResult) {
                        const lyricsText = lyricsResult.lyrics?.synced || 
                                         lyricsResult.lyrics?.unsynced || 
                                         lyricsResult.lyrics?.plain ||
                                         lyricsResult.synced ||
                                         lyricsResult.unsynced ||
                                         lyricsResult.plain ||
                                         lyricsResult;
                        
                        if (lyricsText && typeof lyricsText === 'string') {
                            lyricsData = {
                                text: lyricsText,
                                sourceName: 'Musixmatch',
                                trackInfo: lyricsResult.track || {
                                    title: title,
                                    artist: author
                                }
                            };
                        }
                    }
                } catch (musixmatchError) {
                    console.log('Musixmatch failed:', musixmatchError.message);
                }

                if (!lyricsData || !lyricsData.text) {
                    await loadingMsg.edit({
                        embeds: [Embed.error("No lyrics found for this track from any source")]
                    });
                    setTimeout(() => loadingMsg.delete().catch(() => {}), 8000);
                    return;
                }

                return await displayPaginatedLyrics(loadingMsg, message, lyricsData, player, client);

            } catch (error) {
                console.error('Error in lyrics command:', error);
                await loadingMsg.edit({
                    embeds: [Embed.error("An error occurred while fetching lyrics. Please try again.")]
                });
                setTimeout(() => loadingMsg.delete().catch(() => {}), 8000);
            }

        } catch (error) {
            console.error('Unexpected error in lyrics command:', error);
            const msg = await message.channel.send({ 
                embeds: [Embed.error("An unexpected error occurred. Please try again.")]
            });
            setTimeout(() => msg.delete().catch(() => {}), 8000);
        }
    }
};

async function displayPaginatedLyrics(loadingMsg, message, lyricsData, player, client) {
    const trackInfo = player.currentTrackInfo || player.queue?.current;
    const title = (trackInfo?.title || trackInfo?.info?.title || lyricsData.trackInfo?.title || 'Unknown Track').trim() || 'Unknown Track';
    const author = (trackInfo?.author || trackInfo?.info?.author || trackInfo?.artist || lyricsData.trackInfo?.artist || 'Unknown Artist').trim() || 'Unknown Artist';
    const uri = trackInfo?.uri || trackInfo?.info?.uri || '';

    let lyricsText = lyricsData.text;

    if (!lyricsText || lyricsText.trim() === '') {
        await loadingMsg.edit({
            embeds: [Embed.error("No lyrics content available for this track")]
        });
        setTimeout(() => loadingMsg.delete().catch(() => {}), 8000);
        return;
    }

    lyricsText = cleanLyricsText(lyricsText);
    
    const lyricsType = identifyLyricsType ? identifyLyricsType(lyricsText) : 'plain';
    let displayText = lyricsText;
    
    if (lyricsType === 'synced') {
        displayText = lyricsText;
    }
    
    if (!displayText || displayText === 'No lyrics available') {
        await loadingMsg.edit({
            embeds: [Embed.error("No valid lyrics content found for this track")]
        });
        setTimeout(() => loadingMsg.delete().catch(() => {}), 8000);
        return;
    }

    const maxLength = 1000;
    const lyricsPages = [];
    
    if (displayText.length <= maxLength) {
        lyricsPages.push(displayText);
    } else {
        const lines = displayText.split('\n').filter(line => line.trim().length > 0);
        let currentPage = '';
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            if (currentPage.length + trimmedLine.length + 2 > maxLength && currentPage.length > 0) {
                lyricsPages.push(currentPage.trim());
                currentPage = trimmedLine;
            } else {
                currentPage += (currentPage ? '\n' : '') + trimmedLine;
            }
        }
        
        if (currentPage.trim()) {
            lyricsPages.push(currentPage.trim());
        }
    }
    
    if (lyricsPages.length === 0) {
        lyricsPages.push('No lyrics content available');
    }

    let thumbnail = null;
    try {
        thumbnail = trackInfo?.artworkUrl || 
                   trackInfo?.thumbnail || 
                   trackInfo?.info?.artworkUrl || 
                   lyricsData.trackInfo?.albumArt || 
                   lyricsData.trackInfo?.thumbnail || 
                   null;
    } catch (error) {
        console.log('Could not fetch thumbnail:', error.message);
    }

    const username = message.author.displayName || message.author.username;
    const userAvatar = message.author.displayAvatarURL();

    let songDisplay = title;
    if (author && author !== 'Unknown Artist') {
        songDisplay = `${title} by ${author}`;
    }

    const songUrl = uri || '';
    const thumbnailUrl = thumbnail || '';

    const sourceName = lyricsType === 'synced' ? 'Musixmatch' : 'Musixmatch';
    const sourceIcon = 'https://fume.rest/Images/musixmatch.png';

    const embeds = lyricsPages.map((page, index) => {
        const embed = Embed.neutral()
            .setColor('#d0d0d0')
            .setAuthor({
                name: username,
                iconURL: userAvatar
            });

        let description = '';
        if (songUrl) {
            description += `**[${songDisplay}](${songUrl})**\n\n`;
        } else {
            description += `**${songDisplay}**\n\n`;
        }
        description += page;
        embed.setDescription(description);

        if (thumbnailUrl && index === 0) {
            embed.setThumbnail(thumbnailUrl);
        }

        const footerText = `${sourceName} • Page ${index + 1}/${lyricsPages.length}`;
        embed.setFooter({ text: footerText, iconURL: sourceIcon });

        return embed;
    });

    if (lyricsPages.length === 1) {
        await loadingMsg.edit({ embeds: [embeds[0]] });
        return;
    }

    const ITEMS_PER_PAGE = 1; 
    const components = lyricsPages.length > ITEMS_PER_PAGE ? [{
        type: 1,
        components: [
            {
                type: 2,
                customId: 'back',
                style: 1,
                emoji: { id: '1312202398567104572', name: 'back' },
                disabled: true
            },
            {
                type: 2,
                customId: 'forward',
                style: 1,
                emoji: { id: '1312202424391569428', name: 'forward' },
                disabled: false
            },
            {
                type: 2,
                customId: 'skipto',
                style: 2,
                emoji: { id: '1312202442632331385', name: 'skipto' }
            },
            {
                type: 2,
                customId: 'close',
                style: 4,
                emoji: { id: '1312202559737565224', name: 'close' }
            }
        ]
    }] : [];

    const sentMessage = await loadingMsg.edit({
        embeds: [embeds[0]],
        components: components
    });

    if (lyricsPages.length > ITEMS_PER_PAGE) {
        registerPaginatedMessage(
            sentMessage,
            message.author.id,
            lyricsPages.length,
            async (interaction, currentPage) => {
                await interaction.update({
                    embeds: [embeds[currentPage]],
                    components: [{
                        type: 1,
                        components: [
                            {
                                type: 2,
                                customId: 'back',
                                style: 1,
                                emoji: { id: '1312202398567104572', name: 'back' },
                                disabled: currentPage === 0
                            },
                            {
                                type: 2,
                                customId: 'forward',
                                style: 1,
                                emoji: { id: '1312202424391569428', name: 'forward' },
                                disabled: currentPage === lyricsPages.length - 1
                            },
                            {
                                type: 2,
                                customId: 'skipto',
                                style: 2,
                                emoji: { id: '1312202442632331385', name: 'skipto' }
                            },
                            {
                                type: 2,
                                customId: 'close',
                                style: 4,
                                emoji: { id: '1312202559737565224', name: 'close' }
                            }
                        ]
                    }]
                });
            }
        );
    }

    setTimeout(async () => {
        try {
            if (lyricsPages.length > ITEMS_PER_PAGE) {
                const disabledComponents = [{
                    type: 1,
                    components: components[0].components.map(btn => ({ ...btn, disabled: true }))
                }];
                await sentMessage.edit({
                    components: disabledComponents
                });
            }
        } catch (err) {
        }
    }, 180000);
}

async function searchLyricsByQuery(message, query, client) {
    if (!query || query.trim() === '') {
        const msg = await message.channel.send({
            embeds: [Embed.error("Please provide a song name to search for lyrics!")]
        });
        setTimeout(() => msg.delete().catch(() => {}), 8000);
        return;
    }

    const loadingMsg = await message.channel.send({
        embeds: [Embed.loading(`Searching for lyrics: **${query}**...`)]
    });

    let lyricsResult = null;

    const parseQuery = (query) => {
        const cleanedQuery = query
            .replace(/\b(VEVO|Official Music Video|Lyrics)\b/gi, '')
            .trim();

        const separatorMatch = cleanedQuery.match(/^(.*?)\s*[-–~]\s*(.+)$/);
        if (separatorMatch) {
            return {
                artist: separatorMatch[1].trim(),
                track: separatorMatch[2].trim()
            };
        }

        const lastSpaceIndex = cleanedQuery.lastIndexOf(' ');
        if (lastSpaceIndex > 0) {
            return {
                artist: cleanedQuery.substring(0, lastSpaceIndex).trim(),
                track: cleanedQuery.substring(lastSpaceIndex + 1).trim()
            };
        }

        return { track: cleanedQuery };
    };

    const parsed = parseQuery(query);

    try {
        const MusixmatchLyrics = require('@bobandbob/musixmatch-lyrics');
        const musixmatch = new MusixmatchLyrics();
        
        if (parsed.artist && parsed.track) {
            lyricsResult = await musixmatch.getLrc(`${parsed.track} ${parsed.artist}`);
        }

        if (!lyricsResult && parsed.track) {
            lyricsResult = await musixmatch.getLrc(parsed.track);
        }

        if (!lyricsResult) {
            lyricsResult = await musixmatch.getLrc(query);
        }
    } catch (error) {
        console.error('Musixmatch failed:', error.message);
    }

    let lyricsText = null;
    let trackInfo = null;
    
    if (lyricsResult) {
        lyricsText = lyricsResult.lyrics?.synced || 
                    lyricsResult.lyrics?.unsynced || 
                    lyricsResult.lyrics?.plain ||
                    lyricsResult.synced ||
                    lyricsResult.unsynced ||
                    lyricsResult.plain ||
                    (typeof lyricsResult === 'string' ? lyricsResult : null);
        
        trackInfo = lyricsResult.track || {
            title: parsed.track || query,
            artist: parsed.artist || 'Unknown Artist'
        };
    }

    if (!lyricsText) {
        await loadingMsg.edit({
            embeds: [Embed.error(`No lyrics found for: **${query}**`)]
        });
        setTimeout(() => loadingMsg.delete().catch(() => {}), 8000);
        return;
    }

    const lyricsData = {
        text: lyricsText,
        sourceName: 'Musixmatch',
        trackInfo: trackInfo
    };

    const mockPlayer = {
        currentTrackInfo: {
            title: trackInfo?.title || parsed.track || query,
            author: trackInfo?.artist || parsed.artist || 'Unknown Artist',
            uri: ''
        }
    };

    return await displayPaginatedLyrics(loadingMsg, message, lyricsData, mockPlayer, client);
}

function cleanLyricsText(text) {
    if (!text) return '';
    
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        .trim();
}
