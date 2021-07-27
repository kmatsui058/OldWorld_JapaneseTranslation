import fs from 'fs/promises'
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import credential from '@/credentials.json'
import { getNewToken } from './getNewToken';
export const TOKEN_PATH = 'token.json'
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export async function authorize(credentials: typeof credential): Promise<OAuth2Client> {
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  // Check if we have previously stored a token.
  await fs.readFile(TOKEN_PATH)
    .then(token => {
      oAuth2Client.setCredentials(JSON.parse(token as unknown as string))
    })
    .catch(async err => {
      await getNewToken(oAuth2Client)
    })
  return oAuth2Client
}
