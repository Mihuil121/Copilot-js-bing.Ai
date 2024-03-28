import { Telegraf, Markup } from "telegraf";
import { ChatBot, conversation_style } from "bingai-js";
import { translate } from "free-translate";
import { lastBotMessage } from "./tg";

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

export async function retelling(ctx, lastBotMessage) {
    const chatBotInstance = new ChatBot(cookie);
    await chatBotInstance.init();
    const loadingMessag = await ctx.reply(
        "я пытаюсь пересказать дайте мне секунду 😓 "
    );
    
    const messageToBot = `Пожалуйста, перескажите текст на менее чем 500 символов как можно скорее. При этом, если в оригинальном тексте присутствуют нецензурные выражения, пожалуйста, замените их на культурные аналоги:${lastBotMessage}`;
    const response = await chatBotInstance.ask(
        messageToBot,
        convStyle,
        0,
        targetLanguage
    );
    const translatedResponse = await translateText(response, "ru");

    ctx.telegram.editMessageText(
        ctx.chat.id,
        loadingMessag.message_id,
        null,
        translatedResponse
    );
}