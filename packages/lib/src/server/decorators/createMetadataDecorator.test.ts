import "reflect-metadata";

import { describe, expect, it } from "vitest";

import {
  createMetadataDecorator,
  getAllAndMergeMetadata,
} from "./createMetadataDecorator";

const KEY = "test:metadata";

class TestController {
  public list(): void {}
  public create(): void {}
}

describe("createMetadataDecorator", () => {
  it("stores class-level values", () => {
    const Decorate = createMetadataDecorator<string>(KEY);

    Decorate("class-a")(TestController);

    expect(
      getAllAndMergeMetadata<string>(KEY, [{ target: TestController }])
    ).toEqual(["class-a"]);
  });

  it("stores method-level values", () => {
    const Decorate = createMetadataDecorator<string>(`${KEY}:method`);

    Decorate("method-a")(TestController.prototype, "list");

    expect(
      getAllAndMergeMetadata<string>(`${KEY}:method`, [
        { target: TestController, propertyKey: "list" },
      ])
    ).toEqual(["method-a"]);
  });

  it("accumulates repeated applications", () => {
    const Decorate = createMetadataDecorator<string>(`${KEY}:repeat`);

    Decorate("a")(TestController);
    Decorate("b")(TestController);

    expect(
      getAllAndMergeMetadata<string>(`${KEY}:repeat`, [{ target: TestController }])
    ).toEqual(["a", "b"]);
  });

  it("merges class-level and method-level values in order", () => {
    const Decorate = createMetadataDecorator<string>(`${KEY}:merge`);

    Decorate("class-a")(TestController);
    Decorate("method-a")(TestController.prototype, "list");

    expect(
      getAllAndMergeMetadata<string>(`${KEY}:merge`, [
        { target: TestController },
        { target: TestController, propertyKey: "list" },
      ])
    ).toEqual(["class-a", "method-a"]);
  });

  it("returns an empty array when no metadata is declared", () => {
    expect(
      getAllAndMergeMetadata<string>(`${KEY}:absent`, [
        { target: TestController },
        { target: TestController, propertyKey: "create" },
      ])
    ).toEqual([]);
  });
});