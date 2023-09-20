import fetch from "node-fetch";
import xml2js from "xml2js";
export class Rss {
  url;
  constructor(url) {
    this.url = url;
  }

  async init() {
    const xml = await this.fetch();
    if (xml) {
      const json = await this.setJSON(xml);
      const finalData = this.getInline(json);
      return finalData;
    }
  }

  async fetch() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const response = await fetch(this.url, {
      method: `get`,
      headers: {
        "User-Agent":
          "SEC IXViewer testing prototype/0.0.1 (MYSERVER; Linux) node-fetch",
      },
    });
    let successful = true;
    if (response.status !== 200) {
      successful = false;
      console.log(
        `We are unable to get the URL ${this.url} with a status of: ${response.status}`
      );
    }
    if (successful) {
      return await response.text();
    }
  }

  async setJSON(xml) {
    const parser = new xml2js.Parser({
      normalizetags: true,
      explicitRoot: false,
      explicitArray: false,
      mergeAttrs: true,
    });
    return await new Promise((resolve, reject) => {
      parser.parseString(xml, (error, result) => {
        if (error) {
          console.log(error);
        }
        resolve(result.channel.item);
      });
    });
  }

  getInline(json) {
    const arrayOfFilings = json
      .map((current) => {
        let instance = current["edgar:xbrlFiling"][`edgar:xbrlFiles`][
          `edgar:xbrlFile`
        ][0]["edgar:url"].substr(
          0,
          current["edgar:xbrlFiling"][`edgar:xbrlFiles`][`edgar:xbrlFile`][0][
            "edgar:url"
          ].lastIndexOf("/")
        );
        instance = `${instance}/${current["edgar:xbrlFiling"][
          `edgar:xbrlFiles`
        ][`edgar:xbrlFile`][0]["edgar:file"].replace(`.htm`, `_htm.xml`)}`;

        const filing = {
          meta: `${current.guid.substr(
            0,
            current.guid.lastIndexOf("/")
          )}/MetaLinks.json`,
          summary: `${current.guid.substr(
            0,
            current.guid.lastIndexOf("/")
          )}/FilingSummary.xml`,
          instance: instance,
          id: current["edgar:xbrlFiling"]["edgar:accessionNumber"],
          html: current["edgar:xbrlFiling"][`edgar:xbrlFiles`][`edgar:xbrlFile`]
            .map((element) => {
              if (element.hasOwnProperty(`edgar:inlineXBRL`)) {
                return element["edgar:url"];
              }
            })
            .filter(Boolean),
          filing_inline: current["edgar:xbrlFiling"][`edgar:xbrlFiles`][
            `edgar:xbrlFile`
          ].some((element) => {
            return element.hasOwnProperty(`edgar:inlineXBRL`);
          }),
        };
        return filing;
      })
      .filter((element) => element.filing_inline);
    return arrayOfFilings;
  }
}
