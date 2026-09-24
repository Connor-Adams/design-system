// Pure builders for the agent-facing inventory artifacts (llms.txt + components.json).
// No filesystem or docgen access — operates on plain data so it is unit-testable.

export function summaryFromUsage(md) {
  for (const line of (md ?? '').split('\n')) {
    const trimmed = line.trim()
    if (trimmed) {
      return trimmed
        .replace(/^#+\s*/, '')
        .replace(/^one-line:\s*/i, '')
        .trim()
    }
  }
  return ''
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export function buildInventory({ manifest, props, usage, version, base, categories, packageName }) {
  const components = []
  for (const cat of categories) {
    const inCat = manifest
      .filter((m) => m.category === cat)
      .sort((a, b) => a.name.localeCompare(b.name))
    for (const m of inCat) {
      components.push({
        slug: m.slug,
        name: m.name,
        category: cat,
        docs: `${base}/components/${m.slug}`,
        summary: summaryFromUsage(usage[m.slug]) || `${m.name} component`,
        props: props[m.name] ?? [],
      })
    }
  }

  const json = {
    package: packageName,
    version,
    import: `import { <Name> } from '${packageName}'`,
    categories,
    components,
  }

  const usedCats = categories.filter((c) => components.some((x) => x.category === c))
  let llmsTxt = `# Cashflow Design System\n\n`
  llmsTxt += `> React component library (${packageName}). ${components.length} components across ${usedCats.length} categories. All components are imported from the package root.\n\n`
  llmsTxt += `Full inventory with prop schemas: ${base}/components.json\n`
  for (const cat of usedCats) {
    llmsTxt += `\n## ${cap(cat)}\n`
    for (const m of components.filter((x) => x.category === cat)) {
      const names = (m.props ?? []).map((p) => p.name)
      const propStr = names.length ? ` Props: ${names.join(', ')}.` : ''
      const summary = m.summary.replace(/\.$/, '')
      llmsTxt += `- [${m.name}](${m.docs}): ${summary}.${propStr}\n`
    }
  }

  return { json, llmsTxt }
}
