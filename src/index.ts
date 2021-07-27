import fs from 'fs/promises'
import readline from 'readline'
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import credential from '@/credentials.json'
// If modifying these scopes, delete token.json.
export const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
export const TOKEN_PATH = 'token.json'
main()
export default async function main() {
  // Load client secrets from a local file.
  const auth = await authorize(credential);
  listMajors(auth)
}





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

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
export async function getNewToken(oAuth2Client: OAuth2Client) {
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
    oAuth2Client.getToken(code, (err, token) => {
      if (err || !token) return console.error('Error while trying to retrieve access token', err)
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token))
        .catch((err) => {
          if (err) return console.error(err)
          console.log('Token stored to', TOKEN_PATH)
        })
    })
  })
}



/**
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
export function listMajors(auth: OAuth2Client) {
  const sheets = google.sheets({ version: 'v4', auth })
  sheets.spreadsheets.values.get(
    {
      spreadsheetId: '1axY7ktG7bJC-MaQD4BsnZ6EWRRb6thkHoeQSlsZQx5k',
      range: 'text-eventStory-change.xml!A:E'
    },
    (err, res) => {
      if (err || !res) return console.log('The API returned an error: ' + err)
      const rows = res.data.values
      if (rows && rows.length) {
        const titleIndex = rows.findIndex(row => row.find(col => col === 'zType'))
        const zTypeIndex = rows[titleIndex].findIndex(row => row.includes('zType'))
        const machineTextIndex = rows[titleIndex].findIndex(row => row.includes('機械翻訳'))
        const japaneseTextIndex = rows[titleIndex].findIndex(row => row.includes('Japanese'))
        rows.forEach((row, index) => {
          if (index > titleIndex) {
            const zType = row[zTypeIndex]
            const machineText = row[machineTextIndex]
            const japaneseText = row[japaneseTextIndex]
            if (index < 10) {
              console.log({ zType })
              console.log({ machineText })
              console.log({ japaneseText })
            }
          }
        })
      } else {
        console.log('No data found.')
      }
    }
  )
}
