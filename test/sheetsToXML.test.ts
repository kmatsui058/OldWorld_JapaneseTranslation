import sheetsToXML, { XMLDataStructure } from '@/sheetsToXML';

const testData: XMLDataStructure[] = [
  {
    zType: 'TEXT_EVENTSTORY_PLAYER_TRUCE_HOSTAGE',
    translation: `{PLAYER-0}からの全権大使が我が国の宮廷を訪れました。大使は礼儀正しく、謙遜した態度です。

    大使の伝えるところによると、{PLAYER-0,3}は捕虜の返還を条件に停戦を求めているようです。`
  }
]

const result = `<?xml version="1.0" encoding="utf-8"?>
<Root>
  <Entry>
    <zType>TEXT_EVENTSTORY_PLAYER_TRUCE_HOSTAGE</zType>
    <Translation>{PLAYER-0}からの全権大使が我が国の宮廷を訪れました。大使は礼儀正しく、謙遜した態度です。

    大使の伝えるところによると、{PLAYER-0,3}は捕虜の返還を条件に停戦を求めているようです。</Translation>
  </Entry>
</Root>`
describe("sheetsToXML.ts", () => {
  test("sheetsToXML", () => {
    expect(sheetsToXML(testData)).toBe(result)
  });
});
