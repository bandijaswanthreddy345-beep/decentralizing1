import { Web3Auth, WEB3AUTH_NETWORK } from '@web3auth/modal'

let web3authInstance = null

export async function getWeb3Auth() {
  if (web3authInstance) return web3authInstance

  web3authInstance = new Web3Auth({
    clientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID,
    web3AuthNetwork:
      WEB3AUTH_NETWORK[import.meta.env.VITE_WEB3AUTH_NETWORK] ||
      WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  })

  await web3authInstance.init()
  return web3authInstance
}

export async function loginWithWeb3Auth() {
  const web3auth = await getWeb3Auth()
  await web3auth.connect()

  const userInfo = await web3auth.getUserInfo()
  const idToken = userInfo?.idToken

  if (!idToken) {
    throw new Error('Web3Auth did not return an idToken.')
  }

  return { idToken, userInfo }
}

export async function logoutWeb3Auth() {
  if (web3authInstance?.connected) {
    await web3authInstance.logout()
  }
}