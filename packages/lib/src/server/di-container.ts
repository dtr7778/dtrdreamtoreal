import { Container } from "inversify";

import { ApiErrorFilter } from "./classes";

const container = new Container();

container
  .bind<ApiErrorFilter>(ApiErrorFilter)
  .to(ApiErrorFilter)
  .inSingletonScope();

export { container };
