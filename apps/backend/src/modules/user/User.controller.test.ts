import { TestServer } from "@test/core/TestServer";
import { StatusCodes } from "http-status-codes";
import { Container } from "inversify";
import request from "supertest";
import { beforeEach, describe, it } from "vitest";

import { ExtendedRedis } from "@workspace/lib/redis";
import { createMockRedisClient } from "@workspace/lib/redis/mock";
import { ApiErrorFilter, IApplication } from "@workspace/lib/server";

import { CONTAINER_TYPES } from "@/container/container-types";
import { UserController } from "@/modules/user/User.controller";

describe("UserController (Integration)", () => {
  let app: IApplication;
  let container: Container;

  beforeEach(() => {
    container = new Container();

    container
      .bind<ApiErrorFilter>(ApiErrorFilter)
      .to(ApiErrorFilter)
      .inSingletonScope();

    container
      .bind<ExtendedRedis>(CONTAINER_TYPES.Redis)
      .toDynamicValue(() => createMockRedisClient().Redis)
      .inSingletonScope();

    container.bind<UserController>(UserController).toSelf().inSingletonScope();

    app = new TestServer(container, [UserController]).getApp();
  });

  describe("GET /users", () => {
    it("should return all user with pagination", async () => {
      await request(app).get("/api/v1/users").expect(StatusCodes.OK);
    });
  });
});
