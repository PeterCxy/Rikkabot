import { Telegram } from "./api/Telegram"
import { Observable } from "rxjs/Rx"
import { StickerBot } from "./StickerBot"

setImmediate(() => {
  let {token, botName} = require("../token.json")
  msgLoop(new Telegram(token, botName))
})

function msgLoop(tg: Telegram, offset: number = 0) {
  let hadMessage = false
  tg.getUpdates(offset)
    .flatMap((updates) => Observable.from(updates))
    .map((update) => {
      if (update.message != null) {
        StickerBot.processMessage(tg, update.message)
      }
      return update.update_id
    })
    .takeLast(1)
    .subscribe((id) => {
      hadMessage = true
      setTimeout(() => msgLoop(tg, id + 1), 100)
    }, (err) => {
      console.log(err)
      setTimeout(() => msgLoop(tg, offset), 1000)
    }, () => {
      if (!hadMessage) {
        setTimeout(() => msgLoop(tg, offset), 1000)
      }
    })
}
