import * as O from "@effect-ts/core/Option"
import * as A from "@effect-ts/core/Associative"
import * as Ord from "@effect-ts/core/Ord"
import * as I from "@effect-ts/core/Identity"
import { pipe } from "@effect-ts/core/Function"

let compare_result = Ord.number.compare(1, 2) // -1

compare_result = Ord.number.compare(1, 1) // 0

const ord_option_number = O.getOrd(Ord.number)

compare_result = ord_option_number.compare(O.some(1), O.none) // 1

compare_result = ord_option_number.compare(O.some(1), O.some(1)) // 0

// Associative is same than `Applicative` ?
const associative_number = A.makeAssociative(Ord.max(Ord.number))

// This returns the same than 👆
const associative_number2 = A.max(Ord.number)

// First argument of `A.fold` is the `empty` case.
pipe([1, 2, 3], pipe(0, A.fold(associative_number))) // 3

// We can create an `Identity` (Monoid ?) by specifying the `empty` case
const max_number_identity = I.fromAssociative(associative_number)(0)

// Same than 👆
const max_number_identity_2 = I.makeIdentity(0, Math.max)
const max_number_identity_3 = I.makeIdentity(0, A.max(Ord.number).combine)

pipe([1, 2, 3], I.fold(max_number_identity)) // 3
pipe([1, 2, 3], I.fold(max_number_identity_2)) // 3

const struct_identity = I.struct({
  nb_products: max_number_identity,
  money: max_number_identity
})

pipe(
  [
    { money: 0, nb_products: 4 },
    { money: 3, nb_products: 2 }
  ],
  I.fold(struct_identity)
) // { nb_products: 4, money: 3 }

const struct_identity_fn = I.struct({
  nb_products: max_number_identity,
  money: I.func(max_number_identity)<number>()
})

pipe(
  [
    { money: (m: number) => m + 0, nb_products: 4 },
    { money: (m: number) => m + 3, nb_products: 2 }
  ],
  I.fold(struct_identity_fn),
  (res) => console.log(res.money(66)) // 69
) // { nb_products: 4, money: n => n + 3 }

pipe(
  [(s) => s.length, (s) => s.length + 1],
  A.fold(A.func(associative_number)<string>())(() => 0),
  (res) => console.log(res("hello"))
)

const ass = O.getApplyAssociative(A.max(Ord.number))

const id = I.makeIdentity(O.some(0), ass.combine)

pipe([O.some(3), O.some(1)], I.fold(id), console.log)

export interface RetryStatus {
  iterNumber: number
  cumulativeDelay: number
  previousDelay: O.Option<number>
}

export interface RetryPolicy {
  (status: RetryStatus): O.Option<number>
}

// Because there's currently a bug: https://github.com/Effect-TS/core/pull/1026
export function getApplyIdentity<A>(M: I.Identity<A>): I.Identity<O.Option<A>> {
  return I.fromAssociative(O.getApplyAssociative(M))(O.some(M.identity))
}

const monoid = I.func(
  getApplyIdentity(I.makeIdentity(0, Ord.max(Ord.number)))
)<RetryStatus>()

monoid.combine(
  (a) => a.previousDelay,
  (b) =>
    pipe(
      b.previousDelay,
      O.map((v) => v + 1)
    )
)
