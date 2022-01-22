import { pipe } from "@effect-ts/system/Function"
import { Tagged } from "@effect-ts/core/Case"
import { matchTag } from "@effect-ts/system/Utils"
import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"

interface A {
  readonly _tag: "A"
  readonly a: number
}
interface B {
  readonly _tag: "B"
  readonly b: string
}

type AB = A | B

export function ab(x: AB): number {
  switch (x._tag) {
    case "A":
      return x.a
    case "B":
      return x.b.length
  }
}

/**
 * Theory:
 *
 * Intro to algebraic data types & domain specific languages and their place in functional programming in general.
 *
 * In this module we introduce the basic concepts of domain specific languages and we look into practical ways of building DSLs for
 * your day-to-day problems.
 */

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

interface True {
  readonly _tag: "true"
}

interface False {
  readonly _tag: "false"
}

type Bool = True | False

function fromBoolean(b: boolean): Bool {
  return b === true ? { _tag: "true" } : { _tag: "false" }
}

function equals(b: Bool): (a: Bool) => Bool {
  return (a) => (a._tag === b._tag ? fromBoolean(true) : fromBoolean(false))
}

function invert(b: Bool): Bool {
  return b._tag === "true" ? fromBoolean(false) : fromBoolean(true)
}

function render(b: Bool): "True" | "False" {
  return b._tag === "true" ? "True" : "False"
}

const shouldBeTrue = pipe(fromBoolean(true), invert, equals(fromBoolean(false)), render)

console.log(shouldBeTrue)

// import * as IO from "./01-io"

// const x = pipe(
//   IO.fromSync(() => fromBoolean(true)),
//   IO.map(invert),
//   IO.map(equals(fromBoolean(false))),
//   IO.map(render),
//   IO.map((value) => console.log(value))
// )

// IO.unsafeRun(x)

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

type MathExpr = Value | Add | Sub | Mul | Div

interface Value {
  readonly _tag: "Value"
  readonly n: number
}
interface Add {
  readonly _tag: "Add"
  readonly leftExpr: MathExpr
  readonly rightExpr: MathExpr
}
interface Sub {
  readonly _tag: "Sub"
  readonly leftExpr: MathExpr
  readonly rightExpr: MathExpr
}
interface Mul {
  readonly _tag: "Mul"
  readonly leftExpr: MathExpr
  readonly rightExpr: MathExpr
}
interface Div {
  readonly _tag: "Div"
  readonly leftExpr: MathExpr
  readonly rightExpr: MathExpr
}

/**
 * Exercise:
 *
 * Create constructors for all the members in MathExpr (pipeable)
 */

function fromNumber(n: number): MathExpr {
  return { _tag: "Value", n }
}

function add(that: MathExpr): (self: MathExpr) => MathExpr {
  return (self) => ({ _tag: "Add", leftExpr: that, rightExpr: self })
}
function sub(that: MathExpr): (self: MathExpr) => MathExpr {
  return (self) => ({ _tag: "Sub", leftExpr: that, rightExpr: self })
}
function mul(that: MathExpr): (self: MathExpr) => MathExpr {
  return (self) => ({ _tag: "Mul", leftExpr: that, rightExpr: self })
}
function div(that: MathExpr): (self: MathExpr) => MathExpr {
  return (self) => ({ _tag: "Div", leftExpr: that, rightExpr: self })
}

/**
 * Exercise:
 *
 * Create a small program using the MathExpr constructors
 */

const program = pipe(fromNumber(1), add(fromNumber(2)), mul(fromNumber(3)))

/**
 * Exercise:
 *
 * Implement the function evaluate MathExpr => number
 */

function evaluate(expr: MathExpr): number {
  switch (expr._tag) {
    case "Value":
      return expr.n
    case "Add":
      return evaluate(expr.leftExpr) + evaluate(expr.rightExpr)
    case "Sub":
      return evaluate(expr.leftExpr) - evaluate(expr.rightExpr)
    case "Mul":
      return evaluate(expr.leftExpr) * evaluate(expr.rightExpr)
    case "Div":
      return evaluate(expr.leftExpr) / evaluate(expr.rightExpr)
  }
}

console.log(evaluate(program)) // 9

/**
 * Exercise:
 *
 * Implement the function "render" that renders a MathExpr producing a string ((2 * 3) + (3 - 2))
 */

function renderMathExpr(expr: MathExpr): string {
  switch (expr._tag) {
    case "Value":
      return expr.n.toString()
    case "Add":
      return `(${renderMathExpr(expr.leftExpr)} + ${renderMathExpr(expr.rightExpr)})`
    case "Sub":
      return `(${renderMathExpr(expr.leftExpr)} - ${renderMathExpr(expr.rightExpr)})`
    case "Mul":
      return `(${renderMathExpr(expr.leftExpr)} * ${renderMathExpr(expr.rightExpr)})`
    case "Div":
      return `(${renderMathExpr(expr.leftExpr)} / ${renderMathExpr(expr.rightExpr)})`
  }
}

console.log(renderMathExpr(program)) // (3 * (2 + 1))

