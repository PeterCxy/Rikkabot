import { Telegram } from "./api/Telegram"

const RIKKA = "RikkaW"

interface Stat {
  total: number
  stickers: StickerSet
}
interface StickerSet {
  [key: string]: number
}

let statistics: Stat = {
  total: 0,
  stickers: {}
}

export namespace StickerBot {
  export function processMessage(message: Telegram.Message) {
    if (message.from == null) {
      return
    }
    if (message.from.username == null) {
      return
    }
    if (message.chat.id == message.from.id) {
      return // DO NOT accept private chats
    }
    if (message.from.username === RIKKA) {
      if (message.sticker != null) {
        statistics.total++
        if (statistics[message.sticker.file_id] == null) {
          statistics[message.sticker.file_id] = 0
        }
        statistics[message.sticker.file_id]++
        // TODO: Write to file
      }
    } else {
      // Activate by some threshold algorithm
    }
  }
}
