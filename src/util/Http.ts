import * as request from "request"
import { IncomingMessage } from "http"
import { Observable, Observer } from "rxjs/Rx"

/*
 * Utilities to communicate with Telegram API server
 */
export namespace Http {
  export function get<T>(url: string, qs?: any): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      request({
        method: 'GET',
        url: url,
        qs: qs,
      }, (err: Error, res: IncomingMessage, body: string) => {
        if (err != null) {
          observer.error(err)
        } else {
          let result = JSON.parse(body)

          // Process Telegram responses
          if (!result.ok) {
            observer.error(new Error(result.description))
          } else {
            observer.next(<T>result.result)
            observer.complete()
          }
        }
      })
    })
  }

  export function post<T>(url: string, form: any): Observable<T> {
    return Observable.create((observer: Observer<T>) => {
      request({
        method: 'POST',
        url: url,
        form: form
      }, (err: Error, res: IncomingMessage, body: string) => {
        if (err != null) {
          observer.error(err)
        } else {
          let result = JSON.parse(body)
          if (!result.ok) {
            observer.error(new Error(result.description))
          } else {
            observer.next(<T>result.result)
            observer.complete()
          }
        }
      })
    })
  }
}
