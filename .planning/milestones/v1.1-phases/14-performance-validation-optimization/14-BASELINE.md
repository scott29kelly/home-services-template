# Phase 14 — Lighthouse Baseline Measurements

**Date:** 2026-03-03
**Tool:** Lighthouse 13.0.3
**Method:** 3-run median per page per mode
**Server:** `npx vite preview` (production build)

## Summary

| Page | Mode | Perf | LCP (ms) | CLS | TBT (ms) | FCP (ms) | SI (ms) |
|------|------|------|----------|-----|----------|----------|----------|
| Homepage | desktop | 94 | 1514 | 0.003 | 11 | 858 | 858 |
| Homepage | mobile | 69 | 5544 | 0 | 150 | 3699 | 3699 |
| Service Page (Roofing) | desktop | 94 | 1516 | 0.003 | 0 | 839 | 839 |
| Service Page (Roofing) | mobile | 71 | 5690 | 0 | 46 | 3605 | 3605 |
| About | desktop | 94 | 1488 | 0.003 | 0 | 842 | 909 |
| About | mobile | 69 | 6669 | 0 | 53 | 3588 | 3588 |
| City Page | desktop | 94 | 1509 | 0.003 | 0 | 837 | 837 |
| City Page | mobile | 71 | 5646 | 0 | 30 | 3665 | 3665 |
| Blog Post | desktop | 94 | 1508 | 0.003 | 0 | 844 | 844 |
| Blog Post | mobile | 68 | 6268 | 0 | 15 | 3887 | 3887 |

## Individual Runs

```json
{
  "Homepage": {
    "path": "/",
    "desktop": {
      "perf": 94,
      "lcp": 1514,
      "cls": 0.003,
      "tbt": 11,
      "fcp": 858,
      "si": 858,
      "runs": 3
    },
    "mobile": {
      "perf": 69,
      "lcp": 5544,
      "cls": 0,
      "tbt": 150,
      "fcp": 3699,
      "si": 3699,
      "runs": 3
    }
  },
  "Service Page (Roofing)": {
    "path": "/roofing",
    "desktop": {
      "perf": 94,
      "lcp": 1516,
      "cls": 0.003,
      "tbt": 0,
      "fcp": 839,
      "si": 839,
      "runs": 3
    },
    "mobile": {
      "perf": 71,
      "lcp": 5690,
      "cls": 0,
      "tbt": 46,
      "fcp": 3605,
      "si": 3605,
      "runs": 3
    }
  },
  "About": {
    "path": "/about",
    "desktop": {
      "perf": 94,
      "lcp": 1488,
      "cls": 0.003,
      "tbt": 0,
      "fcp": 842,
      "si": 909,
      "runs": 3
    },
    "mobile": {
      "perf": 69,
      "lcp": 6669,
      "cls": 0,
      "tbt": 53,
      "fcp": 3588,
      "si": 3588,
      "runs": 3
    }
  },
  "City Page": {
    "path": "/service-areas/anytown",
    "desktop": {
      "perf": 94,
      "lcp": 1509,
      "cls": 0.003,
      "tbt": 0,
      "fcp": 837,
      "si": 837,
      "runs": 3
    },
    "mobile": {
      "perf": 71,
      "lcp": 5646,
      "cls": 0,
      "tbt": 30,
      "fcp": 3665,
      "si": 3665,
      "runs": 3
    }
  },
  "Blog Post": {
    "path": "/resources/best-roofing-materials-harsh-winters",
    "desktop": {
      "perf": 94,
      "lcp": 1508,
      "cls": 0.003,
      "tbt": 0,
      "fcp": 844,
      "si": 844,
      "runs": 3
    },
    "mobile": {
      "perf": 68,
      "lcp": 6268,
      "cls": 0,
      "tbt": 15,
      "fcp": 3887,
      "si": 3887,
      "runs": 3
    }
  }
}
```
