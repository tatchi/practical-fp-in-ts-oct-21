import { pipe } from "@effect-ts/core/Function"
import {
  limitRetries,
  RetryPolicy,
  RetryStatus,
  exponentialBackoff,
  Monoid
} from "./01_retry"
import * as O from "@effect-ts/core/Option"

export const dryRun = (policy: RetryPolicy): ReadonlyArray<RetryStatus> => {
  const apply = RetryStatus.applyPolicy(policy)
  let status: RetryStatus = apply(RetryStatus.defaultRetryStatus)
  const out: Array<RetryStatus> = [status]
  while (O.isSome(status.previousDelay)) {
    out.push((status = apply(out[out.length - 1])))
  }
  return out
}

const status = pipe(
  RetryStatus.defaultRetryStatus,
  RetryStatus.applyPolicy(exponentialBackoff(200)),
  RetryStatus.applyPolicy(limitRetries(5))
)

// pipe(limitRetries(5), dryRun, console.log)

const combined = Monoid.combine(exponentialBackoff(200), limitRetries(5))

pipe(combined, dryRun, console.log)
