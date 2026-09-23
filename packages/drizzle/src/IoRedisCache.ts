import { entityKind, getTableName } from "drizzle-orm";
import { Cache } from "drizzle-orm/cache/core";
import { type MutationOption } from "drizzle-orm/cache/core";
import { type CacheConfig } from "drizzle-orm/cache/core/types";
import Redis, { type ChainableCommander } from "ioredis";

export type RedisType = Redis;

/**
 * Retrieves the cached value for a given tag from its composite table hash.
 *
 * KEYS[1] - tags map key
 * ARGV[1] - tag
 */
const getByTagScript = `
local tagsMapKey = KEYS[1] -- tags map key
local tag        = ARGV[1] -- tag

local compositeTableName = redis.call('HGET', tagsMapKey, tag)
if not compositeTableName then
  return nil
end

local value = redis.call('HGET', compositeTableName, tag)
return value
`;

/**
 * Invalidates the cache entries belonging to the given tags and tables.
 *
 * KEYS[1]     - tags map key
 * KEYS[2..n]  - composite table set keys for each mutated table
 * ARGV[1..n]  - tags to invalidate
 */
const onMutateScript = `
local tagsMapKey = KEYS[1] -- tags map key
local tables     = {}      -- initialize tables array
local tags       = ARGV    -- tags array

for i = 2, #KEYS do
  tables[#tables + 1] = KEYS[i] -- add all keys except the first one to tables
end

if #tags > 0 then
  for _, tag in ipairs(tags) do
    if tag ~= nil and tag ~= '' then
      local compositeTableName = redis.call('HGET', tagsMapKey, tag)
      if compositeTableName then
        redis.call('HDEL', compositeTableName, tag)
      end
    end
  end
  redis.call('HDEL', tagsMapKey, unpack(tags))
end

local keysToDelete = {}

if #tables > 0 then
  local compositeTableNames = redis.call('SUNION', unpack(tables))
  for _, compositeTableName in ipairs(compositeTableNames) do
    keysToDelete[#keysToDelete + 1] = compositeTableName
  end
  for _, table in ipairs(tables) do
    keysToDelete[#keysToDelete + 1] = table
  end
  redis.call('DEL', unpack(keysToDelete))
end
`;

type HexOption = NonNullable<CacheConfig["hexOptions"]>;
type NormalizedHexOption = "NX" | "XX" | "GT" | "LT";

interface IoredisCacheInternalConfig {
  seconds: number;
  hexOptions?: NormalizedHexOption;
}

export interface IoredisCacheOptions {
  redis?: RedisType;
  url?: string;
  config?: CacheConfig;
  global?: boolean;
}

export class IoredisCache extends Cache {
  static override readonly [entityKind]: string = "IoredisCache";

  /**
   * Prefix for sets which denote the composite table names for each unique table.
   *
   * Example: In the composite table set of "table1", you may find
   * `${compositeTableSetPrefix}table1,table2` and `${compositeTableSetPrefix}table1,table3`.
   */
  static readonly compositeTableSetPrefix = "__CTS__";

  /**
   * Prefix for hashes which map hash or tags to cache values.
   */
  static readonly compositeTablePrefix = "__CT__";

  /**
   * Key which holds the mapping of tags to composite table names.
   */
  static readonly tagsMapKey = "__tagsMap__";

  /**
   * Queries whose auto invalidation is false aren't stored in their respective
   * composite table hashes because those hashes are deleted when a mutation
   * occurs on related tables. Instead, they are stored in a separate hash with
   * the prefix `__nonAutoInvalidate__`.
   */
  static readonly nonAutoInvalidateTablePrefix = "__nonAutoInvalidate__";

  private readonly internalConfig: IoredisCacheInternalConfig;
  private readonly useGlobally: boolean;

  constructor(
    private readonly redis: RedisType,
    config?: CacheConfig,
    useGlobally = false
  ) {
    super();
    this.useGlobally = useGlobally;
    this.internalConfig = this.toInternalConfig(config);
  }

  override strategy(): "explicit" | "all" {
    return this.useGlobally ? "all" : "explicit";
  }

