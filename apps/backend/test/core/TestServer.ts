import { Container } from "inversify";

import {
  type ClassConstructor,
  TestBaseServer,
} from "@workspace/server-core/framework";

export class TestServer extends TestBaseServer {
  constructor(
    container: Container,
    controllerClasses: readonly ClassConstructor[]
  ) {
    super({
      basePath: "/api/v1",
      container,
      controllerClasses,
    });

    this.init();
  }

  init() {}
}
