import * as T from "@effect-ts/core/Effect"
import { Tagged } from "@effect-ts/system/Case"
import { pipe } from "@effect-ts/system/Function"
import { pretty } from "@effect-ts/core/Effect/Cause"
import fetch, { Response, RequestInfo, RequestInit } from "node-fetch"

/**
 * Theory:
 *
 * Introduction to Effect-TS and it's ecosystem in general and a more focused intro on Effect<R, E, A>
 */

/**
 * Running Effects:
 *
 * In order to run an effect one has to use one of the T.run* functions, we will begin using T.runPromiseExit that we will use in tests
 */

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const one = T.succeed(1)

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const error = T.fail("error" as const)

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const die = T.die("error")

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const read = T.access((_: { input: string }) => _.input)

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const oneLazy = T.succeedWith(() => {
  throw new Error("here")
  return 1
})

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const errorLazy = T.failWith(() => "error")

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const dieLazy = T.dieWith(() => "error")

/**
 * Exercise:
 *
 * Test the output of the following program
 */
export const unit = T.unit

/**
 * Exercise:
 *
 * Try and test the method T.map
 */

export const useMap = pipe(
  T.succeed(1),
  T.map((res) => `got: ${res}`)
)

/**
 * Exercise:
 *
 * Try and test the method T.chain
 */

export const useChain = pipe(
  T.succeed(1),
  T.chain((res) => T.succeed(`got: ${res}`)),
  T.chain((res) =>
    T.accessM((logger: { log: (_: string) => T.UIO<void> }) =>
      logger.log(`again got: ${res}`)
    )
  )
)

/**
 * Exercise:
 *
 * Write a program that generates a random number between 0 and 1
 * using Math.random and that fail with an InvalidNumber error in
 * case the number is < 0.5 and succeeds with the number otherwise
 */

export class InvalidNumber extends Tagged("InvalidNumber")<{
  readonly invalidNumber: number
}> {}

// const myRandomNumber = pipe(
//   T.succeedWith(() => Math.floor(Math.random() * 1)),
//   T.chain((n) => {
//     return n < 0.5 ? T.fail(new InvalidNumber({ invalidNumber: n })) : T.succeed(n)
//   })
// )

interface RandomNumberGeneratorService {
  random: T.UIO<number>
}

export const generateRandomNumber = pipe(
  T.accessM((_: RandomNumberGeneratorService) => _.random),
  T.chain((n) => {
    return n < 0.5 ? T.fail(new InvalidNumber({ invalidNumber: n })) : T.succeed(n)
  })
)

/**
 * Exercise:
 *
 * Try and test the method T.tap, improve the program above to use T.tap
 */

export const generateRandomNumberWithTap = pipe(
  T.accessM((_: RandomNumberGeneratorService) => _.random),
  T.tap((n) =>
    T.when(() => n < 0.5)(T.failWith(() => new InvalidNumber({ invalidNumber: n })))
  )
)

/**
 * Exercise:
 *
 * Test the randomGteHalf program, you will need to move the dependency on
 * Math.random to be a requirement (R) using T.accessM and provide the
 * dependency (mocked) in the test
 */

/**
 * Exercise:
 *
 * Handle the InvalidRandom failure using T.catchAll returning 1 as success
 * in case of failures
 */

// export const generateRandomNumberOrOne = pipe(
//   generateRandomNumberWithTap,
//   T.catchAll((_) => T.succeed(1))
// )
export const generateRandomNumberOrOne = pipe(
  generateRandomNumberWithTap,
  T.catchTag("InvalidNumber", (_) => T.succeed(1))
)

export const randomOutput = pipe(
  generateRandomNumberWithTap,
  T.foldM(
    (_) => T.succeedWith(() => `I've got an invalid number: ${_.invalidNumber}`),
    (_) => T.succeedWith(() => `I've got: ${_}`)
  )
)

export const randomOutput2 = pipe(
  generateRandomNumberWithTap,
  T.foldCauseM(
    (_) => T.succeedWith(() => `I've got a failure: ${pretty(_)}`),
    (_) => T.succeedWith(() => `I've got: ${_}`)
  )
)

