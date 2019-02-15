const BenchmarkRunner = require('../../benchmark/benchmarkrunner');

const benchmarks = [
    '1k-run',
    '10k-run',
    '1k-update',
    '10k-update',
    '1k-clear',
    '10k-clear',
    '1k-swap',
    '1k-select',
    '1k-delete',
    '10k-update10th',
    '1k-append'
  ], bl = benchmarks.length,
  url = `${PATH}/speedtest.html`;

const ExpectedLayoutCounts = {
  '1k-run': 1,
  '10k-run': 1,
  '1k-update': 1,
  '10k-update': 1,
  '1k-clear': 1,
  '10k-clear': 1,
  '1k-swap': 1,
  '1k-select': 0,
  '1k-delete': 1,
  '10k-update10th': 1,
  '1k-append': 1
};

const ExpectedTotalDurations = {
  '1k-run': 120,
  '10k-run': 1100,
  '1k-update': 40,
  '10k-update': 370,
  '1k-clear': 25,
  '10k-clear': 150,
  '1k-swap': 12,
  '1k-select': 1,
  '1k-delete': 35,
  '10k-update10th': 80,
  '1k-append': 110
};

describe('Siffr.Dom', () => {
  for (let i = 0; i < bl; i++) {
    const bm = benchmarks[i];
    it(`passes ${bm} Speedtest with simpleElement`, async () => {
      const results = await new BenchmarkRunner([bm], { port, runs: 1, url }, false).run();
      const bmd = results[bm];
      assert.isAtMost(bmd['LayoutCount'], ExpectedLayoutCounts[bm], `${bm} layoutcount should be ${ExpectedLayoutCounts[bm]}, but was ${bmd['LayoutCount']}`);
      assert.isAtMost(bmd['TotalDuration'], ExpectedTotalDurations[bm], `${bm} duration should be ${ExpectedTotalDurations[bm]}, but was ${bmd['TotalDuration']}`);

      global.console.log(bm, '(sifrr total duration in ms): ', bmd['TotalDuration']);
    });

    it(`passes ${bm} Speedtest with sifrrElement`, async () => {
      const results = await new BenchmarkRunner([bm], { port, runs: 1, url: url + '?useSifrr' }, false).run();
      const bmd = results[bm];
      assert.isAtMost(bmd['LayoutCount'], ExpectedLayoutCounts[bm], `${bm} layoutcount should be ${ExpectedLayoutCounts[bm]}, but was ${bmd['LayoutCount']}`);

      global.console.log(bm, '(html total duration in ms): ', bmd['TotalDuration']);
    });
  }
});