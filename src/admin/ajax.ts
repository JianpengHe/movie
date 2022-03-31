import axios from 'axios'
type IAjax = (method: 'get' | 'post', url: string) => (body?: { [x: string]: any }) => Promise<any>
export const ajax: IAjax = (method, url) => body =>
  new Promise(resolve =>
    axios[method]('/admin_api' + url, body)
      .then(({ data }) => resolve(data))
      .catch(e => {
        location.href = 'login.html'
      })
  )
