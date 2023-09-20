import { ConstantDate } from "./constant/dates.mjs";
import { Rss } from "./rss/index.mjs";
import { Filing } from "./filing/index.mjs";
import { Recursion } from "./recursion/index.mjs";
import inquirer from "inquirer";
(async () => {
  const feeds = ConstantDate.getRssFeedsURLs();

  //feeds.unshift(`Just Build the Recursive JSON structure`);
  // add the "Newest inline files" as an option *this is updated every 20 minutes*
  feeds.unshift(`https://www.sec.gov/Archives/edgar/xbrl-inline.rss.xml`);

  feeds.unshift(`*** Just Build the Recursive JSON structure ***`);
  const questions = [
    {
      type: "list",
      name: "month",
      message: "Please select the month of Inline XBRL Filings to GET",
      choices: [new inquirer.Separator("~~~PLEASE CHOOSE ONE~~~")].concat(
        feeds.map((element) => element)
      ),
      validate(answer) {
        if (answer.length < 1) {
          return `You must choose atleast one option.`;
        }
        return true;
      },
    },
  ];
  inquirer.prompt(questions).then(async (answers) => {
    if (!answers.month.startsWith("***")) {
      const rss = new Rss(answers.month);
      const filings = await rss.init();
      console.log();
      console.log(
        `We are going to go through and get all the necessary files for ${filings.length} filings, we won't be getting the Images, or Exhibits (yet...).`
      );
      console.log(
        `I would suggest getting something to drink, as this could take a bit of time.`
      );
      const filing = new Filing(filings);
      await filing.init();
    }
    const recursion = new Recursion();
    await recursion.init();
  });
})();