/**
 * Exercise:
 *
 * Test the following functions:
 * 1) T.catchAllCause
 * 2) T.foldM
 * 3) T.foldCauseM
 * 4) T.result
 * 5) T.tapError
 * 6) T.tapBoth
 * 7) T.tapCause
 * 8) T.catch
 * 9) T.catchTag
 * 10) T.bracket
 */

/**
 * Exercise:
 *
 * Write a program that generate 2 valid random numbers and returns the sum
 */

export const randomSum = pipe(
  generateRandomNumberWithTap,
  T.zip(generateRandomNumberWithTap),
  T.map(([nb1, nb2]) => nb1 + nb2)
)

/**
 * Exercise:
 *
 * Rewrite the same program using pipe(T.do, T.bind("a", () => ...), T.bind("b", () => ...), T.map)
 */

export const randomSumDo = pipe(
  T.do,
  T.bind("nb1", () => generateRandomNumberWithTap),
  T.bind("nb2", () => generateRandomNumberWithTap),
  T.map(({ nb1, nb2 }) => nb1 + nb2)
)

/**
 * Exercise:
 *
 * Rewrite the same program using T.gen
 */

export const randomSumGem = T.gen(function* (_) {
  const nb1 = yield* _(generateRandomNumberWithTap)
  const nb2 = yield* _(generateRandomNumberWithTap)
  return nb1 + nb2
})

export const testYield = T.gen(function* (_) {
  const nb1 = yield* _(generateRandomNumberWithTap)
  const nb2 = yield* _(generateRandomNumberWithTap)
  while ((yield* _(generateRandomNumberWithTap)) > 0) {
    yield* _(
      T.succeedWith(() => {
        console.log("coucou")
      })
    )
  }
  return nb1 + nb2
})

/**
 * Exercise:
 *
 * Test the following constructors:
 *
 * 1) T.promise
 * 2) T.tryPromise
 * 3) T.tryCatchPromise
 * 4) T.tryCatch
 * 5) T.effectAsync
 * 6) T.effectAsyncInterrupt
 * 7) T.delay
 * 8) T.sleep
 */

export class FetchException extends Tagged("FetchException")<{
  readonly error: unknown
}> {}

export class MalformedJsonResponse extends Tagged("MalformedJsonResponse")<{
  readonly error: unknown
}> {}

export const fetchRequest = T.tryCatchPromise(
  () => fetch("https://jsonplaceholder.typicode.com/todos/1"),
  (error) => new FetchException({ error })
)

export const fetchRequest2 = T.effectAsync<unknown, FetchException, Response>(
  (resume) => {
    fetch("https://jsonplaceholder.typicode.com/todos/1")
      .then((response) => {
        resume(T.succeed(response))
      })
      .catch((error) => {
        resume(T.fail(new FetchException({ error })))
      })
  }
)

export const fetchRequest3 = T.effectAsyncInterrupt<unknown, never, void>((resume) => {
  console.log("STARTED")

  const timer = setTimeout(() => {
    resume(T.unit)
    console.log("HERE")
  }, 100)

  return T.succeedWith(() => {
    clearTimeout(timer)
    console.log("INTERRUPTED")
  })
})

export function _fetch(input: RequestInfo, init?: RequestInit) {
  return T.effectAsyncInterrupt<unknown, FetchException, Response>((resume) => {
    const controller = new AbortController()

    fetch(input, { ...init, signal: controller.signal })
      .then((response) => {
        resume(T.succeed(response))
      })
      .catch((error) => {
        resume(T.fail(new FetchException({ error })))
      })

    return T.succeedWith(() => {
      controller.abort()
    })
  })
}

export function _fetchJson(input: RequestInfo, init?: RequestInit) {
  return pipe(
    T.tryCatchPromise(
      () => fetch("https://jsonplaceholder.typicode.com/todos/1"),
      (error) => new FetchException({ error })
    ),
    T.chain((res) =>
      T.tryCatchPromise(
        (): Promise<unknown> => res.json(),
        (error) => new MalformedJsonResponse({ error })
      )
    )
  )
}

/**
 * Exercise:
 *
 * Test the following functions:
 *
 * 1) T.tuple
 * 2) T.tuplePar
 * 3) T.tupleParN
 * 4) T.struct
 * 5) T.structPar
 * 6) T.structParN
 */

/**
 * Exercise:
 *
 * Test the following functions:
 *
 * 1) T.forEach
 * 2) T.forEachPar
 * 3) T.forEachParN
 */
