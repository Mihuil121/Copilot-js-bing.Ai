import { Telegraf, Markup } from "telegraf";
import { translate } from "free-translate";
import { ChatBot, conversation_style } from "bingai-js";
import { YoutubeTranscript } from "youtube-transcript";
import axios from 'axios';
import fs from 'fs';
import textract from 'textract';
import clipboard from "clipboardy";

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

function isYoutube(userMessage) {
  const pattern = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;
  return pattern.test(userMessage);
}

const chatStates = new Map();

let lastBotMessage;

bot.start((ctx) =>
  ctx.reply(`Я copilot созданный Mihuil121. Я могу: 1. Ответы на вопросы: Бот может отвечать на ваши вопросы, используя результаты поиска в Интернете. 2. Создание контента: Бот способен создавать оригинальный и творческий контент, такой как стихи, рассказы, код, эссе, песни, пародии на знаменитостей и многое другое, используя свои слова и знания. 3. Помощь в написании: Бот может помочь вам с написанием, переписыванием, улучшением или оптимизацией вашего контента. 4. Пересказ видео с YouTube: Бот умеет пересказывать в краткой форме видео с YouTube. Вам просто нужно отправить ссылку на видео, и бот сгенерирует краткое содержание этого видео.
  `)
);

bot.on("document", async (ctx) => {
  const buttonText = Markup.button.callback;
  const fileId = ctx.message.document.file_id;
  const fileLink = await ctx.telegram.getFileLink(fileId);

  try {
    const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const filePath = `./${ctx.message.document.file_name}`;

    await fs.writeFileSync(filePath, buffer);

    textract.fromFileWithPath(filePath, async function (error, text) {
      if (error) {
        console.error(error);
        ctx.reply('Произошла ошибка при обработке вашего файла.');
      } else {
        if (text.length > 4990) {
          ctx.reply('Текст превышает 4990 символов.');
        } else {
          chatStates.set(ctx.chat.id, { text });

          lastBotMessage = text;
          await ctx.reply(text, Markup.inlineKeyboard([
            [buttonText('копировать', 'callback_data4'), buttonText('пересказать 🔁', 'callback_data3')],
            [buttonText("перевод 🌐", "callback_data2"),]
          ]));

        }
      }
    });
  } catch (axiosError) {
    console.error(axiosError);
    ctx.reply('Произошла ошибка при получении файла.');
  }
});

bot.on("message", async (ctx) => {
  const buttonText = Markup.button.callback;
  const userMessage = ctx.message.text;

  if (isYoutube(userMessage)) {
    const loadingVideo = await ctx.reply("Я разбираю видео 🎬");

    YoutubeTranscript.fetchTranscript(userMessage)
      .then((transcript) => {
        let textOnly = transcript.map((item) => item.text);
        let limit = textOnly.join(" ").substring(0, 4000);
        lastBotMessage = textOnly.join(" ").substring(0, 4555);

        ctx.telegram.editMessageText(
          ctx.chat.id,
          loadingVideo.message_id,
          null,
          limit,
          Markup.inlineKeyboard([
            [buttonText("пересказать 🔁", "callback_data3")],
          ])
        );
      })
      .catch((error) => {
        ctx.reply("Что-то пошло не так: " + error.message);
      });
  } else if (userMessage) {
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
    lastBotMessage = translatedResponse;

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
  }
});

bot.on('text', (ctx) => {
  const chatId = ctx.chat.id;
  const chatState = chatStates.get(chatId);

  if (chatState && chatState.state === 'waitingForCommand') {
    const userCommand = ctx.message.text;
    ctx.reply(`Вы ввели: ${userCommand}`);
    chatStates.set(chatId, {});
  } else {
    ctx.reply('Неожиданный текст. Выполните другие действия сначала.');
  }
});

bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data === "callback_data1") {
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
  } else if (data === "callback_data2") {
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
  } else if (data === "callback_data3") {
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



bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
