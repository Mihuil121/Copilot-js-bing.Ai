import { Telegraf } from 'telegraf';
import { translate } from 'free-translate';
import { ChatBot, conversation_style } from 'bingai-js';


const cookie = "1JMUC7OBDHztN8nYY8ep5gOQNsNX4IwIhHodevMjazL24IZwPtVqEOHk-PYt3xvSVsvRqc6-jPHoP2pULeOHfDLFNhs6LzpBYZVGtN6TNWIcuJPej12Uoj6tQ431fbAjwhynrJ6t9cIcX7E8VjYZexnW8LlO8K5TXN37iZbPdRUHREsCvuhifzYj7Seoy4sZId7bDrZ3G_BxlnNVNBD20-DtW9xDxoqLx4uXGZ22AbzJbl8c1fD_hKdWleu-_PSO2";

const convStyle = conversation_style.exact;
const targetLanguage = 'en-US';

async function translateText(text, toLang) {
    try {
        const translatedText = await translate(text, { to: toLang });
        return translatedText;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

const bot = new Telegraf("6626923176:AAFQD-OCnvZV_gwqoNjHu_vSPVrEcjXfcyU")

bot.start((ctx) => ctx.reply('Welcome'))

bot.on('message', async (ctx) => {
    const userMessage = ctx.message.text;
    const translatedUserMessage = await translateText(userMessage, 'en');
    const loadingMessage = await ctx.reply('Я думаю, подождите... Анализирую ваше поведение. Вы очень интересны для науки.');

    const chatBotInstance = new ChatBot(cookie);
    await chatBotInstance.init();

    const response = await chatBotInstance.ask(translatedUserMessage, convStyle, 0, targetLanguage);
    const translatedResponse = await translateText(response, 'ru');

    ctx.telegram.editMessageText(ctx.chat.id, loadingMessage.message_id, null, translatedResponse);
});

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
