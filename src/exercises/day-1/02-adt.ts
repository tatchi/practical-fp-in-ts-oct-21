import { Tagged } from "@effect-ts/core/Case"
import { pipe } from "@effect-ts/system/Function"

interface B {
  _tag: "B"
  b: string
}

interface A {
  _tag: "A"
  a: number
}

/**
 * Theory:
 *
 * Intro to algebraic data types & domain specific languages and their place in functional programming in general.
 *
 * In this module we introduce the basic concepts of domain specific languages and we look into practical ways of building DSLs for
 * your day-to-day problems.
 */

type AB = A | B

export function ab(x: AB): number {
  switch (x._tag) {
    case "A": {
      return x.a
    }
    case "B": {
      return x.b.length
    }
  }
}

interface A1 {
  A1: {
    n: number
  }
}

interface A2 {
  A2: {
    n: string
  }
}

export const ab1: A1 & A2 = { A1: { n: 0 }, A2: { n: "str" } }

/**
 * Segment:
 *
 * ADTs
 */

/**
 * Exercise:
 *
 * Costruct the Boolean ADT and 3 functions: equals, invert, render
 */
export class True {
  readonly _tag = "True"
}
export class False {
  readonly _tag = "False"
}
export type Bool = True | False

export function fromBoolean(b: boolean): Bool {
  return b ? new True() : new False()
}
export function equal(b: Bool): (a: Bool) => Bool {
  return (a) => (b._tag === a._tag ? fromBoolean(true) : fromBoolean(false))
}
export function invert(a: Bool): Bool {
  return a._tag === "False" ? fromBoolean(true) : fromBoolean(false)
}
export function render_(a: Bool): "True" | "False" {
  return a._tag === "False" ? "True" : "False"
}

export const shouldBeTrue = pipe(fromBoolean(true), invert, equal(fromBoolean(false)))

/**
 * Exercise:
 *
 * Build an adt MathExpr with members:
 * - Value (contains a numeric value)
 * - Add (describe a sum operation of 2 expressions)
 * - Sub (describe a subtraction operation of 2 expressions)
 * - Mul (describe a multiplication operation of 2 expressions)
 * - Div (describe a division operation of 2 expressions)
 */
export type MathExpr = Value | Add | Sub | Mul | Div

export class Value extends Tagged("Value")<{ readonly n: number }> {}

export class Add extends Tagged("Add")<{
  readonly left: MathExpr
  readonly right: MathExpr
}> {}

export class Sub extends Tagged("Sub")<{
  readonly left: MathExpr
  readonly right: MathExpr
}> {}

export class Mul extends Tagged("Mul")<{
  readonly left: MathExpr
  readonly right: MathExpr
}> {}

export class Div extends Tagged("Div")<{
  readonly left: MathExpr
  readonly right: MathExpr
}> {}

/**
 * Exercise:
 *
 * Create constructors & combinators for all the members in MathExpr (pipeable)
 */

export function fromNumber(n: number): MathExpr {
  return new Value({ n })
}

export function add(that: MathExpr) {
  return (self: MathExpr): MathExpr => new Add({ left: self, right: that })
}

export function mul(that: MathExpr) {
  return (self: MathExpr): MathExpr => new Mul({ left: self, right: that })
}

export function sub(that: MathExpr) {
  return (self: MathExpr): MathExpr => new Sub({ left: self, right: that })
}

export function div(that: MathExpr) {
  return (self: MathExpr): MathExpr => new Div({ left: self, right: that })
}

/**
 * Exercise:
 *
 * Create a small program using the MathExpr module api
 */

export const program = pipe(fromNumber(0), add(fromNumber(1)), mul(fromNumber(2)))
export const program2 = pipe(fromNumber(0), add(fromNumber(1)), mul(fromNumber(2)))

/**
 * Exercise:
 *
 * Implement the function "evaluate" that computes a MathExpr producing number
 */
export function evaluate(expr: MathExpr): number {
  switch (expr._tag) {
    case "Value": {
      return expr.n
    }
    case "Add": {
      return evaluate(expr.left) + evaluate(expr.right)
    }
    case "Mul": {
      return evaluate(expr.left) * evaluate(expr.right)
    }
    case "Div": {
      return evaluate(expr.left) / evaluate(expr.right)
    }
    case "Sub": {
      return evaluate(expr.left) - evaluate(expr.right)
    }
  }
}

/**
 * Exercise:
 *
 * Implement the function "render" that renders a MathExpr producing a string ((2 * 3) + (3 - 2))
 */
export function render(expr: MathExpr): string {
  switch (expr._tag) {
    case "Value": {
      return `${expr.n}`
    }
    case "Add": {
      return `(${render(expr.left)} + ${render(expr.right)})`
    }
    case "Mul": {
      return `(${render(expr.left)} * ${render(expr.right)})`
    }
    case "Div": {
      return `(${render(expr.left)} / ${render(expr.right)})`
    }
    case "Sub": {
      return `(${render(expr.left)} - ${render(expr.right)})`
    }
  }
}

/**
 * Exercise:
 *
 * Write tests that assert correct behaviour of the evaluate & render function
 */

/**
 * Exercise:
 *
 * Use the Tagged helper to rewrite MathExpr
 */

/**
 * Exercise:
 *
 * Model a portfolio of assets and write a pnl function that returns
 * the profit and losses of the portfolio, every asset can be either:
 * - Real Estate Property: purchase date, purchase price, current price
 * - Stock: purchase date, purchase price, cumulated dividends
 * - Foreign Currency: purchase date, purchase price, current price
 */
