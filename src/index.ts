import credential from '@/credentials.json'
import { authorize } from './authrize';
import fetchSheetsData from './fetchSheetsData';
import sheetsToXML from './sheetsToXML';
import writeXML from './writeXML';
// If modifying these scopes, delete token.json.
export const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

main()
export default async function main() {
  // Load client secrets from a local file.
  const auth = await authorize(credential);
  const targets = ['text-eventStory-change.xml', 'text-eventStoryTitle-change.xml', 'text-eventOption-change.xml']
  targets.forEach(async target => {
    const structure = await fetchSheetsData(auth, target)
    const xml = sheetsToXML(structure)
    writeXML(xml, target)
  })

}








