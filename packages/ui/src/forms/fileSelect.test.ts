import { formatFileSize, matchesAccept, selectFiles } from './fileSelect'

const mk = (name: string, type = '', bytes = 10): File =>
  new File([new Uint8Array(bytes)], name, { type })

describe('formatFileSize', () => {
  it('renders sub-megabyte sizes in KB, never zero', () => {
    expect(formatFileSize(0)).toBe('1 KB')
    expect(formatFileSize(2_400)).toBe('2 KB')
    expect(formatFileSize(999_000)).toBe('999 KB')
  })

  it('renders megabyte sizes with one decimal', () => {
    expect(formatFileSize(2_500_000)).toBe('2.5 MB')
  })
})

describe('matchesAccept', () => {
  it('accepts everything when no accept list is given', () => {
    expect(matchesAccept(mk('x.pdf', 'application/pdf'))).toBe(true)
    expect(matchesAccept(mk('x.pdf', 'application/pdf'), '')).toBe(true)
    expect(matchesAccept(mk('x.pdf', 'application/pdf'), '  ')).toBe(true)
  })

  it('matches extensions case-insensitively', () => {
    expect(matchesAccept(mk('statement.CSV'), '.csv,.ofx')).toBe(true)
    expect(matchesAccept(mk('statement.pdf'), '.csv,.ofx')).toBe(false)
  })

  it('matches exact mime types and wildcards', () => {
    expect(matchesAccept(mk('a.png', 'image/png'), 'image/png')).toBe(true)
    expect(matchesAccept(mk('a.png', 'image/png'), 'image/*')).toBe(true)
    expect(matchesAccept(mk('a.png', 'image/png'), 'audio/*')).toBe(false)
    expect(matchesAccept(mk('a.png', 'image/png'), '*/*')).toBe(true)
  })
})

describe('selectFiles', () => {
  it('returns empty results for a null source', () => {
    expect(selectFiles(null)).toEqual({ accepted: [], rejected: [] })
    expect(selectFiles(undefined)).toEqual({ accepted: [], rejected: [] })
  })

  it('keeps only the first file unless multiple is set', () => {
    const files = [mk('a.csv'), mk('b.csv')]
    expect(selectFiles(files, { multiple: false }).accepted).toHaveLength(1)
    expect(selectFiles(files, { multiple: true }).accepted).toHaveLength(2)
  })

  it('rejects files whose extension is not in accept', () => {
    const { accepted, rejected } = selectFiles([mk('a.pdf', 'application/pdf')], { accept: '.csv' })
    expect(accepted).toEqual([])
    expect(rejected).toHaveLength(1)
    expect(rejected[0]!.code).toBe('accept')
    expect(rejected[0]!.message).toContain('a.pdf')
  })

  it('rejects files over maxSize and reports the limit', () => {
    const { accepted, rejected } = selectFiles([mk('big.csv', 'text/csv', 4_000)], { maxSize: 1_000 })
    expect(accepted).toEqual([])
    expect(rejected[0]!.code).toBe('max-size')
    expect(rejected[0]!.message).toContain('1 KB')
  })

  it('partitions a mixed multiple selection', () => {
    const { accepted, rejected } = selectFiles(
      [mk('ok.csv'), mk('nope.pdf', 'application/pdf'), mk('huge.csv', 'text/csv', 5_000)],
      { accept: '.csv', maxSize: 1_000, multiple: true },
    )
    expect(accepted.map((f) => f.name)).toEqual(['ok.csv'])
    expect(rejected.map((r) => r.code)).toEqual(['accept', 'max-size'])
  })

  it('does not enforce a size limit when maxSize is omitted', () => {
    expect(selectFiles([mk('huge.csv', 'text/csv', 50_000)], { accept: '.csv' }).rejected).toEqual([])
  })
})
