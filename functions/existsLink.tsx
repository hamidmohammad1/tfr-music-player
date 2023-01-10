export default async function existsLink(url: string) {
  const result = await fetch(url, { method: 'HEAD' })
  return result.ok
}