  override async get<T>(
    key: string,
    tables: string[] = [],
    isTag = false,
    isAutoInvalidate = true
  ): Promise<T[] | undefined> {
    if (!isAutoInvalidate) {
      const result = await this.redis.hget(
        IoredisCache.nonAutoInvalidateTablePrefix,
        key
      );
      return this.parse<T>(result);
    }

    if (isTag) {
      const result = await this.redis.eval(
        getByTagScript,
        1,
        IoredisCache.tagsMapKey,
        key
      );
      return this.parse<T>(result);
    }

    const compositeKey = this.getCompositeKey(tables);
    const result = await this.redis.hget(compositeKey, key);
    return this.parse<T>(result);
  }

  override async put<T>(
    key: string,
    response: T,
    tables: string[],
    isTag = false,
    config?: CacheConfig
  ): Promise<void> {
    const isAutoInvalidate = tables.length !== 0;
    const pipeline = this.redis.pipeline();
    const ttlSeconds = config?.ex ?? this.internalConfig.seconds;
    const hexOptions = config?.hexOptions ?? this.internalConfig.hexOptions;
    const serialized = JSON.stringify(response);

    if (!isAutoInvalidate) {
      if (isTag) {
        pipeline.hset(IoredisCache.tagsMapKey, {
          [key]: IoredisCache.nonAutoInvalidateTablePrefix,
        });
        this.scheduleFieldExpiry(
          pipeline,
          IoredisCache.tagsMapKey,
          key,
          ttlSeconds,
          hexOptions
        );
      }

      pipeline.hset(IoredisCache.nonAutoInvalidateTablePrefix, {
        [key]: serialized,
      });
      this.scheduleFieldExpiry(
        pipeline,
        IoredisCache.nonAutoInvalidateTablePrefix,
        key,
        ttlSeconds,
        hexOptions
      );

      await pipeline.exec();
      return;
    }

    const compositeKey = this.getCompositeKey(tables);
    pipeline.hset(compositeKey, { [key]: serialized });
    this.scheduleFieldExpiry(
      pipeline,
      compositeKey,
      key,
      ttlSeconds,
      hexOptions
    );

    if (isTag) {
      pipeline.hset(IoredisCache.tagsMapKey, { [key]: compositeKey });
      this.scheduleFieldExpiry(
        pipeline,
        IoredisCache.tagsMapKey,
        key,
        ttlSeconds,
        hexOptions
      );
    }

    for (const table of tables) {
      pipeline.sadd(this.addTablePrefix(table), compositeKey);
    }

    await pipeline.exec();
  }

  override async onMutate(params: MutationOption): Promise<void> {
    const tags = Array.isArray(params.tags)
      ? params.tags
      : params.tags
        ? [params.tags]
        : [];
    const tables = Array.isArray(params.tables)
      ? params.tables
      : params.tables
        ? [params.tables]
        : [];
    const tableNames = tables.map((table) =>
      typeof table === "string" ? table : getTableName(table)
    );
    const compositeTableSets = tableNames.map((table) =>
      this.addTablePrefix(table)
    );
    const keys = [IoredisCache.tagsMapKey, ...compositeTableSets];

    await this.redis.eval(onMutateScript, keys.length, ...keys, ...tags);
  }

  private toInternalConfig(config?: CacheConfig): IoredisCacheInternalConfig {
    const hexOptions = config?.hexOptions
      ? (config.hexOptions.toUpperCase() as NormalizedHexOption)
      : undefined;

    return {
      seconds: config?.ex ?? 1,
      hexOptions,
    };
  }

  private scheduleFieldExpiry(
    pipeline: ChainableCommander,
    key: string,
    field: string,
    seconds: number,
    hexOptions?: HexOption
  ): void {
    const option = (hexOptions ? hexOptions.toUpperCase() : undefined) as
      | NormalizedHexOption
      | undefined;

    if (option) {
      pipeline.hexpire(key, seconds, option as "NX", "FIELDS", 1, field);
      return;
    }

    pipeline.hexpire(key, seconds, "FIELDS", 1, field);
  }

  private parse<T>(raw: unknown): T[] | undefined {
    if (raw === null || raw === undefined) {
      return undefined;
    }
    if (typeof raw !== "string") {
      return raw as T[];
    }
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return undefined;
    }
  }

  private addTablePrefix(table: string): string {
    return `${IoredisCache.compositeTableSetPrefix}${table}`;
  }

  private getCompositeKey(tables: string[]): string {
    return `${IoredisCache.compositeTablePrefix}${[...tables].sort().join(",")}`;
  }
}
