import { paginate } from "./paginate";
import { iterator } from "./iterator";

import type { ComposePaginateInterface } from "./types";

export const composePaginateRest = Object.assign(paginate, {
  iterator,
}) as ComposePaginateInterface;
