import { Telegram } from "./api/Telegram"
import { Observable } from "rxjs/Rx"

setImmediate(() => {
  let {token, botName} = require("../token.json")
  msgLoop(new Telegram(token, botName))
})

function msgLoop(tg: Telegram, offset: number = 0) {
  tg.getUpdates(offset)
    .flatMap((updates) => Observable.from(updates))
    .map((update) => {
      if (update.message != null) {

      }
      return update.update_id
    })
    .takeLast(1)
    .subscribe((id) => {
      setImmediate(() => msgLoop(tg, id + 1))
    }, (err) => {
      console.log(err)
      setImmediate(() => msgLoop(tg, offset))
    })
}
