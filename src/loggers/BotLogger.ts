import FileLogger from '@/loggers/FileLogger';
import Telegraf from 'telegraf';

class BotLogger {
  private bot: Telegraf<any>;
  private chatId: string;

  public constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN);
    this.chatId = process.env.BOT_GROUP_ID;
  }

  public sendMessage = async (message: string) => {
    try {
      await this.bot.telegram.sendMessage(this.chatId, message);
    } catch (e) {
      FileLogger.e(e);
      console.log(e.message);
    }
  };
}

export default BotLogger;
