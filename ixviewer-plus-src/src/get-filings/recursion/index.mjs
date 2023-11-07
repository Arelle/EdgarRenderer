import fs from "fs";
import * as cheerio from "cheerio";
export class Recursion {
  constructor() {}
  async init() {
    const data1 = await this.findAllNestedDirectories(
      `./src/assets/filings/important`
    );

    const data2 = await this.findAllNestedDirectories(`./src/assets/filings`);

    await this.writeFilesToJSON({ ...data1, ...data2 });
  }

  async findAllNestedDirectories(input) {
    const returnObject = {};
    const topDirectories = fs.readdirSync(input);

    for await (const current of topDirectories) {
      if (
        current !== `important` &&
        fs.lstatSync(`${input}/${current}`).isDirectory()
      ) {
        let obj = {
          version: ``,
          important: false,
          instance_file: ``,
          multiple_instance: false,
          contextrefs: 0,
          name: ``,
          form: ``,
          local: [],
          sec: [],
        };
        const nestedDirectory = fs.readdirSync(input + "/" + current);
        if (nestedDirectory.indexOf("MetaLinks.json") >= 0) {
          obj = await this.getMetaLinks(`${input}/${current}`, obj);

          if (!input.includes("important")) {
            obj = await this.getFilings(`${input}/${current}`, obj);
          } else {
            obj.sec = [];
          }

          obj = await this.getContextRefs(`${input}/${current}`, obj);

          returnObject[current] = obj;
        }
      }
    }
    return returnObject;
  }

  async getMetaLinks(input, obj) {
    const meta = fs.readFileSync(`${input}/MetaLinks.json`, `utf-8`);

    const metaLinks = JSON.parse(meta);

    obj.version = metaLinks.version;

    obj.important = input.includes("important");

    obj.instance_file = Object.keys(metaLinks.instance)[0];

    if (Object.keys(metaLinks.instance).length > 1) {
      obj.multiple_instance = true;
    }

    if (obj.instance_file.includes(" ")) {
      obj.local = obj.instance_file.split(" ").map((current) => {
        return `${input}/${current}`;
      });
    } else {
      obj.local = [`${input}/${obj.instance_file}`];
    }
    return obj;
  }

  async getFilings(input, obj) {
    const filings = fs.readFileSync(`${input}/filing.json`, `utf-8`);
    const filingsInfo = JSON.parse(filings);
    obj.sec = filingsInfo.html;
    return obj;
  }

  async getContextRefs(input, obj) {
    for await (const current of obj.local) {
      const xhtml = fs.readFileSync(current, `utf-8`);

      let $ = cheerio.load(xhtml, {});
      obj.contextrefs += $(`[contextRef]`).length;
      if (!obj.name) {
        obj.name = $(`[name='dei:EntityRegistrantName']`).first().text().trim();
      }
      if (!obj.form) {
        obj.form = $(`[name='dei:DocumentType']`).first().text().trim();
      }
    }
    return obj;
  }

  async writeFilesToJSON(input) {
    input = JSON.stringify(input);
    fs.unlinkSync("./src/ts/development/input.json");
    fs.unlinkSync("./cypress/fixtures/filings/index.json");

    fs.writeFileSync("./src/ts/development/input.json", input, "utf8");
    fs.writeFileSync("./cypress/fixtures/filings/index.json", input, "utf8");
  }
}
