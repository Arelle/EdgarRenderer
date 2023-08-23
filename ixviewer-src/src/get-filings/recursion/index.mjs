import fs from "fs";
export class Recursion {
  filingsDirectory = "./src/assets/filings";
  constructor() {}
  async init() {
    this.findAllNestedDirectories((data) => {
      this.writeFilesToJSON(data);
    });
    //this.writeFilesToJSON(this.findAllNestedDirectories());
  }

  findAllNestedDirectories(callback) {
    const returnObject = {};
    const topDirectories = fs.readdirSync(this.filingsDirectory);

    topDirectories.forEach((current) => {
      returnObject[current] = {};
      if (fs.lstatSync(this.filingsDirectory + "/" + current).isDirectory()) {
        const nestedDirectory = fs.readdirSync(
          this.filingsDirectory + "/" + current
        );
        if (nestedDirectory.indexOf("MetaLinks.json") >= 0) {
          fs.readFile(
            this.filingsDirectory + "/" + current + "/MetaLinks.json",
            "utf-8",
            (err, metaLinks) => {
              if (err) {
                console.log(err);
                throw new Error(err);
              }
              metaLinks = JSON.parse(metaLinks);

              returnObject[current]["version"] = metaLinks["version"];

              returnObject[current]["instance_file"] = Object.keys(
                metaLinks["instance"]
              )[0];

              if (Object.keys(metaLinks["instance"]).length > 1) {
                returnObject[current]["multiple_instance"] = true;
              }

              if (returnObject[current]["instance_file"].includes(" ")) {
                returnObject[current]["multiple_files"] = true;
                const firstFile =
                  returnObject[current]["instance_file"].split(" ")[0];
                const stat = fs.statSync(
                  this.filingsDirectory + "/" + current + "/" + firstFile
                );

                returnObject[current]["size"] = stat.size / (1024 * 1024) > 10;
                returnObject[current]["link"] =
                  "?doc=" +
                  (this.filingsDirectory.replace("./src", "") +
                    "/" +
                    current +
                    "/" +
                    firstFile);
              } else {
                returnObject[current]["link"] =
                  "?doc=" +
                  (
                    this.filingsDirectory +
                    "/" +
                    current +
                    "/" +
                    returnObject[current]["instance_file"]
                  ).substring(2);
                const stat = fs.statSync(
                  this.filingsDirectory +
                    "/" +
                    current +
                    "/" +
                    returnObject[current]["instance_file"]
                );
                returnObject[current]["size"] = stat.size / (1024 * 1024) > 10;
              }

              fs.readFile(
                this.filingsDirectory + "/" + current + "/filing.json",
                "utf-8",
                (err, filing) => {
                  if (err) {
                    throw new Error(err);
                  }
                  filing = JSON.parse(filing);
                  returnObject[current]["sec"] = filing.html[0];
                  callback(returnObject);
                }
              );
            }
          );
        } else {
          returnObject[current]["version"] = "MetaLinks not available.";
          returnObject[current]["files"] = nestedDirectory;
          callback(returnObject);
        }
      }
    });
  }

  writeFilesToJSON(input) {
    input = JSON.stringify(input);
    fs.writeFileSync("./src/ts/development/input.json", input, "utf8");
  }
}
