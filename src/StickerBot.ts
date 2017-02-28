import * as fs from "fs"
import { Telegram } from "./api/Telegram"
import { Observable, Observer } from "rxjs/Rx"

const RIKKA = "RikkaW"
const TESTER = process.env.RIKKA_BOT_DEBUG_USER
const STAT_FILE = "./data/statistics.json"
const SAVE_INTERVAL = 60 * 1000
const THRESHOLD = 200
const DELAY_BASE = 1000
const DELAY_RANGE = 400

interface Stat {
  total: number
  stickers: StickerSet
}
interface StickerSet {
  [key: string]: number
}

// Record the activation level for each group
// If threshold reached, send a sticker and reset it to 0
interface GroupStatus {
  [key: number]: number
}

let statistics: Stat = {
  total: 0,
  stickers: {}
}
let groupStatus: GroupStatus = {}

if (fs.existsSync(STAT_FILE)) {
  statistics = JSON.parse(fs.readFileSync(STAT_FILE, "utf8"))
}

setTimeout(saveLoop, SAVE_INTERVAL)

function saveLoop() {
  fs.writeFile(STAT_FILE, JSON.stringify(statistics), () => {
    setTimeout(saveLoop, SAVE_INTERVAL)
  })
}

function chooseSticker(): Observable<string> {
  let randNum = Math.random() * statistics.total
  let sum = 0
  return Observable.create((observer: Observer<string>) => {
    Object.keys(statistics.stickers).forEach((key) => {
      if (sum >= randNum) return
      sum += statistics.stickers[key]
      if (sum >= randNum) {
        observer.next(key)
        observer.complete()
      }
    })

    if (sum < randNum) observer.error(new Error("No sticker chosen"))
  })
}

export namespace StickerBot {
  export function processMessage(tg: Telegram, message: Telegram.Message) {
    if (message.date < Date.now() / 1000 - 60) {
      return
    }
    if (message.from == null) {
      return
    }
    if (message.from.username == null) {
      return
    }
    if (message.chat.id == message.from.id) {
      return // DO NOT accept private chats
    }
    if (message.from.username === RIKKA || (TESTER != null && message.from.username === TESTER)) {
      if (message.sticker != null) {
        statistics.total++
        if (statistics.stickers[message.sticker.file_id] == null) {
          statistics.stickers[message.sticker.file_id] = 0
        }
        statistics.stickers[message.sticker.file_id]++
      }
    }
    if (message.text != null) {
      if (groupStatus[message.chat.id] == null) {
        groupStatus[message.chat.id] = 0
      }
      groupStatus[message.chat.id] += message.text.length
    }

    if (groupStatus[message.chat.id] >= THRESHOLD) {
      groupStatus[message.chat.id] = 0
      chooseSticker()
        .delay(Math.random() * DELAY_RANGE * 2 + DELAY_BASE - DELAY_RANGE)
        .flatMap((sticker) => tg.sendSticker(message.chat.id, sticker))
        .subscribe(null, (err) => console.log(err))
    }
  }
}
