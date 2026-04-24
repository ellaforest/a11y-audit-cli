# a11y-audit-cli

> A command-line tool that crawls local or live sites and outputs structured accessibility violation reports with WCAG references.

---

## Installation

```bash
npm install -g a11y-audit-cli
```

Or run without installing:

```bash
npx a11y-audit-cli <url>
```

---

## Usage

```bash
# Audit a live site
a11y-audit-cli https://example.com

# Audit a local dev server
a11y-audit-cli http://localhost:3000

# Crawl multiple pages and output a JSON report
a11y-audit-cli https://example.com --crawl --depth 3 --output report.json

# Output results as a formatted table in the terminal
a11y-audit-cli https://example.com --format table
```

### Example Output

```
[VIOLATION] Page: https://example.com
  Rule:        image-alt
  Impact:      critical
  WCAG:        1.1.1 (Level A)
  Description: Images must have alternate text
  Elements:    <img src="hero.png">
```

---

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--crawl` | Follow internal links | `false` |
| `--depth <n>` | Max crawl depth | `1` |
| `--output <file>` | Write report to file | stdout |
| `--format` | Output format: `json`, `table`, `csv` | `table` |

---

## Requirements

- Node.js >= 18
- A running local or remote HTTP server

---

## License

[MIT](./LICENSE)