import * as O from "@effect-ts/core/Option"
import * as A from "@effect-ts/core/Associative"
import * as Ord from "@effect-ts/core/Ord"
import * as I from "@effect-ts/core/Identity"
import { pipe } from "@effect-ts/core/Function"
import { NonEmptyArray, Record, List, Array, Equal } from "@effect-ts/core"

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

const associative_sum = A.makeAssociative<number>((x, y) => x + y)

// This returns the same than 👆
const associative_sum2 = A.sum

pipe([1, 2, 3], pipe(0, A.fold(associative_sum))) // 6

pipe([true, false, true], pipe(true, A.fold(A.all))) // false

// Reverse
const string_concat = A.string

const reversed_string_concat = A.inverted(A.string)

string_concat.combine("hello", "world") // helloworld
reversed_string_concat.combine("hello", "world") // worldhello

type Vector = {
  readonly x: number
  readonly y: number
}

const vectorAssoc = A.struct<Vector>({ x: A.sum, y: A.sum })

const v1: Vector = { x: 1, y: 1 }
const v2: Vector = { x: 1, y: 2 }

vectorAssoc.combine(v1, v2) // => { x: 2, y: 3 }

pipe(A.string, A.intercalate("|"), (ass) => ass.combine("hello", "world")) // hello|world

type User = {
  readonly id: number
  readonly name: string
  readonly createdAt: Date
}

const user1: User = { id: 1, name: "Corentin", createdAt: new Date("1997-10-01") }
const user2: User = { id: 2, name: "Morgane", createdAt: new Date("1998-10-01") }
const user3: User = { id: 3, name: "Samih", createdAt: new Date("1999-10-01") }

const res = NonEmptyArray.getAssociative<User>()

/**
 [
  { id: 1, name: 'Corentin' },
  { id: 2, name: 'Morgane' },
  { id: 3, name: 'Samih' }
]
 */
res.combine([user1], [user2, user3])

// internal APIs
const getCurrent: () => User = () => user1
const getHistory: () => ReadonlyArray<User> = () => [user2, user3]

const getUser = (SemigroupUser: A.Associative<User>) => (): User => {
  const current = getCurrent()
  const history = getHistory()
  // merge immediately
  return A.fold(SemigroupUser)(current)(history)
}

const getMostRecentUser: () => User = getUser(
  A.max(Ord.makeOrd<User>((x, y) => Ord.date.compare(x.createdAt, y.createdAt)))
)

getMostRecentUser() // { id: 3, name: 'Samih', createdAt: 1999-10-01T00:00:00.000Z }

const getLeastRecentUser: () => User = getUser(
  A.min(Ord.makeOrd<User>((x, y) => Ord.date.compare(x.createdAt, y.createdAt)))
)

getLeastRecentUser() //{ id: 1, name: 'Corentin', createdAt: 1997-10-01T00:00:00.000Z }

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

// Eq

pipe(
  [1, 2, 3],
  Array.filter((elem) => Equal.number.equals(elem, 1)) // [1]
)

pipe(
  [1, 2, 3],
  Array.elem(Equal.number)(1) // true
)

type Point = {
  readonly x: number
  readonly y: number
}

const eqPoint: Equal.Equal<Point> = {
  equals: (first, second) => first.x === second.x && first.y === second.y
}

const points: ReadonlyArray<Point> = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 2 }
]

const search: Point = { x: 1, y: 1 }

pipe(points, Array.elem(eqPoint)(search)) // true

const structEqPoint: Equal.Equal<Point> = Equal.struct({
  x: Equal.number,
  y: Equal.number
})

const arrPointEq = Array.getEqual(structEqPoint)

arrPointEq.equals([{ x: 1, y: 2 }], [{ x: 1, y: 2 }]) // true

const eqUserStandard: Equal.Equal<User> = Equal.struct<User>({
  id: Equal.number,
  name: Equal.string,
  createdAt: Equal.date
})

/**
 * Rather than manually defining EqId we can use the combinator contramap:
 * given an instance Eq<A> and a function from B to A, we can derive an Eq<B>
 */
const eqUserId: Equal.Equal<User> = pipe(
  Equal.number,
  Equal.contramap((user) => user.id)
)

eqUserStandard.equals(
  { id: 1, name: "Giulio", createdAt: new Date("1999-02-01") },
  { id: 1, name: "Giulio Canti", createdAt: new Date("1999-02-01") }
) // => false (because the `name` property differs)

eqUserId.equals(
  { id: 1, name: "Giulio", createdAt: new Date("1999-02-01") },
  { id: 1, name: "Giulio Canti", createdAt: new Date("1999-02-01") }
) // true (even though the `name` property differs)

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