/**
 * Exercise:
 *
 * Write tests that assert correct behaviour of the evaluate function
 */

/**
 * Exercise:
 *
 * Use the Tagged helper to rewrite MathExpr
 */

type MathExprTag = ValueTag | AddTag | SubTag | MulTag | DivTag

class ValueTag extends Tagged("Value")<{ readonly n: number }> {}
class AddTag extends Tagged("Add")<{
  readonly leftExpr: MathExprTag
  readonly rightExpr: MathExprTag
}> {}
class SubTag extends Tagged("Sub")<{
  readonly leftExpr: MathExprTag
  readonly rightExpr: MathExprTag
}> {}
class MulTag extends Tagged("Mul")<{
  readonly leftExpr: MathExprTag
  readonly rightExpr: MathExprTag
}> {}
class DivTag extends Tagged("Div")<{
  readonly leftExpr: MathExprTag
  readonly rightExpr: MathExprTag
}> {}

function fromNumberTag(n: number): MathExprTag {
  return new ValueTag({ n })
}

function addTag(that: MathExprTag) {
  return (self: MathExprTag): MathExprTag =>
    new AddTag({
      leftExpr: that,
      rightExpr: self
    })
}
function subTag(that: MathExprTag) {
  return (self: MathExprTag): MathExprTag =>
    new SubTag({
      leftExpr: that,
      rightExpr: self
    })
}
function mulTag(that: MathExprTag) {
  return (self: MathExprTag): MathExprTag =>
    new MulTag({
      leftExpr: that,
      rightExpr: self
    })
}
function divTag(that: MathExprTag) {
  return (self: MathExprTag): MathExprTag =>
    new DivTag({
      leftExpr: that,
      rightExpr: self
    })
}

function evaluateTag(expr: MathExprTag): number {
  switch (expr._tag) {
    case "Value":
      return expr.n
    case "Add":
      return evaluateTag(expr.leftExpr) + evaluateTag(expr.rightExpr)
    case "Sub":
      return evaluateTag(expr.leftExpr) - evaluateTag(expr.rightExpr)
    case "Mul":
      return evaluateTag(expr.leftExpr) * evaluateTag(expr.rightExpr)
    case "Div":
      return evaluateTag(expr.leftExpr) / evaluateTag(expr.rightExpr)
  }
}

/**
 * Exercise:
 *
 * Model a portfolio of assets and write a pnl(portfolio) function that returns
 * the profit and losses of the portfolio, every asset can be either:
 * - Real Estate Property: purchase date, purchase price, current price
 * - Stock: purchase date, purchase price, cumulated dividends
 * - Foreign Currency: purchase date, purchase price, current price
 */

type AssetType = RealEstate | Stock | ForeignCurrency

class RealEstate extends Tagged("RealEstate")<{
  readonly purchasePrice: number
  readonly currentPrice: number
}> {}
class Stock extends Tagged("Stock")<{
  readonly purchasePrice: number
  readonly currentPrice: number
  readonly cumulatedDividends: number
}> {}

class ForeignCurrency extends Tagged("ForeignCurrency")<{
  readonly purchasePrice: number
  readonly currentPrice: number
}> {}

function realEstate(_: {
  readonly purchasePrice: number
  readonly currentPrice: number
}): AssetType {
  return new RealEstate(_)
}
function stock(_: {
  readonly purchasePrice: number
  readonly currentPrice: number
  readonly cumulatedDividends: number
}): AssetType {
  return new Stock(_)
}
function foreignCurrency(_: {
  readonly purchasePrice: number
  readonly currentPrice: number
}): AssetType {
  return new ForeignCurrency(_)
}

function assetPnl(asset: AssetType): number {
  return pipe(
    asset,
    matchTag({
      RealEstate: ({ currentPrice, purchasePrice }) => currentPrice - purchasePrice,
      ForeignCurrency: ({ currentPrice, purchasePrice }) =>
        currentPrice - purchasePrice,
      Stock: ({ cumulatedDividends, purchasePrice, currentPrice }) =>
        cumulatedDividends + (currentPrice - purchasePrice)
    })
  )
}

const asset1 = foreignCurrency({ currentPrice: 10, purchasePrice: 7 }) // 3
const asset2 = foreignCurrency({ currentPrice: 10, purchasePrice: 5 }) // 5

console.log([asset1, asset2].reduce((acc, value) => acc + assetPnl(value), 0)) // 8

// With a portfolio

class Portfolio extends Tagged("Portfolio")<{
  // readonly assets: AssetType[]
  readonly assets: Chunk.Chunk<AssetType>
}> {}

function empty(): Portfolio {
  return new Portfolio({ assets: Chunk.empty() })
}

function addAsset(asset: AssetType) {
  return (self: Portfolio): Portfolio => {
    // const newAssets = pipe(self.assets, Chunk.append(asset))
    return new Portfolio({ assets: Chunk.append_(self.assets, asset) })
  }
}

const portfolio = pipe(empty(), addAsset(asset1), addAsset(asset2))

function pnl(portfolio: Portfolio): number {
  return Chunk.reduce_(portfolio.assets, 0, (acc, asset) => acc + assetPnl(asset))
}
