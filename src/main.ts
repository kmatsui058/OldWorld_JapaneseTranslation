import credential from '@/credentials.json'
import { authorize } from './authrize';
import fetchSheetsData from './fetchSheetsData';
import sheetsToXML from './sheetsToXML';
import writeXML from './writeXML';
import fs from 'fs/promises'
import { TOKEN_PATH } from './authrize';

// If modifying these scopes, delete token.json.
export const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
export const targets = ['text-eventStory-change.xml', 'text-eventStoryTitle-change.xml', 'text-eventOption-change.xml']
// main()
export default async function main() {
  // Load client secrets from a local file.
  const auth = await authorize(credential);
  targets.forEach(async target => {
    await fetchSheetsData(auth, target)
      .catch(async (err: Error) => {
        if (err.message.includes('invalid_grant')) {
          await fs.unlink(TOKEN_PATH)
          return main()
        }
      })
      .then((structure) => {
        if (!structure) return
        const xml = sheetsToXML(structure)
        writeXML(xml, target)
      })
  })
}








