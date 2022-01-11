import { pipe } from "@effect-ts/core"
import * as T from "@effect-ts/core/Effect"
import * as Ex from "@effect-ts/core/Effect/Exit"
import * as C from "@effect-ts/core/Effect/Cause"

import * as E from "@effect-ts/core/Either"

export const p = pipe(
  T.succeed(1),
  T.chain((res) => (res > 1 ? T.succeed(res) : T.die("MY ERROR")))
  // T.result,
  // T.map(Ex.untraced)
)

// export const p2: T.Effect<unknown, never, E.Either<string, number>> = pipe(
//   T.succeed(1),
//   T.chain((res) => T.succeed(res > 1 ? E.right(res) : E.left("e")))
// )

export const p3 = pipe(
  T.succeed(1),
  T.chain((res) => (res > 1 ? T.succeed(res) : T.fail("MY ERROR")))
  // T.tapError((e) => {
  //   return T.succeedWith(() => console.log({ e: C.pretty(C.fail(e)) }))
  // }),
  // T.tapCause((c) => {
  //   // return T.succeedWith(() => console.log(C.pretty(c)))
  //   return T.unit
  // })
  // T.catchAll((e) => {
  //   return T.succeedWith(() => console.log({ e }))
  // })
)
;(async function main() {
  const res = await T.runPromiseExit(p3)

  Ex.getOrElse_(res, (c) => {
    console.log(
      C.pretty(c, {
        renderError: (e) => [],
        renderTrace: () => "the trace",
        renderUnknown: (e) => {
          console.log(e)
          return []
        }
      })
    )
  })
})()
