const PathTypeId: unique symbol = Symbol()
type PathTypeId = typeof PathTypeId

interface Path {
  readonly [PathTypeId]: PathTypeId
  path: string
}

export function fromString(s: string): Path {
  return { path: s } as Path
}
