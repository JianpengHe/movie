import axios from 'axios'
type IAjax<T> = (url: string) => (body?: T) => Promise<any>

export const ajax: {
  Catch: (e: any) => void
  api: string
  get: IAjax<string>
  post: IAjax<{ [x: string]: any }>
  delete: IAjax<string>
  put: IAjax<{ [x: string]: any }>
} = {
  Catch: e => {
    location.href = 'login.html'
  },
  api: '/admin_api',
  get(url) {
    return body =>
      new Promise(resolve =>
        axios
          .get(this.api + url + '?' + body)
          .then(({ data }) => resolve(data))
          .catch(this.Catch)
      )
  },
  delete(url) {
    return body =>
      new Promise(resolve =>
        axios
          .delete(this.api + url + '?' + body)
          .then(({ data }) => resolve(data))
          .catch(this.Catch)
      )
  },
  post(url) {
    return body =>
      new Promise(resolve =>
        axios
          .post(this.api + url, body)
          .then(({ data }) => resolve(data))
          .catch(this.Catch)
      )
  },
  put(url) {
    return body =>
      new Promise(resolve =>
        axios
          .put(this.api + url, body)
          .then(({ data }) => resolve(data))
          .catch(this.Catch)
      )
  },
}
// export const ajax: IAjax = (method, url) => body =>
//   new Promise(resolve =>
//     axios[method]('/admin_api' + url, body)
//       .then(({ data }) => resolve(data))
//       .catch(e => {
//         location.href = 'login.html'
//       })
//   )
