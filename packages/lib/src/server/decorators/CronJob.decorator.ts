import { type BindingScope, injectable } from "inversify";

import { REFLECT_KEYS } from "../constant";
import { ICronJobDefinition } from "../types";

export interface ICronJobClassOptions {
  scope?: BindingScope;
}

/**
 * Decorator to mark a class as containing Cron Jobs
 * @param scope - InversifyJS binding scope
 */
export function CronJobClass(options?: ICronJobClassOptions): ClassDecorator {
  return function (targetClass: NewableFunction) {
    Reflect.defineMetadata(REFLECT_KEYS.CRON_JOB_CLASS, true, targetClass);

    injectable(options?.scope)(targetClass);
  };
}

export interface ICronJobConfigs {
  jobName?: string;
  runOnInit?: boolean;
  timezone?: string;
}

/**
 * Decorator to mark a method as a Cron Job
 * @param cronExpression - Cron expression (e.g., "0 0 * * *" for daily at midnight)
 * @param options - Additional configuration options
 */
export function CronJob(
  cronExpression: string,
  options?: ICronJobConfigs
): MethodDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const jobClass = target.constructor;

    const existingJobs: ICronJobDefinition[] =
      Reflect.getMetadata(REFLECT_KEYS.CRON_JOB_METHOD, jobClass) || [];

    const cronJobDefinition: ICronJobDefinition = {
      cronExpression,
      methodName: propertyKey as string,
      jobName: options?.jobName || `${jobClass.name}.${String(propertyKey)}`,
      runOnInit: options?.runOnInit ?? false,
      timezone: options?.timezone ?? "America/New_York",
    };

    existingJobs.push(cronJobDefinition);

    Reflect.defineMetadata(
      REFLECT_KEYS.CRON_JOB_METHOD,
      existingJobs,
      jobClass
    );
  };
}
