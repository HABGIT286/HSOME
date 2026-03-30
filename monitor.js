const { Client, GatewayIntentBits } = require('discord.js');

// ⚠️ ضع معلوماتك الحقيقية هنا
const GITHUB_TOKEN = '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';
const GITHUB_OWNER = 'HABGIT286';
const GITHUB_REPO = 'HSOME';
const GITHUB_PATH = 'notifications.json';

const DISCORD_BOT_TOKEN = 'MTQ4ODAyNTU0MDc3MzU0ODA1Mg.GLOsr7.2gV72PdDZwxhztQT1HYIQZqO7fyRamLOQOK1U8';
const NOTIFYME_BOT_ID = '1044050359586394192';
const CHANNEL_ID = '1487837632716079344';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

async function updateGitHubFile(content) {
    try {
        const refRes = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/heads/main`,
            { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } }
        );
        const refData = await refRes.json();
        const commitSha = refData.object.sha;

        const fileRes = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}?ref=${commitSha}`,
            { headers: { 'Authorization': `token ${GITHUB_TOKEN}` } }
        );
        const fileData = await fileRes.json();

        const newContent = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
        
        await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update notification',
                content: newContent,
                sha: fileData.sha,
                branch: 'main'
            })
        });
        
        console.log('✅ تم تحديث GitHub');
    } catch (error) {
        console.error('Error:', error);
    }
}

client.on('ready', () => {
    console.log(`✅ البوت متصل: ${client.user.tag}`);
    console.log(`📡 يراقب القناة: ${CHANNEL_ID}`);
});

client.on('messageCreate', async message => {
    if (message.author.id !== NOTIFYME_BOT_ID || message.channel.id !== CHANNEL_ID) return;
    
    console.log('🔴 تم اكتشاف بث مباشر!');
    
    const notification = {
        live: true,
        message: message.content,
        thumbnail: message.embeds[0]?.thumbnail?.url || '',
        url: message.embeds[0]?.url || '',
        timestamp: new Date().toISOString()
    };
    
    await updateGitHubFile(notification);
    console.log('📤 تم الإرسال');
});

client.login(DISCORD_BOT_TOKEN);
