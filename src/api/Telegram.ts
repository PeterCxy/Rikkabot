import { Http } from "../util/Http"
import { Observable } from "rxjs/Rx"

const BASE_URL = "https://api.telegram.org/bot"
const TIMEOUT = 300

export class Telegram {
  private token: string = ""
  private botName: string = ""
  constructor(token: string, botName: string) {
    this.token = token
    this.botName = botName
  }

  /*
   * Get the HTTPS API url for a method
   */
  private getUrl(method: string): string {
    return `${BASE_URL}${this.token}/${method}`
  }

  /*
   * Send GET
   */
  private get<T>(method: string, qs?: any): Observable<T> {
    return Http.get<T>(this.getUrl(method), qs)
  }

  /*
   * Send POST
   */
  private post<T>(method: string, form: string): Observable<T> {
    return Http.post<T>(this.getUrl(method), form)
  }

  /*
   * Get a sequence of new updates
   */
  @get({ timeout: 300 }, "offset")
  getUpdates(offset?: number): Observable<Telegram.Update[]> {
    return null
  }

  /*
   * Rikka sends Stickers
   */
  @post("chat_id", "sticker")
  sendSticker(chat_id: number, sticker: string): Observable<Telegram.Message> {
    return null
  }
}

export namespace Telegram {
  export interface Update {
    update_id: number
    message?: Message
  }
  export interface Message {
    message_id: number
    date: number
    text?: string
    from?: User
    sticker?: Sticker
    chat: Chat
  }
  export interface User {
    id: number
    first_name: string
    last_name?: string
    username?: string
  }
  export interface Chat {
    id: number
  }
  export interface Sticker {
    file_id: string
  }
}

interface QS {
  // Define the query string type
  [key: string]: any
}
type FORM = QS

function get(...paramNames: (string | QS)[]): MethodDecorator {
  let defaultQs: QS = {}
  if (paramNames.length > 0 && typeof paramNames[0] != "string") {
    defaultQs = <QS> paramNames[0]
    paramNames.splice(0, 1)
  }
  return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    descriptor.value = function (...params: any[]) {
      let qs: QS = Object.assign({}, defaultQs)
      paramNames.forEach((key, index) => {
        if (index < params.length) {
          qs[<string>key] = params[index]
        }
      })
      return this.get(propertyKey, qs)
    }
    return descriptor
  }
}

function post(...paramNames: (string | FORM)[]): MethodDecorator {
  let defaultForm: FORM = {}
  if (paramNames.length > 0 && typeof paramNames[0] != "string") {
    defaultForm = <FORM> paramNames[0]
    paramNames.splice(0, 1)
  }
  return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    descriptor.value = function (...params: any[]) {
      let form: FORM = Object.assign({}, defaultForm)
      paramNames.forEach((key, index) => {
        if (index < params.length) {
          form[<string>key] = params[index]
        }
      })
      return this.get(propertyKey, form)
    }
    return descriptor
  }
}
