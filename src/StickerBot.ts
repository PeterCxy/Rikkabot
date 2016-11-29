import * as fs from "fs"
import { Telegram } from "./api/Telegram"

const RIKKA = "RikkaW"
const STAT_FILE = "./data/statistics.json"
const SAVE_INTERVAL = 60 * 1000

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

if (fs.existsSync(STAT_FILE)) {
  statistics = JSON.parse(fs.readFileSync(STAT_FILE, "utf8"))
  setTimeout(saveLoop, SAVE_INTERVAL)
}

function saveLoop() {
  fs.writeFile(STAT_FILE, JSON.stringify(statistics), () => {
    setTimeout(saveLoop, SAVE_INTERVAL)
  })
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
        if (statistics.stickers[message.sticker.file_id] == null) {
          statistics.stickers[message.sticker.file_id] = 0
        }
        statistics.stickers[message.sticker.file_id]++
      }
    } else {
      // Activate by some threshold algorithm
    }
  }
}
