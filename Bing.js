import { Telegraf, Markup } from "telegraf";
import { translate } from "free-translate";
import { ChatBot, conversation_style } from "bingai-js";
import axios from 'axios';

const cookie = "1EiQnm_sWX9jE_O4fK7k24MsQTf5Q7iSa8DJvBZIe5UA_M0kHXkES_TL99AhDv3vIDYqb11Dy_3xoTv4Ecz_TH-QqjVN-nLRtx4CDDUiv2-47ZFS4NBYlXtP0j04D6kFXknMSN0xKie4lWCsH0pvIbjDbn3b0NbO1ClrTJA63Mu7N_6sK3ao8UR2XJkGMKU6-AbXMBvcYMHWX-LHdEY_XaMMRL_9fHRQYdKdEnXlX0dlq3FaCOv4fF6sPh3xOSTti";

const convStyle = conversation_style.exact;
const targetLanguage = "en-US";

async function translateText(text, toLang) {
    try {
        const translatedText = await translate(text, { to: toLang });
        return translatedText;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function BingAi(ctx, userMessage) {

    const buttonText = Markup.button.callback;
    const translatedUserMessage = await translateText(userMessage, "en");
    const loadingMessage = await ctx.reply(
        "Я думаю, подождите... Анализирую ваше поведение. Вы очень интересны для науки."
    );
    const chatBotInstance = new ChatBot(cookie);

    await chatBotInstance.init();

    const response = await chatBotInstance.ask(
        translatedUserMessage,
        convStyle,
        0,
        targetLanguage
    );
    const translatedResponse = await translateText(response, "ru");
    const lastBotMessage = translatedResponse;

    ctx.telegram.editMessageText(
        ctx.chat.id,
        loadingMessage.message_id,
        null,
        translatedResponse,
        Markup.inlineKeyboard([
          [
            buttonText("подробнее 🧐📚", "callback_data1"), buttonText("перевод 🌐", "callback_data2"),
          ],
        ])
      );
    return lastBotMessage
}