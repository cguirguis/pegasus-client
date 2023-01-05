import axios from 'axios';
import Cookies from 'universal-cookie'

const ACCESS_TOKEN_URL = "https://api.tdameritrade.com/v1/oauth2/token"
const APP_CLIENT_ID = "GGY2EMJ7SBKOCZAXKK3ULZBKMTSYZ4VC"
const REDIRECT_URL = "https://pegasus.cguirguis1.repl.co/tdameritrade"
const AUTH_COOKIE_NAME = "td-ameritrade-auth"

const cookies = new Cookies()

type AuthCookie = {
  access_token?: string
  refresh_token?: string
  expires: number
  expires_in: number
  refresh_token_expires: number
  refresh_token_expires_in: number
  scope?: string
  token_type?: string
}
export class TdaService {
  private accessToken?: string
  private refreshToken?: string
  private authCookie: AuthCookie | null

  constructor() {
    this.authCookie = cookies.get(AUTH_COOKIE_NAME)
    this.validateAuthentication()
  }

  clearAuthentication = () => {
    this.authCookie = null
    this.accessToken = undefined
    this.refreshToken = undefined
    cookies.remove(AUTH_COOKIE_NAME)
  }

  isAuthenticated = () => {
    return this.accessToken
  }

  validateAuthentication = () => {
    if (this.authCookie) {
      if (this.authCookie.refresh_token_expires < Date.now()) {
        // User needs to go through connection workflow all over again
        this.clearAuthentication()
      } else if (this.authCookie.expires < Date.now()) {
        // need to request a new access token token
        this.accessToken = undefined
        this.refreshToken = this.authCookie.refresh_token
        this.authCookie = { ...this.authCookie, access_token: undefined }
        cookies.set(AUTH_COOKIE_NAME, this.authCookie, { path: '/' })
      } else {
        this.accessToken = this.authCookie.access_token
        this.refreshToken = this.authCookie.refresh_token
        this.authCookie = this.authCookie
      }
    }
  }

  saveToken = (tokenData: AuthCookie) => {
    this.accessToken = tokenData.access_token
    tokenData.expires = Date.now() + tokenData.expires_in
    if (tokenData.refresh_token) {
      tokenData.refresh_token_expires = Date.now() + tokenData.refresh_token_expires_in
      this.refreshToken = tokenData.refresh_token
    }
    const authCookie = cookies.get(AUTH_COOKIE_NAME)
    cookies.set(AUTH_COOKIE_NAME, { ...authCookie, ...tokenData }, { path: '/' })
  }

  getToken = async (authCode: string) => {
    const requestParams = {
      grant_type: "authorization_code",
      access_type: "offline",
      code: authCode,
      client_id: APP_CLIENT_ID,
      redirect_uri: REDIRECT_URL,
    }
    return axios.post(ACCESS_TOKEN_URL, new URLSearchParams(requestParams)).then(response => {
      if (response.status === 200) {
        /* Response format: 
        { 
          "access_token": "", 
          "refresh_token": "",
          "expires_in": 1800, 
          "refresh_token_expires_in": 7776000, (3 months)
          "scope": "PlaceTrades AccountAccess MoveMoney",
          "token_type": "Bearer"
        }
         * this access_token is only good for 30 minutes; need to use
         * refresh_token to request new access_token before it expires
         */
        this.saveToken(response.data)
        setTimeout(() => {
          this.extendToken()
        }, 25 * 60 * 1000)
      }
    }).catch(err => {
      console.error(err)
    })
  }

  extendToken = async () => {
    const requestParams = {
      grant_type: "refresh_token",
      refresh_token: this.accessToken,
      client_id: APP_CLIENT_ID,
    }
    const data = axios.post(ACCESS_TOKEN_URL, new URLSearchParams(requestParams)).then(response => {
      // this refresh token is valid for 3 months
      if (response.status === 200) {
        /* Response format: 
        { 
          access_token: '', 
          expires_in: 1800, 
          token_type: "Bearer"
        }
        */
        this.saveToken(response.data)
      } else if (response.status === 401) {
        console.error('Failed to refresh access token.')
        this.validateAuthentication()
      }
    }).catch(err => {
      console.error(err)
    })
  }

  getAccounts = async (authCode: string) => {
    if (!this.isAuthenticated()) {
      await this.getToken(authCode)
    }
    return axios.get('https://api.tdameritrade.com/v1/accounts?fields=positions,orders', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    }).then(response => {
      if (response.status === 401) {
        // access_token is invalid; request new one
        this.validateAuthentication()
      } else {
        return response
      }
    })
  }
}

