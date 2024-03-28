import { Telegraf, Markup } from "telegraf";
import { translate } from "free-translate";
import { ChatBot, conversation_style } from "bingai-js";
import clipboard from "clipboardy";
import { Ytube, isYoutube } from "./Ytube.js";
import { BingAi } from "./Bing.js"
import { Document } from "./Document.js";
import Tesseract from "tesseract.js";

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

const bot = new Telegraf("6626923176:AAFQD-OCnvZV_gwqoNjHu_vSPVrEcjXfcyU");


const chatStates = new Map();

let lastBotMessage;

bot.start((ctx) =>
  ctx.replyWithMarkdown(`Я copilot созданный Mihuil121. Я могу: 1. Ответы на вопросы: Бот может отвечать на ваши вопросы, используя результаты поиска в Интернете. 2. Создание контента: Бот способен создавать оригинальный и творческий контент, такой как стихи, рассказы, код, эссе, песни, пародии на знаменитостей и многое другое, используя свои слова и знания. 3. Помощь в написании: Бот может помочь вам с написанием, переписыванием, улучшением или оптимизацией вашего контента. 4. Пересказ видео с YouTube: Бот умеет пересказывать в краткой форме видео с YouTube. Вам просто нужно отправить ссылку на видео, и бот сгенерирует краткое содержание этого видео.
  `)
);

bot.on("document", async (ctx) => {
  try {
    lastBotMessage = await Document(ctx, chatStates);
    console.log(lastBotMessage);
  } catch (error) {
    console.error(error);
    ctx.reply('Произошла ошибка при обработке вашего файла.');
  }
});

bot.on('photo', async (ctx) => {
  try {
    const buttonText = Markup.button.callback;
    const photo = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const photoLink = await ctx.telegram.getFileLink(photo)
    const loding = await ctx.reply("я читаю ...")

    Tesseract.recognize(
      photoLink.href,
      'eng+rus',
      { loger: (m) => console.log(m) }
    ).then(({ data: { text } }) => {
       lastBotMessage = text;
      ctx.telegram.editMessageText(
        ctx.chat.id,
        loding.message_id,
        null,
        lastBotMessage,
        Markup.inlineKeyboard([
          [buttonText("перевод 🌐", "callback_data2")]
        ])
      )
    })
  } catch (err) {
    console.error('ошибка: ', err)
    ctx.reply("Пагодика что-то сдесь нетак.")
  }
})

bot.on("message", async (ctx) => {
  const userMessage = ctx.message.text;

  if (isYoutube(userMessage)) {
    lastBotMessage = await Ytube(ctx, userMessage);
  } else if (userMessage) {
    lastBotMessage = await BingAi(ctx, userMessage);
  }
});

bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data === "callback_data1") {
    await Long(ctx, lastBotMessage);
  } else if (data === "callback_data2") {
    await TranslateFunction(ctx, lastBotMessage);
  } else if (data === "callback_data3") {
    await retelling(ctx, lastBotMessage);
  } else if (data === "callback_data4") {
    try {
      await clipboard.write(lastBotMessage);
      ctx.reply('Текст скопирован в буфер обмена.');
    } catch (error) {
      ctx.reply('Произошла ошибка при копировании текста.');
      console.error(error);
    }
  }
});

async function retelling(ctx, lastBotMessage) {
  const chatBotInstance = new ChatBot(cookie);
  await chatBotInstance.init();
  const loadingMessag = await ctx.reply(
    "я пытаюсь пересказать дайте мне секунду 😓 "
  );

  const messageToBot = `Пожалуйста, перескажите текст не более чем 300 символов как можно скорее. При этом, если в оригинальном тексте присутствуют нецензурные выражения, пожалуйста, замените их на культурные аналоги:${lastBotMessage}`;

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

async function Long(ctx, lastBotMessage) {
  const chatBotInstance = new ChatBot(cookie);
  await chatBotInstance.init();
  const loadingMessag = await ctx.reply("я выполняю ваш запрос 🧐📚");
  const messageToBot = `Исследуйте тему более подробно и предоставьте дополнительную информацию на 10000 символов,включая ссылки в тексте для подтверждения представленной информации. Вот тема:"${lastBotMessage}">.в `;
  const response = await chatBotInstance.ask(
    messageToBot,
    convStyle,
    0,
    targetLanguage
  );
  const translatedResponse = await translateText(response, "ru");
  ctx.editMessageText(translatedResponse, {
    chat_id: ctx.chat.id,
    message_id: loadingMessag.message_id,
  });
}

async function TranslateFunction(ctx, lastBotMessage) {
  if (!lastBotMessage) {
    ctx.reply('текста нет')
  } else {
    const chatBotInstance = new ChatBot(cookie);
    await chatBotInstance.init();
    let loadingMessag = await ctx.reply("I am fulfilling your request🌐");
    lastBotMessage = await translateText(lastBotMessage, "en");
    ctx.editMessageText(lastBotMessage, {
      chat_id: ctx.chat.id,
      message_id: loadingMessag.message_id,
    });
  }
}

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));