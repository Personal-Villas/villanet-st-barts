import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export const publicApi = {
  get: async (path: string) => {
    const res = await axios.get(`${BASE_URL}${path}`)
    return res.data
  },
  post: async (path: string, data: unknown) => {
    const res = await axios.post(`${BASE_URL}${path}`, data)
    return res.data
  }
}