import { Telegraf, Markup } from "telegraf";
import { YoutubeTranscript } from "youtube-transcript";

export function isYoutube(userMessage) {
    const pattern = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/;
    return pattern.test(userMessage);
  }
  

export async function Ytube(ctx, userMessage) {
    const buttonText = Markup.button.callback;
    const loadingVideo = await ctx.reply("Я разбираю видео 🎬");

    return await YoutubeTranscript.fetchTranscript(userMessage)
        .then((transcript) => {
            let textOnly = transcript.map((item) => item.text);
            let limit = textOnly.join(" ").substring(0, 4000);
            const lastBotMessage = textOnly.join(" ").substring(0, 4555);

            ctx.telegram.editMessageText(
                ctx.chat.id,
                loadingVideo.message_id,
                null,
                limit,
                Markup.inlineKeyboard([
                    [buttonText("пересказать 🔁", "callback_data3")],
                ])
            );
            return lastBotMessage;
        })
        .catch((error) => {
            ctx.reply("Что-то пошло не так: " + error.message);
        });
}
