import { google, sheets_v4 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import fs from 'fs/promises'
import xml2js from 'xml2js'
import path from 'path'
import credential from '@/credentials.json'
import { authorize } from './authrize';
import { TOKEN_PATH } from './authrize';
import { targets } from '@/main'

export const sheetID = '1axY7ktG7bJC-MaQD4BsnZ6EWRRb6thkHoeQSlsZQx5k'

export default async function updateSheetsByXML() {
  // Load client secrets from a local file.
  const auth = await authorize(credential);
  targets.forEach(async target => {
    console.log({ target })
    await updateEachFile(auth, target)
      .catch(async (err: Error) => {
        if (err.message.includes('invalid_grant')) {
          await fs.unlink(TOKEN_PATH)
          return updateSheetsByXML()
        }
      })
  })
}


/**
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
export async function updateEachFile(auth: OAuth2Client, targetSheet: string): Promise<void> {
  console.log('----updateEachFile----')
  const sheets = google.sheets({ version: 'v4', auth })
  return await new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: sheetID,
        range: targetSheet
      },
      async (err, res) => {
        console.log('handle api response')
        console.log({ err })

        if (err || !res) {
          reject(err);
          return
        }
        console.log('after rejection')

        const rows = res.data.values
        const xml = await getXML(targetSheet)
        const xmlEntries = await getFormattedData(xml)
        if (rows && rows.length) {
          console.log('handle rows')

          const titleIndex = rows.findIndex(row => row.find(col => col === 'zType'))
          const zTypeIndex = rows[titleIndex].findIndex(row => row.includes('zType'))
          const englishTextIndex = rows[titleIndex].findIndex(row => row.includes('English'))
          const zTypeses: string[] = []
          rows.forEach((row, index) => {
            if (index > titleIndex) {
              const zType = row[zTypeIndex]
              if (zType) {
                zTypeses.push(zType)
              }
            }
          })
          const newData: EntryData[] = []
          xmlEntries.forEach(entry => {
            const test = zTypeses.includes(entry.zType)
            if (!test) { newData.push(entry) }
          })
          await setNewData(newData, zTypeIndex, englishTextIndex, sheets, targetSheet)
          resolve()
        } else {
          console.log('No data found.')
        }
      }
    )
  })
}

export interface ReadXMLDataStructure {
  Root: {
    Entry: TextXMLEntry[]
  }
}

export interface TextXMLEntry { zType: string[], English?: string[] }

export interface EntryData { zType: string, English: string }

export async function getXML(sheetName: string): Promise<TextXMLEntry[]> {
  const originalFileName = sheetName.replace('-change', '')
  const xmlText = await fs.readFile(path.resolve(__dirname, `../ref/XML/${originalFileName}`))
  const xmlData = await new Promise<ReadXMLDataStructure>((resolve, reject) => xml2js.parseString(xmlText, (err, result) => {
    if (err) {
      reject(err)
    } else {
      resolve(result)
    }
  }))
  const result = xmlData.Root.Entry
  result.shift()
  return result
}


export async function getFormattedData(data: TextXMLEntry[]): Promise<EntryData[]> {
  return data.map(entry => {
    return {
      zType: entry.zType[0],
      English: entry.English ? entry.English[0] : ''
    }
  })
}

export async function setNewData(newData: EntryData[], zTypeIndex: number, englishTextIndex: number, sheets: sheets_v4.Sheets, targetSheet: string) {
  const values = newData.map(entry => {
    const result: string[] = []
    result[zTypeIndex] = entry.zType
    result[englishTextIndex] = entry.English
    return result
  })
  const request: sheets_v4.Params$Resource$Spreadsheets$Values$Append = {
    spreadsheetId: sheetID,
    range: `${targetSheet}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values,
    },
  }
  await sheets.spreadsheets.values.append(request).catch(err => console.log(err.errors))
}
