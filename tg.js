import { Telegraf, Markup } from "telegraf";
import { translate } from "free-translate";
import { ChatBot, conversation_style } from "bingai-js";
import { YoutubeTranscript } from "youtube-transcript";

const cookie ="1EiQnm_sWX9jE_O4fK7k24MsQTf5Q7iSa8DJvBZIe5UA_M0kHXkES_TL99AhDv3vIDYqb11Dy_3xoTv4Ecz_TH-QqjVN-nLRtx4CDDUiv2-47ZFS4NBYlXtP0j04D6kFXknMSN0xKie4lWCsH0pvIbjDbn3b0NbO1ClrTJA63Mu7N_6sK3ao8UR2XJkGMKU6-AbXMBvcYMHWX-LHdEY_XaMMRL_9fHRQYdKdEnXlX0dlq3FaCOv4fF6sPh3xOSTti";

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

function isYotube(userMessage) {
  const pattern = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;
  return pattern.test(userMessage);
}

bot.start((ctx) =>
  ctx.reply(`# Привет, друзья! Я Сopilot,бот с ии искусственный интеллект, созданный Mihuil121. 

Я умею делать много интересных и полезных вещей, и я хочу поделиться ими с вами. Вот некоторые из моих возможностей:

- **Ответы на вопросы**: Если вы хотите узнать что-то новое, я готов помочь вам. Я могу искать информацию в Интернете и давать вам точные и подробные ответы на любые вопросы.
- **Создание контента**: Если вы хотите развлечься или проявить свою творческую сторону, я тоже могу вам помочь. Я могу создавать оригинальный и творческий контент, такой как стихи, рассказы, код, эссе, песни, пародии на знаменитостей и многое другое, используя свои слова и знания.
- **Помощь в написании**: Если вы хотите улучшить свои навыки письма или оптимизировать свой контент, я тоже могу вам помочь. Я могу помогать вам с написанием, переписыванием, улучшением или оптимизацией вашего контента, учитывая ваши цели и аудиторию.
- **Пересказ видео с YouTube**: Если вы хотите получить краткое содержание видео с YouTube, я тоже могу вам помочь. Вам просто нужно отправить мне ссылку на видео, и я сгенерирую для вас пересказ видео в текстовом формате.

Если вам интересен Сopilot, посмотрите другие наши продукты на GitHub. Там вы найдете много интересных и полезных проектов, связанных с искусственным интеллектом.

Напишите мне что-нибудь, чтобы начать диалог. Я буду рад общаться с вами и помогать вам. 😊`)
);
let lastBotMessage = "";
let textpol;
bot.on("message", async (ctx) => {
  const buttonText = Markup.button.callback;
  const userMessage = ctx.message.text;

  if (isYotube(userMessage)) {
    const loadingVideo = await ctx.reply("я разбираю видео 🎬");

    YoutubeTranscript.fetchTranscript(userMessage)
      .then((transcript) => {
        let textOnly = transcript.map((item) => item.text);
        let limit = textOnly.join(" ").substring(0, 4000);
        textpol =textOnly.join(" ").substring(0, 4555);

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
        ctx.reply("чтото нетак: " + error.message);
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
          buttonText("подробнее 🧐📚", "callback_data1"),
          buttonText("перевод 🌐", "callback_data2"),
        ],
      ])
    );
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
    const chatBotInstance = new ChatBot(cookie);
    await chatBotInstance.init();
    let loadingMessag = await ctx.reply("I am fulfilling your request🌐");
    lastBotMessage = await translateText(lastBotMessage, "en");
    ctx.editMessageText(lastBotMessage, {
      chat_id: ctx.chat.id,
      message_id: loadingMessag.message_id,
    });
  } else if (data === "callback_data3") {
    const chatBotInstance = new ChatBot(cookie);
    await chatBotInstance.init();
    const loadingMessag = await ctx.reply(
      "я пытаюсь пересказать дайте мне секунду 😓 "
    );
    const messageToBot = `Пожалуйста, перескажите текст на менее чем 500 символов как можно скорее. При этом, если в оригинальном тексте присутствуют нецензурные выражения, пожалуйста, замените их на культурные аналоги:${textpol}`;
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
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
