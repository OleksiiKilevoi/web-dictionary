import Telegraf from 'telegraf';
// import { TelegrafContext } from 'telegraf/typings/context';

class BotLogger {
  // private bot: Telegraf<TelegrafContext>;
  // private chatId: string;

  private static bot = new Telegraf(process.env.BOT_TOKEN);
  private static chatId = process.env.BOT_GROUP_ID!;

  public static log = (message: string) => {
    BotLogger.bot.telegram
      .sendMessage(BotLogger.chatId, message)
      .catch((e: Error) => console.error(e));
  };
}

export default BotLogger;
