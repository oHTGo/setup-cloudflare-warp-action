import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { removeRedundantText } from './utils';
import type { Page } from 'puppeteer';

const checkBaseStatus = async (page: Page) => {
  const card = await page.waitForSelector('.base_card', { visible: true });
  const status = removeRedundantText(await card?.evaluate(e => e.textContent));
  if (!status.includes('Your network is fully protected.')) {
    throw new Error(`Base status is not as expected: ${status}`);
  }
};

const checkOverviewStatuses = async (page: Page) => {
  const labels = ['DNS over HTTPS', 'WARP', 'Gateway proxy'];
  for (const label of labels) {
    const el = await page.waitForSelector(
      `[data-testid="overviewCardRow-${label}"]`,
      {
        visible: true
      }
    );
    const status = await el?.$('svg > circle');
    if (!status) {
      throw new Error(`Status for ${label} is not found`);
    }
    const color = await status.evaluate(e => e.getAttribute('fill'));
    if (color !== '#228B49') {
      throw new Error(`Status for ${label} is not as expected.`);
    }
  }
};

const checkTeamName = async (page: Page) => {
  const teamName = await page.waitForSelector(
    `[data-testid="overviewCardRow-${process.env.ORGANIZATION}"]`,
    {
      visible: true
    }
  );
  if (!teamName) {
    throw new Error(`Team name is not found.`);
  }
};

(async () => {
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({ headless: false });
  try {
    const page = await browser.newPage();
    await page.goto('https://help.teams.cloudflare.com', {
      waitUntil: 'networkidle0'
    });

    const results = await Promise.allSettled([
      checkBaseStatus(page),
      checkOverviewStatuses(page),
      checkTeamName(page)
    ]);
    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason);
    if (errors.length) {
      throw new Error(errors.join('\n'));
    }
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
