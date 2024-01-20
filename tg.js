import { Telegraf, Markup } from 'telegraf';
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

bot.start((ctx) => ctx.reply('Welcome задайте вопрос чтобы начать диолог '))
let lastBotMessage = '';
bot.on('message', async (ctx) => {
    const buttonText = Markup.button.callback;
    const userMessage = ctx.message.text;
    if (userMessage) {
        const translatedUserMessage = await translateText(userMessage, 'en');
        const loadingMessage = await ctx.reply('Я думаю, подождите... Анализирую ваше поведение. Вы очень интересны для науки.');

        const chatBotInstance = new ChatBot(cookie);
        await chatBotInstance.init();

        const response = await chatBotInstance.ask(translatedUserMessage, convStyle, 0, targetLanguage);
        const translatedResponse = await translateText(response, 'ru');
        lastBotMessage = translatedResponse;
        ctx.telegram.editMessageText(ctx.chat.id, loadingMessage.message_id, null, translatedResponse, Markup
            .inlineKeyboard([
                [buttonText('подробнее 🧐📚', 'callback_data1'), buttonText('перевод 🌐', 'callback_data2')],
            ])
        )
    }
});

bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    if (data === 'callback_data1') {
        const chatBotInstance = new ChatBot(cookie);
        await chatBotInstance.init();
        const loadingMessag = await ctx.reply('я выполняю ваш запрос 🧐📚');
        const messageToBot = `Исследуйте тему более подробно и предоставьте дополнительную информацию на 10000 символов,включая ссылки в тексте для подтверждения представленной информации. Вот тема:"${lastBotMessage}">.в `;
        const response = await chatBotInstance.ask(messageToBot, convStyle, 0, targetLanguage);
        const translatedResponse = await translateText(response, 'ru');
            ctx.editMessageText(translatedResponse, {chat_id: ctx.chat.id, message_id: loadingMessag.message_id});

    }
    else if(data === "callback_data2"){
        const chatBotInstance = new ChatBot(cookie);
        await chatBotInstance.init();
        let loadingMessag = await ctx.reply('I am fulfilling your request🌐');
        lastBotMessage  = await translateText(lastBotMessage, 'en');
        ctx.editMessageText(lastBotMessage, {chat_id: ctx.chat.id, message_id: loadingMessag.message_id});
    }
});



bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
