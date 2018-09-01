const ChromeRender = require('chrome-render');
const fs = require('fs');
const path = require('path');

class SEOPlugin {
  constructor(pages, prepare, chromeRunnerOptions) {
    this.pages = pages;
    this.prepare = prepare;
    this.chromeRunnerOptions = chromeRunnerOptions;
  }

  apply(compiler) {
    compiler.hooks.done.tap('SEOPlugin', async (stats) => {
      const { prepare, chromeRunnerOptions, pages } = this;
      const { outputPath } = stats.compilation.compiler;
      if (typeof prepare === 'function') {
        await prepare();
      }
      this.chromeRender = await ChromeRender.new({
        chromeRunnerOptions,
      });
      for (let i = 0; i < pages.length; i++) {
        const { url, filename, ...others } = pages[i];
        const htmlString = await this.chromeRender.render({
          url: url,
          ...others,
        });
        fs.writeFileSync(path.resolve(outputPath, filename), htmlString);
        console.info('SEOPlugin', `render ${url} successful`);
      }
      await this.chromeRender.destroyRender();
    });
  }
}

module.exports = SEOPlugin;
