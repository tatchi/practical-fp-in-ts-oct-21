import { Chunk } from "@effect-ts/core"

const PathTypeId: unique symbol = Symbol()
type PathTypeId = typeof PathTypeId

export default class Path {
  readonly [PathTypeId]: PathTypeId = PathTypeId
  readonly #path: string
  private constructor(path: string) {
    this.#path = path
  }

  public static fromString(s: string): Path {
    return new Path(s)
  }

  public static concat(that: Path) {
    return (self: Path) => Path.fromString(`${self.#path}/${that.#path}`)
  }
  public ["/"](that: Path) {
    return Path.fromString(`${this.#path}/${that.#path}`)
  }
  public static toString(that: Path): string {
    return that.#path
  }
}
