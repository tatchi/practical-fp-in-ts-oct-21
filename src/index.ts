import { Chunk, Fiber } from "@effect-ts/core"
import * as T from "@effect-ts/core/Effect"
// import * as N from "@effect-ts/node/Runtime"
import * as S from "@effect-ts/core/Effect/Stream"
import { pipe } from "@effect-ts/system/Function"
import * as Ref from "@effect-ts/core/Effect/Ref"
import * as F from "@effect-ts/core/Effect/Fiber"
import Path from "./path"

const a1 = Path.fromString("project")
const b1 = Path.fromString("node")

const result = pipe(a1, Path.concat(b1))

console.log(Path.toString(result["/"](a1)))

type R = {
  name: string
}

const r: R = {
  name: "test name"
}

const res = T.structPar({
  r: T.succeed(r)
})

const result_stream = pipe(
  Ref.makeRef(0),
  T.map((ref) =>
    pipe(
      S.fromChunk(Chunk.many(0, 1, 2)),
      S.map((n) => {
        Ref.update_(ref, (n) => n + 1)
        return n + 1
      })
    )
  ),
  S.unwrap
)
// ;(async function () {
//   const res = await pipe(result_stream, S.runCollect, T.runPromise)

//   console.log(res)
// })()

const test = pipe(
  T.succeed(1),
  T.zipWith(T.succeed(1), (a, b) => a + b),
  T.map((res) => res)
)

function fib(n: number): T.UIO<number> {
  if (n <= 1) return T.succeed(n)
  return pipe(
    fib(n - 1),
    T.zipWith(fib(n - 2), (a, b) => a + b)
  )
}

// function fibPar(n: number) {
//   if (n <= 1) return F.succeed(n)

//   const prec: Fiber.Fiber<never, number> = fibPar(n - 1)
//   const prec2: Fiber.Fiber<never, number> = fibPar(n - 2)

//   return [prec, prec2]
// }

const fetchAfter200: T.IO<unknown, number> = T.tryPromise(
  () =>
    new Promise((res) => {
      setTimeout(() => {
        res(1)
      }, 4000)
    })
)

;(async function () {
  // const fiber = await pipe(
  //   fib(30),
  //   T.fork,
  //   T.chain((eff) => F.join(eff)),
  //   T.runPromise
  // )

  const fiber1 = fetchAfter200
  const fiber2 = fetchAfter200

  const res = await pipe(
    fiber1,
    T.zipPar(fiber2),
    T.map(([a, b]) => {
      console.log("MAP")
      return a + b
    }),
    T.fork,
    T.chain(F.join),
    T.runPromise
  )

  // const res = await pipe(
  //   T.fork(fiber1),
  //   T.zip(T.fork(fiber2)),
  //   T.map((f) => {
  //     console.log("MAP")
  //     return f
  //   }),
  //   T.chain(F.joinAll),
  //   T.map(([a, b]) => a + b),
  //   T.runPromise
  // )

  console.log(res)
})()
