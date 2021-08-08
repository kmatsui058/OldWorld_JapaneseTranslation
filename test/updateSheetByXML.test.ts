import updateSheetsByXML, { getXML } from '@/updateSheetsByXML';
import { targets } from '@/main'
describe("updateSheetsByXML.ts", () => {
  for (const target of targets) {
    test(target, async () => {
      const entries = await getXML(target)
      entries.forEach(entry => {
        expect(typeof entry.zType[0]).toBe('string')
        expect(entry.zType.length).toBe(1)
        if (entry.English) {
          expect(typeof entry.English[0]).toBe('string')
          expect(entry.English.length).toBe(1)
        }
      })
    });
  }
});

describe("updateSheetsByXML.ts", () => {
  test("updateSheetsByXML", async () => {
    await updateSheetsByXML()
  });
});
