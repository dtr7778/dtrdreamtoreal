import { BindingScope, injectable } from "inversify";

import { REFLECT_KEYS } from "../constant";
import { IControllerDefinition } from "../types";
import { pathNormalize } from "../utils/path.utils";

export interface IControllerDecoratorOptions extends Omit<
  IControllerDefinition,
  "controllerClass"
> {
  scope?: BindingScope;
}

export function Controller(
  options?: IControllerDecoratorOptions
): ClassDecorator {
  return function (targetClass: NewableFunction) {
    const controllerMetadata: IControllerDefinition = {
      controllerClass: targetClass,
      path: pathNormalize(options?.path ?? "/"),
      tags: options?.tags ?? [],
      securitySchemes: options?.securitySchemes ?? [],
    };

    injectable(options?.scope)(targetClass);

    Reflect.defineMetadata(
      REFLECT_KEYS.CONTROLLER,
      controllerMetadata,
      targetClass
    );
  };
}
