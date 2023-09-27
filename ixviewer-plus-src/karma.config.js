module.exports = (config) => {
  const tests = [
    "./node_modules/bootstrap/dist/js/bootstrap.bundle.js",
    { pattern: "./src/ts/**/*.spec.+(ts|js)", watched: true, type: "js" },
  ];

  const webpackConfig = () => {
    const config = require("./webpack.config.js");
    delete config.context;
    delete config.entry;
    delete config.output;
    delete config.devServer;
    return config({ env: { copy: true }, argv: { mode: "production" } });
  };

  config.set({
    client: {
      jasmine: {
        random: false,
      },
      clearContext: false,
    },
    singleRun: false,
    frameworks: ["jasmine", "webpack"],
    files: tests,
    preprocessors: {
      "./src/ts/**/*.spec.+(ts|js)": ["webpack", "coverage"],
    },
    mime: {
      "text/x-typescript": ["ts", "tsx"],
    },
    webpack: webpackConfig(),
    webpackMiddleware: {
      noInfo: true,
    },
    color: true,
    reporters: ["coverage", "dots", "progress", "kjhtml"],
    browsers: ["Chrome"],
    autoWatch: true,
  });
};

// function webpackConfig() {
//   const config = require("./webpack.config.js");
//   delete config.context;
//   delete config.entry;
//   delete config.output;
//   delete config.devServer;
//   return config({ env: { copy: false }, argv: { mode: "production" } });
// }
