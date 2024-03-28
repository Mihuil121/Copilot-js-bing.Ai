import axios from 'axios';
import fs from 'fs';
import textract from 'textract';
import { Markup } from 'telegraf';

export async function Document(ctx, chatStates) {
  const buttonText = Markup.button.callback;
  const fileId = ctx.message.document.file_id;
  const fileLink = await ctx.telegram.getFileLink(fileId);

  try {
    const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const filePath = `./${ctx.message.document.file_name}`;

    await fs.writeFileSync(filePath, buffer);

    const lastBotMessage = await new Promise((resolve, reject) => {
      textract.fromFileWithPath(filePath, (error, text) => {
        if (error) {
          reject(error);
        } else {
          resolve(text);
        }
      });
    });

    if (lastBotMessage.length > 4990) {
      ctx.reply('Текст превышает 4990 символов.');
    } else {
      chatStates.set(ctx.chat.id, { text: lastBotMessage });

      await ctx.reply(lastBotMessage, Markup.inlineKeyboard([
        [buttonText('копировать', 'callback_data4'), buttonText('пересказать 🔁', 'callback_data3')],
        [buttonText("перевод 🌐", "callback_data2"),]
      ]));
    }

    fs.unlink(filePath, (err => {
      if (err) {
        console.error(err);
      }
    }));

    return lastBotMessage;
  } catch (axiosError) {
    console.error(axiosError);
    ctx.reply('Произошла ошибка при получении файла.');
    throw axiosError;
  }
}
