import { paginate } from "./paginate";
import { iterator } from "./iterator";

import { ComposePaginateInterface } from "./types";

export const composePaginateRest = Object.assign(paginate, {
  iterator,
}) as ComposePaginateInterface;
