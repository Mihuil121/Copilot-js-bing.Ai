import Tesseract from "tesseract.js";

export async function Photo (ctx){
    try{
        const photo =  ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const photoLink =await ctx.telegram.getFileLink(photo)
    
        Tesseract.recognize(
          photoLink.href,
          'eng+rus',
          {logger:(m)=>console.log(m)} // исправьте опечатку в слове 'logger'
        ).then(({data:{text}})=>{
          const lastBotMessage=text;
          ctx.reply(`Вот текст с фото: ${lastBotMessage}`)
        })
      } catch(err){
        console.error('Ошибка: ',err)
        ctx.reply("Подождите, что-то пошло не так.")
      }
}
