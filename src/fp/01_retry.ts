/**
 * https://github.com/enricopolanski/functional-programming/blob/master/src/01_retry.ts
 * See also: https://github.com/gcanti/retry-ts/blob/master/src/index.ts
 */

import * as O from "@effect-ts/core/Option"
import { Tagged } from "@effect-ts/core/Case"
import { matchTag } from "@effect-ts/system/Utils"
import * as Ord from "@effect-ts/core/Ord"
import * as I from "@effect-ts/core/Identity"
import { pipe } from "@effect-ts/core/Function"
import { Associative } from "@effect-ts/core"

const RetryStatusId: unique symbol = Symbol()
type RetryStatusId = typeof RetryStatusId

export class RetryStatus {
  // @ts-ignore
  private readonly [RetryStatusId]: RetryStatusId = RetryStatusId
  /** Iteration number, where `0` is the first try */
  readonly iterNumber: number
  /** Delay incurred so far from retries */
  readonly cumulativeDelay: number
  /** Latest attempt's delay. Will always be `none` on first run. */
  readonly previousDelay: O.Option<number>
  private constructor(params: {
    iterNumber: number
    previousDelay: O.Option<number>
    cumulativeDelay: number
  }) {
    this.iterNumber = params.iterNumber
    this.cumulativeDelay = params.cumulativeDelay
    this.previousDelay = params.previousDelay
  }

  static make = (_: {
    readonly iterNumber: number
    readonly previousDelay: O.Option<number>
    readonly cumulativeDelay: number
  }) => new RetryStatus(_)

  static readonly defaultRetryStatus = new RetryStatus({
    iterNumber: 0,
    cumulativeDelay: 0,
    previousDelay: O.none
  })

  static readonly applyPolicy = (policy: RetryPolicy) => {
    return (status: RetryStatus): RetryStatus => {
      const delay = policy(status)

      return RetryStatus.make({
        iterNumber: status.iterNumber + 1,
        cumulativeDelay: status.cumulativeDelay + O.getOrElse_(delay, () => 0),
        previousDelay: delay
      })
    }
  }
}

export interface RetryPolicy {
  (status: RetryStatus): O.Option<number>
}

export function limitRetries(i: number): RetryPolicy {
  return (status) => (status.iterNumber >= i ? O.none : O.some(0))
}

export function limitRetriesByDelay(
  maxDelay: number,
  policy: RetryPolicy
): RetryPolicy {
  return (status) =>
    pipe(
      status,
      policy,
      O.filter((delay) => delay < maxDelay)
    )
}

export function constantDelay(delay: number): RetryPolicy {
  return () => O.some(delay)
}

export function capDelay(maxDelay: number, policy: RetryPolicy): RetryPolicy {
  return (status) =>
    pipe(
      status,
      policy,
      O.map((delay) => Math.min(maxDelay, delay))
    )
}

export function exponentialBackoff(delay: number): RetryPolicy {
  return (status) => O.some(delay * status.iterNumber)
}

// Because there's currently a bug: https://github.com/Effect-TS/core/pull/1026
export function getApplyIdentity<A>(M: I.Identity<A>): I.Identity<O.Option<A>> {
  return I.fromAssociative(O.getApplyAssociative(M))(O.some(M.identity))
}

export const Monoid = I.func(
  getApplyIdentity(I.makeIdentity(0, Ord.max(Ord.number)))
)<RetryStatus>() // RetryStatus -> Option<number>

// class ConstantDelay extends Tagged("ConstantDelay")<{
//   readonly delay: number
// }> {
//   static of = (delay: number) => new ConstantDelay({ delay })
// }

// /**
//  * Retry immediately, but only up to `i` times.
//  */
// class LimitRetries extends Tagged("LimitRetry")<{
//   readonly limit: number
// }> {
//   static of = (limit: number) => new LimitRetries({ limit })
// }

// class DoubleBackoff extends Tagged("DoubleBackoff")<{ readonly delay: number }> {
//   static of = (delay: number) => new DoubleBackoff({ delay })
// }

// // type RetryPolicy = ConstantDelay | LimitRetry | DoubleBackoff

// const RetryPolicyId: unique symbol = Symbol()
// type RetryPolicyId = typeof RetryPolicyId

// export class RetryPolicy {
//   readonly [RetryPolicyId]: RetryPolicyId = RetryPolicyId

//   private readonly policy: ConstantDelay | LimitRetries | DoubleBackoff

//   private constructor(policy: ConstantDelay | LimitRetries | DoubleBackoff) {
//     this.policy = policy
//   }

//   static readonly applyPolicy =
//     (retryPolicy: RetryPolicy) =>
//     (retryStatus: RetryStatus): RetryStatus => {
//       const delay = pipe(
//         retryPolicy.policy,
//         matchTag({
//           ConstantDelay: ({ delay }) => O.some(delay),
//           LimitRetry: ({ limit }) =>
//             retryStatus.iterNumber >= limit ? O.none : O.some(0),
//           DoubleBackoff: ({ delay }) =>
//             pipe(delay * Math.pow(2, retryStatus.iterNumber), O.some)
//         })
//       )
//       return RetryStatus.make({
//         iterNumber: retryStatus.iterNumber + 1,
//         previousDelay: delay
//       })
//     }

//   static readonly constantDelay = (delay: number) =>
//     new RetryPolicy(ConstantDelay.of(delay))
//   static readonly limitRetries = (limit: number) =>
//     new RetryPolicy(LimitRetries.of(limit))

//   static readonly doubleBackoff = (delay: number) =>
//     new RetryPolicy(new DoubleBackoff({ delay }))
// }
