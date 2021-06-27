import { sheetsToXML } from './sheetsToXML'

declare const global: {
  [x: string]: any;
}

global.sheetsToXML = function () {
  return sheetsToXML()
}
