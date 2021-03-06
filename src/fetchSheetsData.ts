import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { XMLDataStructure } from './sheetsToXML';
/**
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
export default async function fetchSheetsData(auth: OAuth2Client, targetSheet: string): Promise<XMLDataStructure[]> {
  const sheets = google.sheets({ version: 'v4', auth })
  return await new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: '1axY7ktG7bJC-MaQD4BsnZ6EWRRb6thkHoeQSlsZQx5k',
        range: targetSheet
      },
      (err, res) => {
        if (err || !res) {
          reject(err);
          return
        }
        const rows = res.data.values
        if (rows && rows.length) {
          const titleIndex = rows.findIndex(row => row.find(col => col === 'zType'))
          const zTypeIndex = rows[titleIndex].findIndex(row => row.includes('zType'))
          const machineTextIndex = rows[titleIndex].findIndex(row => row.includes('機械翻訳'))
          const japaneseTextIndex = rows[titleIndex].findIndex(row => row.includes('Japanese'))
          const result: XMLDataStructure[] = []
          rows.forEach((row, index) => {
            if (index > titleIndex) {
              const zType = row[zTypeIndex]
              const machineText = (row[machineTextIndex] as string).replace(/\{.*?\}/g, sentence => { return sentence.toUpperCase() }).replace(/(リンク（)(.*?)(）)/, (p1, p2, p3) => { return `link(${p3.toUpperCase()})` })
              const japaneseText = row[japaneseTextIndex]
              if (zType) {
                result.push({
                  zType,
                  translation: japaneseText || machineText
                })
              }
            }
          })
          resolve(result)
        } else {
          console.log('No data found.')
        }
      }
    )
  })

}
