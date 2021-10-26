import { pipe } from "@effect-ts/system/Function"
import * as MathExpr from "./01-MathExpr"

function string_of_number(n: number): string {
  return n.toString()
}

// @ts-expect-error
string_of_number(MathExpr.fromNumber(6))

MathExpr.add(MathExpr.fromNumber(3))(MathExpr.fromNumber(5)) // {n: 8}

export const x = pipe(
  MathExpr.fromNumber(0),
  MathExpr.add(MathExpr.fromNumber(1)),
  MathExpr.mul(MathExpr.fromNumber(2)),
  MathExpr.get
) // 2
