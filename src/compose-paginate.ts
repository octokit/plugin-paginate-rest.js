import { paginate } from "./paginate.js";
import { iterator } from "./iterator.js";

import type { ComposePaginateInterface } from "./types.js";

export const composePaginateRest = Object.assign(paginate, {
  iterator,
}) as ComposePaginateInterface;
