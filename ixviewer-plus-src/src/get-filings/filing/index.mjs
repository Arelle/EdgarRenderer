import fs from "fs";
import fse from "fs-extra";
import fetch from "node-fetch";
export class Filing {
  filings;
  constructor(filings) {
    this.filings = filings;
  }

  async init() {
    let index = 1;
    await this.copyImportantFilings();
    for await (const filing of this.filings) {
      // we only GET the filing if the directory of filing.id does NOT exsist
      try {
        //const exists = await fs.access(`./filings/${filing.id}`);
        const exists = await fs.promises.lstat(
          `./src/assets/filings/${filing.id}`
        );
        if (exists.isDirectory()) {
          console.log(`Already got: ${filing.id}`);
          index++;
        }
      } catch (error) {
        console.log(
          `Getting info (${index}/${this.filings.length}) for: ${filing.id}`
        );
        const meta = await this.fetch(filing.meta);
        const summary = await this.fetch(filing.summary);
        const instance = await this.fetch(filing.instance);
        let html = [];
        for await (const htmlFiles of filing.html) {
          html[html.length] = {
            data: await this.fetch(htmlFiles),
            file: htmlFiles,
          };
        }
        if (!instance) {
          console.log(
            `Skipping (Instance URL not what we expected): ${filing.id}`
          );
        } else {
          await this.writeToFS(filing, meta, summary, instance, html);
        }
        index++;
      }
    }
  }

  async fetch(url) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    const response = await fetch(url, {
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
    } else {
      return false;
    }
  }

  async writeToFS(filing, meta, summary, instance, html) {
    fs.mkdir(
      `./src/assets/filings/${filing.id}`,
      { recursive: true },
      (error) => {
        if (error) {
          throw error;
        }

        //write the JSON file (that holds simple URLs)
        fs.writeFile(
          `./src/assets/filings/${filing.id}/filing.json`,
          JSON.stringify(filing),
          (error) => {
            if (error) {
              throw error;
            }
          }
        );

        // write the MetaLinks file
        fs.writeFile(
          `./src/assets/filings/${filing.id}/MetaLinks.json`,
          meta,
          (error) => {
            if (error) {
              throw error;
            }
          }
        );

        // write the FilingSummary file
        fs.writeFile(
          `./src/assets/filings/${filing.id}/FilingSummary.xml`,
          summary,
          (error) => {
            if (error) {
              throw error;
            }
          }
        );

        //write the XML Instance file
        const instanceArray = filing.instance.split("/");
        fs.writeFile(
          `./src/assets/filings/${filing.id}/${
            instanceArray[instanceArray.length - 1]
          }`,
          instance,
          (error) => {
            if (error) {
              throw error;
            }
          }
        );

        //write the HTML file(s)
        for (const htmlFiles of html) {
          const htmlArray = htmlFiles.file.split("/");
          fs.writeFile(
            `./src/assets/filings/${filing.id}/${
              htmlArray[htmlArray.length - 1]
            }`,
            htmlFiles.data,
            (error) => {
              if (error) {
                throw error;
              }
            }
          );
        }
      }
    );
  }

  async copyImportantFilings() {
    const copyDirectoy = async (source, destination) => {
      fse.copy(source, destination);
    };

    await copyDirectoy(
      `./src/assets/important-filings/`,
      `./src/assets/filings/`
    );
  }
}
