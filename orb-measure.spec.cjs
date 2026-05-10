const { test } = require('playwright/test');

test('measure hud orbs', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('http://127.0.0.1:8765/index.html');
  await page.waitForTimeout(1500);
  await page.locator('#inventoryPanel').evaluate(el => el.classList.add('collapsed'));
  await page.waitForTimeout(250);
  const data = await page.evaluate(() => {
    const pick = selector => {
      const el = document.querySelector(selector);
      const span = el.querySelector('span');
      const r = el.getBoundingClientRect();
      const sr = span.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const after = getComputedStyle(el, '::after');
      const before = getComputedStyle(el, '::before');
      return {
        selector,
        rect: { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom },
        span: { x: sr.x, y: sr.y, width: sr.width, height: sr.height, cx: sr.x + sr.width / 2, cy: sr.y + sr.height / 2 },
        overflow: cs.overflow,
        filter: cs.filter,
        afterInset: after.inset,
        afterBgPosition: after.backgroundPosition,
        beforeSize: { width: before.width, height: before.height }
      };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      hud: document.querySelector('.hud').getBoundingClientRect().toJSON(),
      health: pick('.health-orb'),
      mana: pick('.mana-orb')
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await page.locator('.hud').screenshot({ path: 'C:/tmp/diablo-hud-orb-measure.png' });
});
