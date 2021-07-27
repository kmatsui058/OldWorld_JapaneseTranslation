import fs from 'fs/promises'
import path from 'path'

export const DIST_FOLDER = '../Translations/Japanese/'

export default async function writeXML(xml: string, target: string) {
  const xmlPath = path.resolve(__dirname, DIST_FOLDER, target)
  fs.writeFile(xmlPath, xml)
}
