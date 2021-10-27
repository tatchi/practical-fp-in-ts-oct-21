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
  it("test succeed throw case", async () => {
    let result

    try {
      result = await T.runPromise(D1.oneLazy)
    } catch (error) {
      result = error
    }
    expect(result).toEqual(new Error("here"))
  })
  it("test succeed throw case 2", async () => {
    const result = await T.runPromiseExit(T.untraced(D1.oneLazy))

    expect(result).toEqual(Ex.die(new Error("here")))
  })
  it("test T.map", async () => {
    const result = await T.runPromiseExit(D1.useMap)

    expect(result).toEqual(Ex.succeed("got: 1"))
  })
  it("test T.chain", async () => {
    const messages: string[] = []
    const result = await pipe(
      D1.useChain,
      T.repeatN(2),
      T.provideAll({
        log: (s) =>
          T.succeedWith(() => {
            messages.push(s)
          })
      }),
      T.runPromiseExit
    )
    expect(result).toEqual(Ex.unit)
    expect(messages).toEqual([
      "again got: got: 1",
      "again got: got: 1",
      "again got: got: 1"
    ])
  })
  it("test random number", async () => {
    const shouldFail = await pipe(
      D1.generateRandomNumber,
      T.provideAll({ random: T.succeed(0.3) }),
      // T.provideAll({ random: T.succeed(Math.floor(Math.random() * 1)) }),
      T.runPromiseExit
    )

    // const r = pipe(
    //   shouldFail,
    //   Ex.mapBoth((e) => e.invalidNumber, identity)
    // )

    expect(Ex.untraced(shouldFail)).toEqual(
      Ex.fail(new D1.InvalidNumber({ invalidNumber: 0.3 }))
    )

    const shouldSucceed = await pipe(
      D1.generateRandomNumber,
      T.provideAll({ random: T.succeed(0.5) }),
      T.runPromiseExit
    )

    expect(Ex.untraced(shouldSucceed)).toEqual(Ex.succeed(0.5))
  })
  it("test random numberOrOne", async () => {
    const shouldSucceedOne = await pipe(
      D1.generateRandomNumberOrOne,
      T.provideAll({ random: T.succeed(0.3) }),
      T.runPromiseExit
    )

    expect(Ex.untraced(shouldSucceedOne)).toEqual(Ex.succeed(1))
  })
  it("test random sum", async () => {
    const resultOk = await pipe(
      D1.randomSum,
      T.provideAll({ random: T.succeed(0.6) }),
      T.runPromiseExit
    )

    expect(resultOk).toEqual(Ex.succeed(1.2))

    const resultNotOk = await pipe(
      D1.randomSum,
      T.provideAll({ random: T.succeed(0.4) }),
      T.runPromiseExit
    )

    expect(Ex.untraced(resultNotOk)).toEqual(
      Ex.fail(new D1.InvalidNumber({ invalidNumber: 0.4 }))
    )
  })
})
