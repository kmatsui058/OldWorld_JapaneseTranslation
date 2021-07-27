import builder from 'xmlbuilder';

export interface XMLDataStructure {
  zType: string
  translation: string
}

export default function sheetsToXML(data: XMLDataStructure[]): string {
  const root = builder.create('Root', { encoding: 'utf-8' });
  data.forEach(item => {
    const entry = root.ele('Entry')
    entry.ele('zType', undefined, item.zType)
    entry.ele('Translation', undefined, item.translation)
  })
  const xml = root.end({ pretty: true });
  return xml
}
