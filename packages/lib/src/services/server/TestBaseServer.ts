import http from "node:http";

import express from "express";
import type { Container } from "inversify";

import {
  errorMiddleware,
  jsonMiddleware,
  notFoundHandler,
  urlEncoderMiddleware,
} from "./middlewares";
import { ControllerLoader } from "./services";
import type { ClassConstructor, IApplication } from "./types";

export interface ITestBaseServer {
  getApp(): IApplication;
  listen(port: number, hostName?: string): void;
}

export type TestBaseServerConfig = {
  container: Container;
  controllerClasses: readonly ClassConstructor[];
  basePath?: string;
};

export abstract class TestBaseServer implements ITestBaseServer {
  protected readonly app: IApplication;

  constructor(config: TestBaseServerConfig) {
    this.app = express();

    this.app.use(jsonMiddleware());
    this.app.use(urlEncoderMiddleware());

    ControllerLoader.loadAllControllers({
      info: { basePath: config.basePath },
      expressApplication: this.app,
      dependencyContainer: config.container,
      controllerClasses: config.controllerClasses,
    });

    this.init();

    this.app.use(notFoundHandler);
    this.app.use(errorMiddleware);
  }

  protected abstract init(): void;

  public getApp(): IApplication {
    return this.app;
  }

  public listen(port: number, hostName: string = "0.0.0.0") {
    const server = http.createServer(this.app);

    server.listen(port, hostName, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  }
}
