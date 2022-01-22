import { pipe } from "@effect-ts/system/Function"
import * as O from "@effect-ts/core/Option"

import * as A from "@effect-ts/core/Associative"
import * as E from "@effect-ts/core/Either"
import * as Arr from "@effect-ts/core/Collections/Immutable/Array"
import * as P from "@effect-ts/core/Prelude"

const ValidationApplicative = E.getValidationApplicative(
  A.makeAssociative<string>((l, r) => `(${l})(${r})`)
)

const traverse = Arr.forEachF(E.Applicative)

// It will combime the results.
const traverse2 = Arr.forEachF(ValidationApplicative)

// E.getSeparate(E.getWiltable)

// const new_traverse = E.getSeparateF(I.makeIdentity("", (a, b) => a + b))

const result = pipe(
  [0, 1, 2, 3],
  traverse((n) => (n > 1 ? E.left(`bad: ${n}`) : E.right(`good: ${n}`)))
)

// console.log(result)

// https://dev.to/ryanleecode/practical-guide-to-fp-ts-p5-apply-sequences-and-traversals-1bdm
const foo = (a: number) => (b: string) => a.toString() === b

const a = O.some(3)
const b = O.some("3")

const res = pipe(
  O.some(foo),
  O.ap(a),
  O.ap(b),
  O.getOrElse(() => false)
)

// sequence transform a Array<Option<number>> into Option<Arr<number>>.
const seq = Arr.sequence(O.Applicative)

pipe(seq([O.some(1), O.some(3), O.none])) // none

// Traverse seems to be the same but allow to make transformation
const traverseO = Arr.forEachF(O.Applicative)

pipe([O.some(1), O.some(2)], traverseO(O.map((d) => d + 1))) // Some([2,3])

// const eseq = E.sequence(O.Applicative)

// const eres = eseq(E.right(O.none))

// console.log(eres)

type RegisterInput = {
  email: string
  password: string
}

const input: RegisterInput = {
  email: "tinenco",
  password: "my"
}

const validateEmail = (email: string) =>
  email.length > 10 ? E.right(email) : E.left(["email length should be > 3"])
const validatePassword = (password: string) =>
  password.length > 3 ? E.right(password) : E.left(["password length should be > 3"])

const ValidationApplicativeStruct = E.getValidationApplicative(
  A.makeAssociative<string[]>((l, r) => l.concat(r))
)

pipe(
  input,
  ({ email, password }) =>
    // = E.struct({})
    // DSL.structF(E.Applicative)
    P.structF(ValidationApplicativeStruct)({
      email: validateEmail(email),
      password: validatePassword(password)
    }),
  console.log
)
