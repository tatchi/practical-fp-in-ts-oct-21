import * as D1 from "@app/exercises/day-1/03-effect"
import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import { pipe } from "@effect-ts/system/Function"

describe("Day-1", () => {
  it("should succeed", async () => {
    const result = await T.runPromise(D1.one)
    expect(result).toBe(1)
  })
  it("should fail", async () => {
    try {
      await T.runPromise(D1.error)
      fail("promise should throw error")
    } catch (error) {
      expect(error).toBe("error")
    }
  })
  it("should fail", async () => {
    const result = await T.runPromiseExit(T.untraced(D1.error))

    expect(result).toEqual(Ex.fail("error"))
  })
  it("should die", async () => {
    const result = await T.runPromiseExit(T.untraced(D1.die))

    expect(result).toEqual(Ex.die("error"))
  })
  it("should read", async () => {
    const result = await pipe(
      D1.read,
      T.provideAll({ input: "my input" }),
      T.untraced,
      T.runPromiseExit
    )

    expect(result).toEqual(Ex.succeed("my input"))
  })
})
