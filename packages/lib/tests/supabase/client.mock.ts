import type { SupabaseClient } from "@supabase/supabase-js";
import { vi } from "vitest";
import type { Mock } from "vitest";

function createQueryBuilder(defaultData: unknown = []) {
  const builder: Record<string, Mock> = {};

  const chain = () => builder;

  builder.select = vi.fn(chain);
  builder.insert = vi.fn(chain);
  builder.update = vi.fn(chain);
  builder.upsert = vi.fn(chain);
  builder.delete = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.neq = vi.fn(chain);
  builder.gt = vi.fn(chain);
  builder.gte = vi.fn(chain);
  builder.lt = vi.fn(chain);
  builder.lte = vi.fn(chain);
  builder.like = vi.fn(chain);
  builder.ilike = vi.fn(chain);
  builder.is = vi.fn(chain);
  builder.in = vi.fn(chain);
  builder.contains = vi.fn(chain);
  builder.containedBy = vi.fn(chain);
  builder.rangeLt = vi.fn(chain);
  builder.rangeGt = vi.fn(chain);
  builder.rangeGte = vi.fn(chain);
  builder.rangeLte = vi.fn(chain);
  builder.rangeAdjacent = vi.fn(chain);
  builder.overlaps = vi.fn(chain);
  builder.textSearch = vi.fn(chain);
  builder.match = vi.fn(chain);
  builder.not = vi.fn(chain);
  builder.or = vi.fn(chain);
  builder.filter = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.limit = vi.fn(chain);
  builder.range = vi.fn(chain);
  builder.abortSignal = vi.fn(chain);
  builder.single = vi
    .fn()
    .mockResolvedValue({ data: defaultData, error: null });
  builder.maybeSingle = vi
    .fn()
    .mockResolvedValue({ data: defaultData, error: null });
  builder.csv = vi.fn().mockResolvedValue({ data: "", error: null });
  builder.returns = vi.fn(chain);
  builder.throwOnError = vi.fn(chain);

  // make the builder itself awaitable
  builder.then = vi.fn((resolve: (val: unknown) => void) =>
    resolve({ data: defaultData, error: null })
  );

  return builder;
}

function createStorageBucketMock() {
  return {
    upload: vi
      .fn()
      .mockResolvedValue({ data: { path: "test/file.png" }, error: null }),
    uploadToSignedUrl: vi
      .fn()
      .mockResolvedValue({ data: { path: "test/file.png" }, error: null }),
    download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
    getPublicUrl: vi.fn().mockReturnValue({
      data: {
        publicUrl:
          "https://test.supabase.co/storage/v1/object/public/test/file.png",
      },
    }),
    createSignedUrl: vi.fn().mockResolvedValue({
      data: { signedUrl: "https://signed-url.test" },
      error: null,
    }),
    createSignedUrls: vi.fn().mockResolvedValue({
      data: [{ signedUrl: "https://signed-url.test" }],
      error: null,
    }),
    createSignedUploadUrl: vi.fn().mockResolvedValue({
      data: {
        token: "test-token",
        path: "test/file.png",
        signedUrl: "https://signed-url.test",
      },
      error: null,
    }),
    list: vi.fn().mockResolvedValue({ data: [], error: null }),
    move: vi.fn().mockResolvedValue({
      data: { message: "Successfully moved" },
      error: null,
    }),
    copy: vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null }),
    remove: vi.fn().mockResolvedValue({ data: [], error: null }),
    info: vi.fn().mockResolvedValue({ data: { name: "test" }, error: null }),
    exists: vi.fn().mockResolvedValue({ data: true, error: null }),
  };
}

function createChannelMock() {
  const channel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn().mockResolvedValue("ok"),
    send: vi.fn().mockResolvedValue("ok"),
    track: vi.fn().mockResolvedValue("ok"),
    untrack: vi.fn().mockResolvedValue("ok"),
    presence: {
      state: vi.fn().mockReturnValue({}),
    },
  };
  return channel;
}

export function createMockSupabaseClient(): SupabaseClient {
  return {
    from: vi.fn(() => createQueryBuilder()),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),

    // Auth
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signInWithOAuth: vi.fn().mockResolvedValue({
        data: { url: "https://oauth.test" },
        error: null,
      }),
      signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithSSO: vi
        .fn()
        .mockResolvedValue({ data: { url: "https://sso.test" }, error: null }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi
        .fn()
        .mockResolvedValue({ data: {}, error: null }),
      updateUser: vi
        .fn()
        .mockResolvedValue({ data: { user: null }, error: null }),
      refreshSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      setSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      exchangeCodeForSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      verifyOtp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      resend: vi.fn().mockResolvedValue({ data: {}, error: null }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      admin: {
        createUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
        deleteUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getUserById: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
        listUsers: vi
          .fn()
          .mockResolvedValue({ data: { users: [] }, error: null }),
        updateUserById: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
        inviteUserByEmail: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
      },
      mfa: {
        enroll: vi.fn().mockResolvedValue({ data: null, error: null }),
        challenge: vi.fn().mockResolvedValue({ data: null, error: null }),
        verify: vi.fn().mockResolvedValue({ data: null, error: null }),
        unenroll: vi.fn().mockResolvedValue({ data: null, error: null }),
        challengeAndVerify: vi
          .fn()
          .mockResolvedValue({ data: null, error: null }),
        getAuthenticatorAssuranceLevel: vi
          .fn()
          .mockResolvedValue({ data: null, error: null }),
        listFactors: vi
          .fn()
          .mockResolvedValue({ data: { totp: [], phone: [] }, error: null }),
      },
    },

    // Storage
    storage: {
      from: vi.fn(() => createStorageBucketMock()),
      createBucket: vi
        .fn()
        .mockResolvedValue({ data: { name: "test" }, error: null }),
      getBucket: vi
        .fn()
        .mockResolvedValue({ data: { name: "test" }, error: null }),
      listBuckets: vi.fn().mockResolvedValue({ data: [], error: null }),
      updateBucket: vi.fn().mockResolvedValue({
        data: { message: "Successfully updated" },
        error: null,
      }),
      deleteBucket: vi.fn().mockResolvedValue({
        data: { message: "Successfully deleted" },
        error: null,
      }),
      emptyBucket: vi.fn().mockResolvedValue({
        data: { message: "Successfully emptied" },
        error: null,
      }),
    },

    // Realtime
    channel: vi.fn(() => createChannelMock()),
    getChannels: vi.fn().mockReturnValue([]),
    removeChannel: vi.fn().mockResolvedValue("ok"),
    removeAllChannels: vi.fn().mockResolvedValue([]),

    // Edge functions
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
      setAuth: vi.fn(),
    },
  } as unknown as SupabaseClient;
}
