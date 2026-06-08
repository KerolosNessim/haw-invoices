export function generateContractNumber(): string {
  const raw = crypto.randomUUID().replace(/-/g, "")
  return raw.slice(0, 8).toUpperCase()
}
