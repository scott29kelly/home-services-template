function stripQuotes(value: string): string {
  const trimmed = value.trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

function parseScalar(value: string): string | boolean | string[] {
  const trimmed = value.trim()

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim()
    if (!inner) return []

    return inner.split(',').map((item) => stripQuotes(item))
  }

  if (trimmed === 'true') return true
  if (trimmed === 'false') return false

  return stripQuotes(trimmed)
}

/**
 * Minimal parser for the simple YAML frontmatter shape used by site content.
 */
export function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const normalizedRaw = raw.startsWith('\uFEFF') ? raw.slice(1) : raw

  if (!normalizedRaw.startsWith('---')) {
    return { data: {}, content: raw }
  }

  const lines = normalizedRaw.split(/\r?\n/)
  const data: Record<string, unknown> = {}
  let index = 1
  let foundClosingDelimiter = false

  while (index < lines.length) {
    const line = lines[index]

    if (line.trim() === '---') {
      foundClosingDelimiter = true
      index += 1
      break
    }

    if (!line.trim()) {
      index += 1
      continue
    }

    const keyMatch = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/)
    if (!keyMatch) {
      index += 1
      continue
    }

    const [, key, value] = keyMatch

    if (value.trim() === '') {
      const items: string[] = []
      index += 1

      while (index < lines.length) {
        const itemLine = lines[index]

        if (itemLine.trim() === '---') break
        if (!itemLine.trim()) {
          index += 1
          continue
        }
        if (!itemLine.match(/^\s*-\s+/)) break

        items.push(String(parseScalar(itemLine.replace(/^\s*-\s+/, ''))))
        index += 1
      }

      data[key] = items
      continue
    }

    data[key] = parseScalar(value)
    index += 1
  }

  if (!foundClosingDelimiter) {
    return { data: {}, content: raw }
  }

  return {
    data,
    content: lines.slice(index).join('\n').trimStart(),
  }
}
