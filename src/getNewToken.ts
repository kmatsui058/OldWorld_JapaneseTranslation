import fs from 'fs/promises'
import readline from 'readline'
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { TOKEN_PATH } from './authrize';
// If modifying these scopes, delete token.json.
export const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
export async function getNewToken(oAuth2Client: OAuth2Client) {
  await new Promise<void>((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    })
    console.log('Authorize this app by visiting this url:', authUrl)
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close()
      oAuth2Client.getToken(code, async (err, token) => {
        if (err || !token) return console.error('Error while trying to retrieve access token', err)
        oAuth2Client.setCredentials(token)
        // Store the token to disk for later program executions
        await fs.writeFile(TOKEN_PATH, JSON.stringify(token))
          .catch((err) => {
            if (err) {
              reject(err);
              return console.error(err)
            }
          })
        console.log('Token stored to', TOKEN_PATH)
        resolve()
      })
    })
  })
}

