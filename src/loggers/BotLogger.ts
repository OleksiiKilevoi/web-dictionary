import Telegraf from 'telegraf';

class BotLogger {
  private static bot = new Telegraf(process.env.BOT_TOKEN || '1470529336:AAE-rGVOG-xbuuOo-48jY_exyq5IILKUNt8');
  private static chatId = process.env.BOT_GROUP_ID! || '24362593';

  public static log = (message: string) => {
    BotLogger.bot.telegram
      .sendMessage(BotLogger.chatId, message)
      .catch((e: Error) => console.error(e));
  };
}

export default BotLogger;
