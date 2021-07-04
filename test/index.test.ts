import { createSheets } from "../src/createSheets";

describe("example.ts test", () => {
  test("createDocument", () => {
    DocumentApp.create = jest.fn().mockImplementation(name => {
      return {
        getBody: jest.fn().mockImplementation(() => {
          return {
            appendParagraph: jest.fn().mockImplementation(text => { })
          };
        }),
        getId: jest.fn().mockReturnValue("1234567890")
      };
    });
    const expected = createDocument();
    expect(expected).toBe("1234567890");
  });
});
