# Graph Report - dtr-dream-to-real (2026-09-18)

## Corpus Check

- 725 files · ~181,414 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 4091 nodes · 8989 edges · 225 communities (173 shown, 41 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 63 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `663e0425`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- email.table.ts
- eslint-config/package.json
- web/package.json
- api/orpc/[[...rest]]/route.ts
- cn
- FileUpload.tsx
- mail/package.json
- Qstash.service.ts
- field.tsx
- date-filter.tsx
- emailThread.table.ts
- di-container.ts
- UpdateNotificationForm.tsx
- BaseServer.ts
- dependencies
- tags/index.tsx
- orpc.client.ts
- User.controller.ts
- userTableColumn.tsx
- user.seed.ts
- Mail.service.tsx
- NotificationManagement.tsx
- backend/package.json
- drawer.tsx
- dashboard/profile/page.tsx
- devDependencies
- zod-db-enums.ts
- ui/package.json
- ClassConstructor
- DashboardShellHeader.tsx
- useAuthStore
- faceted-filter.tsx
- db_created_at
- upload.procedure.ts
- TaskKanbanBoard.tsx
- badge.tsx
- zod
- api/user.contract.ts
- RouteHandlerFactory.service.ts
- DevPanelContext.tsx
- sidebar.tsx
- Parameter.decorators.ts
- task.procedure.ts
- QstashError
- NotificationProvider.tsx
- package.json
- QstashService
- QstashMailResult
- storybook/package.json
- drizzle/package.json
- Storage.service.ts
- constants/index.ts
- date-time-picker.tsx
- auth.ts
- role.procedure.ts
- dependencies
- upload.contract.ts
- server/types.ts
- QstashMailService
- tasks
- mail/src/types/index.ts
- exports
- lib/package.json
- ui/components.json
- auth.middleware.ts
- buildPaginateOptions.ts
- lib/utils.ts
- vitest-config/package.json
- compilerOptions
- web/components.json
- mail.ts
- task.contract.ts
- devDependencies
- devDependencies
- upstashRateLimit.service.ts
- apiClient.ts
- contract/package.json
- data-table-slider-filter.tsx
- devDependencies
- button.tsx
- AppBreadcrumb.tsx
- notification.contract.ts
- slider.stories.tsx
- ServiceError
- compilerOptions
- compilerOptions
- NestedMenuItem.tsx
- QstashMessageLogRepository
- tasks
- lib/env.ts
- slider-filter.tsx
- app/layout.tsx
- rules
- scripts
- Method.decorators.ts
- devDependencies
- UserStats.tsx
- ParameterType
- sheet.tsx
- compilerOptions
- scripts
- devDependencies
- EmailService
- compilerOptions
- exports
- zod/index.ts
- ContactManagementTable.tsx
- button.stories.tsx
- orpc.types.ts
- web/tests/setup.ts
- user.table.ts
- compilerOptions
- devDependencies
- NotificationPermissionProvider.tsx
- getAuthUserWithRolesAndPermissionsCache
- Graphify Skill
- express.d.ts
- scripts
- LinkButton.tsx
- dependencies
- web/tsconfig.json
- typescript-config/package.json
- parameter.utils.ts
- web/types/index.ts
- exports
- scripts
- Site Logo SVG (Isometric DTR 3D Text)
- dependencies
- devDependencies
- lib/tsconfig.lint.json
- mail/tsconfig.lint.json
- IQstashMailService
- ui/tsconfig.json
- vitest-config/tsconfig.json
- vitest-config/tsconfig.lint.json
- scripts
- ExtendedRedis
- pnpm Workspace Config
- drizzle/tsconfig.lint.json
- dependencies
- scripts
- lib/tsconfig.json
- mail/tsconfig.json
- react-library.json
- formatDateWithTimezone
- ui/tsconfig.lint.json
- compilerOptions
- compilerOptions
- setup.sh
- .oxlintrc.json
- ProcedureApiUtils
- switch.stories.tsx
- drizzle-zod
- exports
- SearchableSelector.tsx
- lib/src/types/index.ts
- base-config.ts
- Graphify Pipeline
- main.ts
- next.config.ts
- overrides
- sql-generator.ts
- drizzle/tsconfig.json
- storage.seed.ts
- dependencies
- ui/postcss.config.mjs
- user.procedure.ts
- scripts
- formatOrpcError
- ./ui
- App.tsx
- next-image.tsx
- preview.tsx
- storybook/tsconfig.json
- opencode.json
- graphify.js
- config
- dbml-generator.ts
- tunnel-rat.d.ts
- collect-coverage.ts
- tsconfig.json
- Turbo Setup Action
- BFS Traversal
- publishConfig
- useLocalStorage
- post-commit
- dependencies
- engines
- publishConfig
- contract/tsconfig.lint.json
- publishConfig
- docker-compose-wrapper.sh
- Storybook Entry
- PWA Icon 128x128 (DTR Logo)
- PWA Icon 144x144 (DTR Logo)
- PWA Icon 152x152 (DTR Logo)
- PWA Icon 256x256 (DTR Logo)
- PWA Icon 384x384 (DTR Logo)
- PWA Icon 48x48 (DTR Logo)
- PWA Icon 72x72 (DTR Logo)
- PWA Icon 96x96 (DTR Logo)
- User Placeholder Avatar (Gray Silhouette)
- Code of Conduct
- Docker Compose Dev
- DTR - Dream To Real README
- src/types.ts
- ./enum-values
- devDependencies
- contract/tsconfig.json
- dependencies.ts
- post-checkout
- tsup-config/package.json
- auth.schema.ts
- README.md

## God Nodes (most connected - your core abstractions)

1. `cn()` - 305 edges
2. `Button()` - 64 edges
3. `apiResponse()` - 35 edges
4. `ClassConstructor` - 33 edges
5. `db_id` - 33 edges
6. `drizzle-zod` - 32 edges
7. `useAuthStore()` - 31 edges
8. `QstashService` - 30 edges
9. `db_created_at` - 29 edges
10. `QstashMailResult` - 28 edges

## Surprising Connections (you probably didn't know these)

- `RootLayout()` --calls--> `cn()` [EXTRACTED]
  apps/web/app/layout.tsx → packages/ui/src/lib/utils.ts
- `TaskKanbanCardSkeleton()` --calls--> `cn()` [EXTRACTED]
  apps/web/features/task/components/TaskKanbanSkeleton.tsx → packages/ui/src/lib/utils.ts
- `SendNotificationProps` --references--> `DatabaseType` [EXTRACTED]
  apps/web/features/notification/data/sendNotification.ts → packages/drizzle/src/drizzle-client.ts
- `ORPCContext` --references--> `DatabaseType` [EXTRACTED]
  apps/web/types/orpc.types.ts → packages/drizzle/src/drizzle-client.ts
- `ORPCContext` --references--> `ExtendedRedis` [EXTRACTED]
  apps/web/types/orpc.types.ts → packages/lib/src/services/redis/types.ts

## Import Cycles

- 3-file cycle: `packages/drizzle/src/schemas/table/address.table.ts -> packages/drizzle/src/schemas/table/employee/index.ts -> packages/drizzle/src/schemas/table/employee/employeeAddress.table.ts -> packages/drizzle/src/schemas/table/address.table.ts`
- 3-file cycle: `packages/drizzle/src/schemas/table/address.table.ts -> packages/drizzle/src/schemas/table/employee/index.ts -> packages/drizzle/src/schemas/table/employee/companyAddress.table.ts -> packages/drizzle/src/schemas/table/address.table.ts`
- 3-file cycle: `packages/drizzle/src/schemas/table/employee/companySocial.table.ts -> packages/drizzle/src/schemas/table/socialMedia.table.ts -> packages/drizzle/src/schemas/table/employee/index.ts -> packages/drizzle/src/schemas/table/employee/companySocial.table.ts`
- 3-file cycle: `packages/drizzle/src/schemas/table/employee/employeeSocial.table.ts -> packages/drizzle/src/schemas/table/socialMedia.table.ts -> packages/drizzle/src/schemas/table/employee/index.ts -> packages/drizzle/src/schemas/table/employee/employeeSocial.table.ts`
- 3-file cycle: `packages/drizzle/src/schemas/table/account.table.ts -> packages/drizzle/src/schemas/table/user/index.ts -> packages/drizzle/src/schemas/table/user/user.table.ts -> packages/drizzle/src/schemas/table/account.table.ts`
- 3-file cycle: `packages/drizzle/src/schemas/table/file.table.ts -> packages/drizzle/src/schemas/table/user/index.ts -> packages/drizzle/src/schemas/table/user/user.table.ts -> packages/drizzle/src/schemas/table/file.table.ts`
- 3-file cycle: `packages/drizzle/src/schemas/table/session.table.ts -> packages/drizzle/src/schemas/table/user/index.ts -> packages/drizzle/src/schemas/table/user/userActivity.table.ts -> packages/drizzle/src/schemas/table/session.table.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/address.table.ts -> packages/drizzle/src/schemas/table/employee/index.ts -> packages/drizzle/src/schemas/table/employee/company.table.ts -> packages/drizzle/src/schemas/table/employee/companyAddress.table.ts -> packages/drizzle/src/schemas/table/address.table.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/employee/company.table.ts -> packages/drizzle/src/schemas/table/employee/companySocial.table.ts -> packages/drizzle/src/schemas/table/socialMedia.table.ts -> packages/drizzle/src/schemas/table/employee/index.ts -> packages/drizzle/src/schemas/table/employee/company.table.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/address.table.ts -> packages/drizzle/src/schemas/table/employee/index.ts -> packages/drizzle/src/schemas/table/employee/employee.table.ts -> packages/drizzle/src/schemas/table/employee/employeeAddress.table.ts -> packages/drizzle/src/schemas/table/address.table.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/employee/employee.table.ts -> packages/drizzle/src/schemas/table/employee/employeeSocial.table.ts -> packages/drizzle/src/schemas/table/socialMedia.table.ts -> packages/drizzle/src/schemas/table/employee/index.ts -> packages/drizzle/src/schemas/table/employee/employee.table.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/notification/index.ts -> packages/drizzle/src/schemas/table/notification/notification.table.ts -> packages/drizzle/src/schemas/table/user/index.ts -> packages/drizzle/src/schemas/table/user/user.table.ts -> packages/drizzle/src/schemas/table/notification/index.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/task/index.ts -> packages/drizzle/src/schemas/table/task/task.table.ts -> packages/drizzle/src/schemas/table/user/index.ts -> packages/drizzle/src/schemas/table/user/user.table.ts -> packages/drizzle/src/schemas/table/task/index.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/contact/contactSubmission.table.ts -> packages/drizzle/src/schemas/table/email/index.ts -> packages/drizzle/src/schemas/table/email/email.table.ts -> packages/drizzle/src/schemas/table/contact/index.ts -> packages/drizzle/src/schemas/table/contact/contactSubmission.table.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/contact/contactSubmission.table.ts -> packages/drizzle/src/schemas/table/email/index.ts -> packages/drizzle/src/schemas/table/email/emailThread.table.ts -> packages/drizzle/src/schemas/table/contact/index.ts -> packages/drizzle/src/schemas/table/contact/contactSubmission.table.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/contact/contactSubmissionReply.table.ts -> packages/drizzle/src/schemas/table/email/index.ts -> packages/drizzle/src/schemas/table/email/email.table.ts -> packages/drizzle/src/schemas/table/contact/index.ts -> packages/drizzle/src/schemas/table/contact/contactSubmissionReply.table.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/contact/contactSubmissionReply.table.ts -> packages/drizzle/src/schemas/table/email/index.ts -> packages/drizzle/src/schemas/table/email/emailThread.table.ts -> packages/drizzle/src/schemas/table/contact/index.ts -> packages/drizzle/src/schemas/table/contact/contactSubmissionReply.table.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/contact/contactSubmissionReply.table.ts -> packages/drizzle/src/schemas/table/user/index.ts -> packages/drizzle/src/schemas/table/user/user.table.ts -> packages/drizzle/src/schemas/table/contact/index.ts -> packages/drizzle/src/schemas/table/contact/contactSubmissionReply.table.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/account.table.ts -> packages/drizzle/src/schemas/table/user/index.ts -> packages/drizzle/src/schemas/table/user/notificationSetting.table.ts -> packages/drizzle/src/schemas/table/user/user.table.ts -> packages/drizzle/src/schemas/table/account.table.ts`
- 4-file cycle: `packages/drizzle/src/schemas/table/file.table.ts -> packages/drizzle/src/schemas/table/user/index.ts -> packages/drizzle/src/schemas/table/user/notificationSetting.table.ts -> packages/drizzle/src/schemas/table/user/user.table.ts -> packages/drizzle/src/schemas/table/file.table.ts`

## Hyperedges (group relationships)

- **DTR Workspace Packages** — packages_drizzle_readmemd, packages_eslint_config_readmemd, packages_lib_readmemd, packages_mail_readmemd, packages_typescript_config_readmemd, packages_vitest_config_readmemd [EXTRACTED 1.00]
- **Graphify Extraction Concepts** — \_opencode_skills_graphify_skillmd_ast_extraction, \_opencode_skills_graphify_skillmd_semantic_extraction, \_opencode_skills_graphify_skillmd_community_detection [EXTRACTED 1.00]
- **Graphify Reference Documents** — \_opencode_skills_graphify_references_extraction_specmd, \_opencode_skills_graphify_references_querymd, \_opencode_skills_graphify_references_updatemd, \_opencode_skills_graphify_references_exportsmd, \_opencode_skills_graphify_references_hooksmd, \_opencode_skills_graphify_references_transcribemd, \_opencode_skills_graphify_references_github_and_mergemd, \_opencode_skills_graphify_references_add_watchmd [EXTRACTED 1.00]
- **DTR Brand Visual Identity Assets** — apps_web_public_sitelogo_svg, apps_web_app_opengraph_image_jpeg, apps_web_app_apple_icon_png, apps_web_app_icon0_svg, apps_web_app_icon1_png, apps_web_public_icons_icon_192x192_png [INFERRED 0.85]
- **DTR Favicon Generation Pipeline** — apps_web_public_sitelogo_svg, apps_web_app_icon0_svg, apps_web_app_icon1_png, apps_web_app_apple_icon_png [INFERRED 0.85]
- **DTR Logo PWA Icon Set** — apps_web_public_icons_icon_48x48_png, apps_web_public_icons_icon_72x72_png, apps_web_public_icons_icon_96x96_png, apps_web_public_icons_icon_128x128_png, apps_web_public_icons_icon_144x144_png, apps_web_public_icons_icon_152x152_png, apps_web_public_icons_icon_192x192_png, apps_web_public_icons_icon_256x256_png, apps_web_public_icons_icon_384x384_png, apps_web_public_icons_icon_512x512_png [INFERRED 0.95]

## Communities (225 total, 41 thin omitted)

### Community 0 - "email.table.ts"

Cohesion: 0.06
Nodes (38): EmailDirectionEnum, EmailRecipientTypeEnum, EmailStatusEnum, ContactSubmissionReplyDataModel, ContactSubmissionReplyRelations, ContactSubmissionReplyTable, InsertContactSubmissionReply, insertContactSubmissionReplySchema (+30 more)

### Community 1 - "eslint-config/package.json"

Cohesion: 0.05
Nodes (43): config, expressEslintConfig, nextJsConfig, author, contributors, devDependencies, eslint, eslint-config-prettier (+35 more)

### Community 2 - "web/package.json"

Cohesion: 0.05
Nodes (40): author, contributors, eslint, @supabase/supabase-js, typescript, @workspace/eslint-config, @workspace/typescript-config, @workspace/vitest-config (+32 more)

### Community 3 - "api/orpc/[[...rest]]/route.ts"

Cohesion: 0.08
Nodes (23): DELETE, GET, HEAD, PATCH, POST, PUT, runtime, DELETE (+15 more)

### Community 4 - "cn"

Cohesion: 0.07
Nodes (47): DataTableActionBar(), DataTableActionBarAction(), DataTableActionBarActionProps, DataTableActionBarProps, DataTableActionBarSelectionProps, DataTableProps, DataTablePagination(), DataTablePaginationProps (+39 more)

### Community 5 - "FileUpload.tsx"

Cohesion: 0.07
Nodes (38): PerfEntry, PerformancePanel(), DefaultFilePreview(), DefaultPlaceholder(), FileUpload, FileUploadProps, FileUploadRef, FileUploadValidation (+30 more)

### Community 6 - "mail/package.json"

Cohesion: 0.04
Nodes (48): author, contributors, dependencies, drizzle-orm, react, react-dom, react-email, resend (+40 more)

### Community 7 - "Qstash.service.ts"

Cohesion: 0.11
Nodes (15): DEFAULTS, HandlerRegistry, IQstashService, QstashCallbackHandler, QstashDeadLetter, QstashMessage, QstashPublishOptions, QstashPublishResult (+7 more)

### Community 8 - "field.tsx"

Cohesion: 0.07
Nodes (33): FileUploadField(), UserBannedType, RememberMe(), RememberMeProps, UserBannedFormProps, Checkbox(), Checked, Disabled (+25 more)

### Community 9 - "date-filter.tsx"

Cohesion: 0.10
Nodes (25): buttonVariants, Calendar(), CalendarDayButton(), CalendarProps, meta, MultipleMonths, Single, Story (+17 more)

### Community 10 - "emailThread.table.ts"

Cohesion: 0.08
Nodes (28): ContactStatusEnum, ContactSubmissionDataModel, ContactSubmissionRelations, ContactSubmissionTable, InsertContactSubmission, insertContactSubmissionSchema, SelectContactSubmission, selectContactSubmissionSchema (+20 more)

### Community 11 - "di-container.ts"

Cohesion: 0.23
Nodes (8): CONTAINER_TYPES, container, env, main(), UserCronService, Server, CronJobClass, express

### Community 12 - "UpdateNotificationForm.tsx"

Cohesion: 0.08
Nodes (35): metadata, metadata, metadata, metadata, metadata, metadata, metadata, authErrors (+27 more)

### Community 13 - "BaseServer.ts"

Cohesion: 0.08
Nodes (12): LoggerConfig, LoggerType, BaseServer, BaseServerConfig, IBaseServer, createCsrf(), CsrfConfig, cookieParserMiddleware() (+4 more)

### Community 14 - "dependencies"

Cohesion: 0.05
Nodes (43): dependencies, axios, better-auth, @better-auth/drizzle-adapter, date-fns, drizzle-orm, @hookform/resolvers, @hugeicons/core-free-icons (+35 more)

### Community 15 - "tags/index.tsx"

Cohesion: 0.06
Nodes (49): Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator() (+41 more)

### Community 16 - "orpc.client.ts"

Cohesion: 0.16
Nodes (25): ContactDetailsPage(), metadata, ContactPage(), metadata, NotificationPage(), metadata, RolesPage(), metadata (+17 more)

### Community 17 - "User.controller.ts"

Cohesion: 0.12
Nodes (14): IUserController, UserController, TestServer, Controller, Get, inject, createMockRedisClient(), store (+6 more)

### Community 18 - "userTableColumn.tsx"

Cohesion: 0.09
Nodes (33): ListContactContractType, ContactTable(), ContactTableProps, contactTableColumn, ContactTableRowDataType, ListRoleContractType, PermissionsCell(), RoleTable() (+25 more)

### Community 19 - "user.seed.ts"

Cohesion: 0.06
Nodes (58): statement, systemAc, SystemAction, SystemPermissionStatement, SystemResource, systemRoles, generatePermissionsSql(), generateRolePermissionSql() (+50 more)

### Community 20 - "Mail.service.tsx"

Cohesion: 0.10
Nodes (42): AccountLockedMail(), AccountLockedMailProps, EmailVerificationMail(), EmailVerificationMailProps, NewDeviceLoginMail(), NewDeviceLoginMailProps, PasswordChangedMail(), PasswordChangedMailProps (+34 more)

### Community 21 - "NotificationManagement.tsx"

Cohesion: 0.14
Nodes (22): useNotificationMarkAsRead(), ListNotificationContractType, CATEGORY_CONFIG, LEVEL_CONFIG, NotificationItem(), NotificationItemProps, timeAgo(), NotificationManagement() (+14 more)

### Community 22 - "backend/package.json"

Cohesion: 0.09
Nodes (21): author, contributors, files, license, name, private, publishConfig, access (+13 more)

### Community 23 - "drawer.tsx"

Cohesion: 0.16
Nodes (16): Drawer(), DrawerClose(), DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter(), DrawerHeader() (+8 more)

### Community 24 - "dashboard/profile/page.tsx"

Cohesion: 0.09
Nodes (35): metadata, ProfilePage(), metadata, UserDetailsPage(), TabNavigation(), TabNavigationContent(), TabNavigationList(), TabNavigationProps (+27 more)

### Community 25 - "devDependencies"

Cohesion: 0.11
Nodes (18): devDependencies, cross-env, dotenv, eslint, reflect-metadata, source-map-support, supertest, tsup (+10 more)

### Community 26 - "zod-db-enums.ts"

Cohesion: 0.08
Nodes (38): PushPayload, serwist, WorkerGlobalScope, EmailEventTypeEnum, ACTION_TYPE, ADDRESS_TYPE, CONTACT_STATUS, EMAIL_DIRECTION (+30 more)

### Community 27 - "ui/package.json"

Cohesion: 0.05
Nodes (36): author, contributors, date-fns, eslint, react, react-dom, @storybook/react-vite, @types/node (+28 more)

### Community 28 - "ClassConstructor"

Cohesion: 0.13
Nodes (18): ControllerInfos, IControllerLoaderConfiguration, RouteInfos, MetadataExtractorService, MiddlewareResolverService, RouteHandlerFactoryService, RouterFactoryService, ClassConstructor (+10 more)

### Community 29 - "DashboardShellHeader.tsx"

Cohesion: 0.11
Nodes (11): DashboardShellHeader(), DashboardShellDescriptionSkeleton(), DashboardShellTitleSkeleton(), DashboardShellSkeleton(), DashboardShellSkeletonProps, DataTableSkeleton(), Spinner(), Default (+3 more)

### Community 30 - "useAuthStore"

Cohesion: 0.09
Nodes (26): TopbarUser(), TimeRangeFilter(), MonthRange, MonthRangeSelect(), MonthRangeSelectProps, RangeGrid(), RangeGridItem, RangeGridProps (+18 more)

### Community 31 - "faceted-filter.tsx"

Cohesion: 0.13
Nodes (18): SearchableSelector(), ButtonProps, FacetedFilter(), FacetedFilterContent(), FacetedFilterContentProps, FacetedFilterProps, FacetedFilterTrigger(), FacetedFilterTriggerProps (+10 more)

### Community 32 - "db_created_at"

Cohesion: 0.03
Nodes (89): db_created_at, AddressTypeEnum, SocialMediaPlatfromTypeEnum, SocialMediaTypeEnum, SocialMediaPlatfromTypeEnumSchema, AddressDataModel, AddressRelations, AddressTable (+81 more)

### Community 33 - "upload.procedure.ts"

Cohesion: 0.25
Nodes (11): DEFAULT_FILE_CACHE_TIMEOUT, assignFileEntityProcedure, confirmUploadProcedure, deleteUploadProcedure, getSignedDownloadUrlProcedure, getSignedUploadUrlProcedure, uploadImpl, resolveFileUrl() (+3 more)

### Community 34 - "TaskKanbanBoard.tsx"

Cohesion: 0.06
Nodes (36): useUpdateStatusTask(), ListTaskContractType, TaskItem, TaskKanbanBoard(), TaskKanbanCard(), TaskKanbanCardSkeleton(), TaskKanbanSkeleton(), createRangeFilterClient() (+28 more)

### Community 35 - "badge.tsx"

Cohesion: 0.15
Nodes (14): TaskPriorityBadge(), UserBannedProps, TaskPriorityEnumType, Badge(), badgeVariants, meta, Primary, Story (+6 more)

### Community 36 - "zod"

Cohesion: 0.17
Nodes (10): apiClient, instance, contracts, ContractsType, listUserContract, userContract, UserContractType, createContract() (+2 more)

### Community 37 - "api/user.contract.ts"

Cohesion: 0.09
Nodes (21): listUserContract, listUserForSearchContract, ListUserForSearchContractType, profileUpdateContract, ProfileUpdateContractType, tags, userBaseContract, userContract (+13 more)

### Community 38 - "RouteHandlerFactory.service.ts"

Cohesion: 0.17
Nodes (9): ApiErrorFilter, ApiResponse, notFoundHandler(), ExceptionHandlerService, GuardExecutorService, IExceptionFilter, IGuard, IRequestExecutionContext (+1 more)

### Community 39 - "DevPanelContext.tsx"

Cohesion: 0.14
Nodes (22): AuthPanel(), ConsoleDevPanel(), filters, FilterType, LOG_BADGE_STYLES, orig, DevPanelBody(), DevPanelContext (+14 more)

### Community 40 - "sidebar.tsx"

Cohesion: 0.10
Nodes (35): AppSidebar(), AppSidebarProps, SettingsSidebar(), SidebarFooterMenu(), SidebarLogo(), footerMenuLinks, settingsMenuLinks, sidebarMenuLinks (+27 more)

### Community 41 - "Parameter.decorators.ts"

Cohesion: 0.13
Nodes (15): REFLECT_KEYS, ICronJobClassOptions, ICronJobConfigs, Body(), createParameterDecorator(), Header(), Headers(), Ip() (+7 more)

### Community 42 - "task.procedure.ts"

Cohesion: 0.13
Nodes (24): listNotificationProcedure, markAsReadProcedure, notificationImpl, settingsDetailsProcedure, subscribePushNotificationProcedure, unsubscribePushNotificationProcedure, updateSettingsProcedure, sendNotification() (+16 more)

### Community 43 - "QstashError"

Cohesion: 0.22
Nodes (15): POST(), POST(), POST(), POST(), POST(), mail, getQstashPayload(), verifyQstashSignature() (+7 more)

### Community 44 - "NotificationProvider.tsx"

Cohesion: 0.17
Nodes (15): NotificationProvider(), chimeSound(), getAudioContext(), NOTIFICATION_EVENT, notificationChannel(), getVisibilityChangeEvent(), getVisibilityProps(), isVisibilityAPISupported() (+7 more)

### Community 45 - "package.json"

Cohesion: 0.08
Nodes (25): author, contributors, eslint, @supabase/supabase-js, typescript, @workspace/eslint-config, @workspace/typescript-config, @workspace/vitest-config (+17 more)

### Community 46 - "QstashService"

Cohesion: 0.11
Nodes (4): errorMessage(), QstashService, requireLog(), toMessageView()

### Community 47 - "QstashMailResult"

Cohesion: 0.17
Nodes (3): IMailService, MailService, QstashMailResult

### Community 48 - "storybook/package.json"

Cohesion: 0.07
Nodes (26): author, contributors, react, react-dom, @storybook/addon-vitest, @storybook/react-vite, @types/node, @types/react (+18 more)

### Community 49 - "drizzle/package.json"

Cohesion: 0.07
Nodes (25): author, contributors, better-auth, dotenv, drizzle-orm, eslint, @faker-js/faker, tsx (+17 more)

### Community 50 - "Storage.service.ts"

Cohesion: 0.13
Nodes (10): getStorageInstance(), BaseStorageService, createStorage(), IStorageService, StorageService, FileInfoType, SignedDownloadUrl, SignedUploadUrl (+2 more)

### Community 51 - "constants/index.ts"

Cohesion: 0.09
Nodes (23): manifest(), metadata, GoogleIcon(), AUTH_ROUTES, BACKGROUND_COLOR, breadcrumbRoutes, DEFAULT_AUTH_PATH, PUBLIC_ROUTES (+15 more)

### Community 52 - "date-time-picker.tsx"

Cohesion: 0.11
Nodes (14): CalendarCompProps, DateTimeDayButton(), DateTimePicker(), DateTimePickerContent(), DateTimePickerContentProps, DateTimePickerProps, DateTimePickerTriggerProps, MONTH_NAMES (+6 more)

### Community 53 - "auth.ts"

Cohesion: 0.11
Nodes (25): { GET, POST }, getAuthUser(), getAuthUserCache, getAuthUserWithRolesAndPermissions(), getUserRolesAndPermission(), getUserRolesAndPermissionCache, createUserActivity(), auth (+17 more)

### Community 54 - "role.procedure.ts"

Cohesion: 0.17
Nodes (14): authRouter, contactRouter, notificationRouter, listRoleProcedure, roleImpl, roleRouter, uploadRouter, userRouter (+6 more)

### Community 55 - "dependencies"

Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, @dnd-kit/core, @dnd-kit/sortable (+18 more)

### Community 56 - "upload.contract.ts"

Cohesion: 0.05
Nodes (42): API_MESSAGES, authContract, authMetadataContract, AuthMetadataContractType, requestResetPasswordContract, RequestResetPasswordContractType, tags, userBanContract (+34 more)

### Community 57 - "server/types.ts"

Cohesion: 0.20
Nodes (9): API_MESSAGE, ICsrfTokenError, CorsConfig, errorMiddleware(), getServerError(), LoggerMiddlewareConfig, INextFunction, IRequest (+1 more)

### Community 59 - "tasks"

Cohesion: 0.08
Nodes (25): dependsOn, inputs, outputs, cache, persistent, dependsOn, globalEnv, dependsOn (+17 more)

### Community 60 - "mail/src/types/index.ts"

Cohesion: 0.20
Nodes (12): createMail(), MailConfig, ResendMailTransport, IMailTransport, InboundEmailAttachment, InboundEmailPayload, InboundEmailResult, MailCallbackPayload (+4 more)

### Community 61 - "exports"

Cohesion: 0.11
Nodes (19): import, import, types, types, exports, ./client, ./client/mock, ./paginate-query (+11 more)

### Community 62 - "lib/package.json"

Cohesion: 0.05
Nodes (37): author, contributors, date-fns, eslint, @supabase/supabase-js, @types/node, typescript, vitest (+29 more)

### Community 63 - "ui/components.json"

Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 64 - "auth.middleware.ts"

Cohesion: 0.13
Nodes (26): authImpl, authMetadataProcedure, requestResetPasswordProcedure, userBanProcedure, contactImpl, createReplyContactProcedure, detailsContactProcedure, listContactProcedure (+18 more)

### Community 65 - "buildPaginateOptions.ts"

Cohesion: 0.11
Nodes (28): MetaPagination(), MetaPaginationProps, buildFilterWhere(), buildOrderBy(), buildPaginateOptions(), buildSearchWhere(), buildWhere(), DateRangeFilter (+20 more)

### Community 66 - "lib/utils.ts"

Cohesion: 0.06
Nodes (36): DataTableFilterItemProps, DataTableFilterItems(), DataTableGlobalSearchProps, TextareaFieldProps, TextareaFieldRenderProps, InputGroup(), InputGroupAddon(), inputGroupAddonVariants (+28 more)

### Community 67 - "vitest-config/package.json"

Cohesion: 0.10
Nodes (20): author, contributors, eslint, tsx, @types/node, typescript, @vitejs/plugin-react, vitest (+12 more)

### Community 68 - "compilerOptions"

Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 69 - "web/components.json"

Cohesion: 0.10
Nodes (19): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+11 more)

### Community 70 - "mail.ts"

Cohesion: 0.18
Nodes (11): redisSecondaryStorage, globalForMail, globalForQstash, qstashClient, protectedRateLimit, publicRateLimit, qstashHourlyRateLimit, qstashMinRateLimit (+3 more)

### Community 71 - "task.contract.ts"

Cohesion: 0.11
Nodes (19): listTasksContract, tags, taskBaseContract, taskContract, taskCreateContract, TaskCreateContractType, taskDeleteContract, TaskDeleteContractType (+11 more)

### Community 72 - "devDependencies"

Cohesion: 0.10
Nodes (21): devDependencies, babel-plugin-react-compiler, esbuild, eslint, @faker-js/faker, @next/env, serwist, @serwist/turbopack (+13 more)

### Community 73 - "devDependencies"

Cohesion: 0.10
Nodes (20): devDependencies, commitizen, @commitlint/cli, @commitlint/config-conventional, cz-conventional-changelog, dotenv, eslint, husky (+12 more)

### Community 74 - "upstashRateLimit.service.ts"

Cohesion: 0.19
Nodes (11): createRatelimit(), RatelimitFactoryConfig, Duration, GetRemainingResponse, IRatelimit, RatelimitAlgorithm, RatelimitResponse, WindowUnit (+3 more)

### Community 75 - "apiClient.ts"

Cohesion: 0.15
Nodes (15): ApiClient, CallApiOptions, createApiClient(), createApiClientInternal(), CreateApiClientOptions, InfiniteKeyOptions, InfiniteOptionsIn, MutationOptionsIn (+7 more)

### Community 77 - "contract/package.json"

Cohesion: 0.09
Nodes (22): author, contributors, dependencies, axios, @tanstack/react-query, @workspace/drizzle, @workspace/lib, zod (+14 more)

### Community 78 - "data-table-slider-filter.tsx"

Cohesion: 0.16
Nodes (10): DataTableSliderFilter(), DataTableSliderFilterProps, RangeValue, SliderMeta, SliderUtils, SliderFilter(), Default, LargeRange (+2 more)

### Community 79 - "devDependencies"

Cohesion: 0.11
Nodes (18): devDependencies, @chromatic-com/storybook, eslint-plugin-storybook, oxlint, playwright, storybook, @storybook/addon-a11y, @storybook/addon-docs (+10 more)

### Community 80 - "button.tsx"

Cohesion: 0.06
Nodes (57): metadata, ExportDataProps, PRESET_KEYS, presetRanges, TimeRangeFilterProps, TimeRangeState, createReplySchema, CreateReplyType (+49 more)

### Community 81 - "AppBreadcrumb.tsx"

Cohesion: 0.17
Nodes (17): AppBreadcrumb(), findBreadcrumbs(), findRoute(), Topbar(), ThemeChanger(), NotificationPanel(), Breadcrumb(), BreadcrumbEllipsis() (+9 more)

### Community 82 - "notification.contract.ts"

Cohesion: 0.12
Nodes (16): listNotificationContract, markAsReadContract, MarkAsReadContractType, notificationContract, settingsDetailsContract, SettingsDetailsContractType, subscribePushNotificationContract, SubscribePushNotificationContractType (+8 more)

### Community 83 - "slider.stories.tsx"

Cohesion: 0.33
Nodes (5): Slider(), meta, Range, SingleValue, Story

### Community 84 - "ServiceError"

Cohesion: 0.25
Nodes (3): MailError, MailErrorCode, ServiceError

### Community 85 - "compilerOptions"

Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib, module (+9 more)

### Community 86 - "compilerOptions"

Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 87 - "NestedMenuItem.tsx"

Cohesion: 0.21
Nodes (11): NestedMenuItem(), Collapsible(), CollapsibleContent(), CollapsibleTrigger(), Default, meta, OpenByDefault, Story (+3 more)

### Community 88 - "QstashMessageLogRepository"

Cohesion: 0.14
Nodes (7): QstashMessageLog, QstashMessageLogRepository, QstashMessageState, TTL_SECONDS, EnsureRedisCompatible, HashSerializer, RedisSupportedTypes

### Community 89 - "tasks"

Cohesion: 0.12
Nodes (16): cache, dependsOn, inputs, outputs, dependsOn, inputs, outputs, cache (+8 more)

### Community 90 - "lib/env.ts"

Cohesion: 0.20
Nodes (4): metadata, SiteLogo(), AuthBackgroundShape(), env

### Community 91 - "slider-filter.tsx"

Cohesion: 0.14
Nodes (18): Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), PopoverTrigger(), Default, meta (+10 more)

### Community 92 - "app/layout.tsx"

Cohesion: 0.15
Nodes (12): fontMono, ibmPlexSans, metadata, RootLayout(), spaceGroteskHeading, viewport, TanstackQueryProvider(), Window (+4 more)

### Community 93 - "rules"

Cohesion: 0.12
Nodes (15): extends, @commitlint/config-conventional, rules, body-max-line-length, body-min-length, footer-leading-blank, footer-max-line-length, header-max-length (+7 more)

### Community 94 - "scripts"

Cohesion: 0.12
Nodes (16): scripts, db:generate, db:generate-dbml, db:generate-full, db:generate-seed-sql, db:generate-sql, db:migrate, db:seed:dev (+8 more)

### Community 95 - "Method.decorators.ts"

Cohesion: 0.08
Nodes (21): Controller(), IControllerDecoratorOptions, createHttpMethodDecorator(), Delete, Get, Patch, Post, Put (+13 more)

### Community 96 - "devDependencies"

Cohesion: 0.12
Nodes (16): devDependencies, eslint, glob, jsdom, nyc, @testing-library/dom, @testing-library/react, tsx (+8 more)

### Community 97 - "UserStats.tsx"

Cohesion: 0.05
Nodes (50): ContactStatusBadge(), statusVariantMap, formatGrowth(), UserStats(), ContactStatusEnumType, ButtonSkeleton(), buttonVariants, Default (+42 more)

### Community 98 - "ParameterType"

Cohesion: 0.17
Nodes (12): ParameterType, BODY, HEADER, HEADERS, IP, NEXT, PARAM, PARAMS (+4 more)

### Community 99 - "sheet.tsx"

Cohesion: 0.18
Nodes (12): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), SheetTrigger() (+4 more)

### Community 100 - "compilerOptions"

Cohesion: 0.17
Nodes (11): compilerOptions, baseUrl, outDir, paths, rootDirs, typeRoots, exclude, extends (+3 more)

### Community 101 - "scripts"

Cohesion: 0.14
Nodes (14): scripts, build, commit, dev, docker:dev:down, docker:dev:up, format, lint (+6 more)

### Community 102 - "devDependencies"

Cohesion: 0.14
Nodes (14): devDependencies, dotenv, drizzle-dbml-generator, drizzle-kit, eslint, @faker-js/faker, tsx, @types/node (+6 more)

### Community 104 - "compilerOptions"

Cohesion: 0.13
Nodes (14): compilerOptions, emitDecoratorMetadata, experimentalDecorators, lib, module, moduleResolution, resolveJsonModule, sourceMap (+6 more)

### Community 105 - "exports"

Cohesion: 0.12
Nodes (17): exports, ./logger, ./node-zod, ./qstash, ./qstash/error, ./rate-limit, ./rate-limit/mock, ./redis (+9 more)

### Community 106 - "zod/index.ts"

Cohesion: 0.09
Nodes (11): nodeFieldValidatorZodSchema(), nodePaginateInputZodSchema(), searchFilterZodSchema(), RangeSearchEnum, RangeSearchEnumSchema, stringArraySchema, stringBooleanSchema, stringToArray() (+3 more)

### Community 107 - "ContactManagementTable.tsx"

Cohesion: 0.30
Nodes (9): ExportData(), DEFAULT_PAGE_SIZE, ContactManagementTable(), RoleManagementTable(), UserManagementTable(), useTableQueryState(), DataTableEmpty(), DataTableGlobalSearch() (+1 more)

### Community 108 - "button.stories.tsx"

Cohesion: 0.40
Nodes (4): Icon, meta, Primary, Story

### Community 109 - "orpc.types.ts"

Cohesion: 0.22
Nodes (14): SendNotificationProps, AuthStoreAction, AuthStoreState, AuthSession, AuthUser, PermissionType, RoleType, ORPCContext (+6 more)

### Community 110 - "web/tests/setup.ts"

Cohesion: 0.21
Nodes (10): protectedRateLimit, publicRateLimit, redisClient, createMockDrizzleClient(), createMockRateLimit(), createChannelMock(), createMockSupabaseClient(), createQueryBuilder() (+2 more)

### Community 111 - "user.table.ts"

Cohesion: 0.03
Nodes (72): db_id, db_soft_delete, db_updated_at, NotificationCategoryEnum, NotificationLevelEnum, AccountDataModel, AccountRelations, AccountTable (+64 more)

### Community 112 - "compilerOptions"

Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins, display (+3 more)

### Community 113 - "devDependencies"

Cohesion: 0.17
Nodes (12): devDependencies, eslint, @storybook/react-vite, tailwindcss, @tailwindcss/postcss, @turbo/gen, @types/node, @types/react (+4 more)

### Community 114 - "NotificationPermissionProvider.tsx"

Cohesion: 0.11
Nodes (34): checkPermission(), isIOSStandalone(), isPushSupportedOnPlatform(), isSupported(), NotificationPermissionProvider(), NotificationPromptCard(), requestPlatformPermission(), requiresGesture() (+26 more)

### Community 115 - "getAuthUserWithRolesAndPermissionsCache"

Cohesion: 0.40
Nodes (5): DashboardPage(), metadata, SessionPage(), SessionManagement(), getAuthUserWithRolesAndPermissionsCache

### Community 116 - "Graphify Skill"

Cohesion: 0.20
Nodes (10): Add and Watch Reference, Exports Reference, Extraction Specification, GitHub and Merge Reference, Hooks Reference, Query Reference, Transcribe Reference, Update Reference (+2 more)

### Community 118 - "scripts"

Cohesion: 0.20
Nodes (10): scripts, build, dev, format, lint, start, test, test:coverage (+2 more)

### Community 119 - "LinkButton.tsx"

Cohesion: 0.67
Nodes (3): LinkButton(), LinkButtonProps, RoutePathType

### Community 121 - "dependencies"

Cohesion: 0.18
Nodes (11): dependencies, drizzle-orm, express, http-status-codes, inversify, node-cron, @t3-oss/env-core, @workspace/contract (+3 more)

### Community 123 - "web/tsconfig.json"

Cohesion: 0.22
Nodes (8): compilerOptions, paths, plugins, exclude, extends, include, @workspace/ui/\*, @workspace/typescript-config/nextjs.json

### Community 125 - "typescript-config/package.json"

Cohesion: 0.22
Nodes (8): author, contributors, license, name, private, publishConfig, access, version

### Community 126 - "parameter.utils.ts"

Cohesion: 0.33
Nodes (7): ApiError, ApiResponseType, InputValidationError, resolveParameter(), resolveParameters(), serializeQuery(), validateWithZodSchema()

### Community 127 - "web/types/index.ts"

Cohesion: 0.25
Nodes (12): SidebarMainMenu(), permissionSeparator, buildPermissionMap(), hasPermission(), PermissionStrType, SidebarGroupMenuLinkType, SidebarMenuLinkType, filterMenuItems() (+4 more)

### Community 128 - "exports"

Cohesion: 0.22
Nodes (9): import, require, types, exports, ./base, ./internal, import, require (+1 more)

### Community 129 - "scripts"

Cohesion: 0.22
Nodes (9): scripts, build, build:cjs, build:esm, coverage:collect, coverage:merge, coverage:report, coverage:view (+1 more)

### Community 130 - "Site Logo SVG (Isometric DTR 3D Text)"

Cohesion: 0.36
Nodes (8): Storybook Favicon (Purple Lightning Bolt), Apple Touch Icon (DTR Logo), Generated Favicon SVG (DTR Logo with Base64 Embed), Generated Favicon PNG (DTR Logo), Open Graph Image (DTR Brand Card), PWA Icon 192x192 (DTR Logo), PWA Icon 512x512 (DTR Logo), Site Logo SVG (Isometric DTR 3D Text)

### Community 131 - "dependencies"

Cohesion: 0.25
Nodes (8): dependencies, better-auth, drizzle-orm, drizzle-zod, @electric-sql/pglite, postgres, @upstash/redis, zod

### Community 132 - "devDependencies"

Cohesion: 0.18
Nodes (11): devDependencies, eslint, @types/cookie-parser, @types/cors, @types/express, @types/http-errors, @types/node, typescript (+3 more)

### Community 133 - "lib/tsconfig.lint.json"

Cohesion: 0.25
Nodes (7): compilerOptions, outDir, types, exclude, extends, include, @workspace/typescript-config/base.json

### Community 134 - "mail/tsconfig.lint.json"

Cohesion: 0.25
Nodes (7): compilerOptions, outDir, types, exclude, extends, include, @workspace/typescript-config/react-library.json

### Community 136 - "ui/tsconfig.json"

Cohesion: 0.25
Nodes (7): compilerOptions, paths, exclude, extends, include, @workspace/typescript-config/react-library.json, @workspace/ui/\*

### Community 137 - "vitest-config/tsconfig.json"

Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, exclude, extends, include, @workspace/typescript-config/base.json

### Community 138 - "vitest-config/tsconfig.lint.json"

Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, exclude, extends, include, @workspace/typescript-config/base.json

### Community 139 - "scripts"

Cohesion: 0.29
Nodes (7): scripts, build, build:storybook, dev, dev:storybook, lint, preview

### Community 140 - "ExtendedRedis"

Cohesion: 0.21
Nodes (6): QstashDeadLetterRepository, createRedisClient(), ExtendedRedis, IUpstashRedistService, UpstashRedisService, UpstashRedisServiceConfig

### Community 141 - "pnpm Workspace Config"

Cohesion: 0.29
Nodes (7): @workspace/drizzle - Drizzle ORM, @workspace/eslint-config, @workspace/lib - Shared Library, @workspace/email - Email Service, @workspace/typescript-config, @workspace/vitest-config, pnpm Workspace Config

### Community 142 - "drizzle/tsconfig.lint.json"

Cohesion: 0.29
Nodes (6): compilerOptions, outDir, exclude, extends, include, @workspace/typescript-config/base.json

### Community 143 - "dependencies"

Cohesion: 0.09
Nodes (22): dependencies, @asteasolutions/zod-to-openapi, cookie-parser, cors, csrf-csrf, date-fns, @date-fns/tz, express (+14 more)

### Community 144 - "scripts"

Cohesion: 0.20
Nodes (10): scripts, build, dev, format, lint, start, test, test:coverage (+2 more)

### Community 145 - "lib/tsconfig.json"

Cohesion: 0.29
Nodes (6): compilerOptions, types, exclude, extends, include, @workspace/typescript-config/base.json

### Community 146 - "mail/tsconfig.json"

Cohesion: 0.29
Nodes (6): compilerOptions, types, exclude, extends, include, @workspace/typescript-config/react-library.json

### Community 147 - "react-library.json"

Cohesion: 0.29
Nodes (6): compilerOptions, jsx, display, extends, ./base.json, $schema

### Community 148 - "formatDateWithTimezone"

Cohesion: 0.18
Nodes (8): FormatDateCell(), FormatDateCellBaseProps, FormatDateCellProps, SessionCard(), DetailsStep(), QueryStateBoundaryProps, formatDateWithTimezone(), DateTimePickerTrigger()

### Community 149 - "ui/tsconfig.lint.json"

Cohesion: 0.29
Nodes (6): compilerOptions, outDir, exclude, extends, include, @workspace/typescript-config/react-library.json

### Community 150 - "compilerOptions"

Cohesion: 0.29
Nodes (6): compilerOptions, module, moduleResolution, outDir, extends, ./tsconfig.json

### Community 151 - "compilerOptions"

Cohesion: 0.29
Nodes (6): compilerOptions, module, moduleResolution, outDir, extends, ./tsconfig.json

### Community 152 - "setup.sh"

Cohesion: 0.62
Nodes (6): check_command(), error(), info(), setup_env_from_example(), setup.sh script, warn()

### Community 153 - ".oxlintrc.json"

Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 155 - "switch.stories.tsx"

Cohesion: 0.25
Nodes (7): Checked, Disabled, meta, Small, Story, Unchecked, Switch()

### Community 156 - "drizzle-zod"

Cohesion: 0.09
Nodes (21): RoleEnum, InsertPermission, insertPermissionSchema, PermissionTableRelations, SelectPermission, selectPermissionSchema, UpdatePermission, updatePermissionSchema (+13 more)

### Community 157 - "exports"

Cohesion: 0.33
Nodes (6): exports, ./components/_, ./globals.css, ./hooks/_, ./lib/\*, ./postcss.config

### Community 158 - "SearchableSelector.tsx"

Cohesion: 0.12
Nodes (20): SearchableSelectorContent(), SearchableSelectorContentProps, SearchableSelectorContext, SearchableSelectorContextProps, SearchableSelectorEmpty(), SearchableSelectorEmptyProps, SearchableSelectorItem(), SearchableSelectorItemProps (+12 more)

### Community 159 - "lib/src/types/index.ts"

Cohesion: 0.27
Nodes (8): ContractInput, ContractInputs, ContractMeta, ContractOutput, ContractOutputs, InferContractType, DistributiveOmit, HTTPMethods

### Community 160 - "base-config.ts"

Cohesion: 0.47
Nodes (3): baseConfig, internalConfig, uiConfig

### Community 161 - "Graphify Pipeline"

Cohesion: 0.40
Nodes (5): AST Extraction, Community Detection, Graphify Pipeline, Honesty Rules, Semantic Extraction

### Community 163 - "next.config.ts"

Cohesion: 0.40
Nodes (3): { dynamic, dynamicParams, revalidate, generateStaticParams, GET }, nextConfig, @serwist/turbopack

### Community 164 - "overrides"

Cohesion: 0.15
Nodes (13): baseline-browser-mapping, browserslist, esbuild, fast-uri, hono, js-yaml, next, postcss (+5 more)

### Community 165 - "sql-generator.ts"

Cohesion: 0.60
Nodes (4): execAsync, exportDrizzleSQL(), main(), SQL_OUTPUT_PATH

### Community 166 - "drizzle/tsconfig.json"

Cohesion: 0.40
Nodes (4): exclude, extends, include, @workspace/typescript-config/base.json

### Community 171 - "dependencies"

Cohesion: 0.50
Nodes (4): dependencies, react, react-dom, @workspace/ui

### Community 173 - "user.procedure.ts"

Cohesion: 0.15
Nodes (18): calcGrowth(), daysAgo(), listUserForSearchProcedure, listUserProcedure, profileUpdateProcedure, updateUserRoleProcedure, userDataExportProcedure, userDetailsProcedure (+10 more)

### Community 174 - "scripts"

Cohesion: 0.50
Nodes (4): scripts, format, lint, typecheck

### Community 175 - "formatOrpcError"

Cohesion: 0.14
Nodes (26): ProgressType, useContactReplyCreate(), ReplyCreateDialog(), useNotificationSettingsUpdate(), NotificationUpdateForm(), useCreateTask(), useDeleteTask(), useUpdateTask() (+18 more)

### Community 176 - "./ui"

Cohesion: 0.50
Nodes (4): ./ui, import, require, types

### Community 183 - "config"

Cohesion: 0.67
Nodes (3): path, config, commitizen

### Community 196 - "useLocalStorage"

Cohesion: 0.60
Nodes (3): useLocalStorage(), getItem(), setItem()

### Community 197 - "post-commit"

Cohesion: 0.40
Nodes (4): post-commit script, GRAPHIFY_CHANGED, GRAPHIFY_REBUILD_LOG, PYTHONHASHSEED

### Community 201 - "contract/tsconfig.lint.json"

Cohesion: 0.25
Nodes (7): compilerOptions, outDir, types, exclude, extends, include, @workspace/typescript-config/base.json

### Community 223 - "src/types.ts"

Cohesion: 0.36
Nodes (5): BuildConfigOptions, CopyDirectoryOptions, Entry, OutputOptions, tsup

### Community 226 - "./enum-values"

Cohesion: 0.67
Nodes (3): import, types, ./enum-values

### Community 227 - "devDependencies"

Cohesion: 0.29
Nodes (7): devDependencies, eslint, @types/node, typescript, vitest, @workspace/eslint-config, @workspace/typescript-config

### Community 228 - "contract/tsconfig.json"

Cohesion: 0.29
Nodes (6): compilerOptions, types, exclude, extends, include, @workspace/typescript-config/base.json

### Community 231 - "post-checkout"

Cohesion: 0.50
Nodes (3): post-checkout script, GRAPHIFY_REBUILD_LOG, PYTHONHASHSEED

### Community 234 - "tsup-config/package.json"

Cohesion: 0.08
Nodes (25): author, contributors, devDependencies, eslint, tsup, @types/node, typescript, @workspace/eslint-config (+17 more)

### Community 238 - "auth.schema.ts"

Cohesion: 0.10
Nodes (32): DEFAULT_UNAUTH_PATH, ERROR_PAGE_PATH, ForgetPasswordType, loginSchema, LoginType, magicLinkSchema, MagicLinkType, registerSchema (+24 more)

## Knowledge Gaps

- **1726 isolated node(s):** `name`, `version`, `type`, `private`, `author` (+1721 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1925 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `FileUpload.tsx`, `field.tsx`, `date-filter.tsx`, `UpdateNotificationForm.tsx`, `tags/index.tsx`, `orpc.client.ts`, `userTableColumn.tsx`, `formatDateWithTimezone`, `NotificationManagement.tsx`, `drawer.tsx`, `dashboard/profile/page.tsx`, `switch.stories.tsx`, `DashboardShellHeader.tsx`, `useAuthStore`, `SearchableSelector.tsx`, `faceted-filter.tsx`, `TaskKanbanBoard.tsx`, `badge.tsx`, `DevPanelContext.tsx`, `sidebar.tsx`, `date-time-picker.tsx`, `buildPaginateOptions.ts`, `lib/utils.ts`, `button.tsx`, `AppBreadcrumb.tsx`, `slider.stories.tsx`, `NestedMenuItem.tsx`, `lib/env.ts`, `slider-filter.tsx`, `app/layout.tsx`, `UserStats.tsx`, `sheet.tsx`, `ContactManagementTable.tsx`, `auth.schema.ts`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Why does `zod` connect `zod` to `web/package.json`, `api/user.contract.ts`, `task.contract.ts`, `di-container.ts`, `apiClient.ts`, `contract/package.json`, `auth.schema.ts`, `notification.contract.ts`, `backend/package.json`, `upload.contract.ts`, `lib/env.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `@tanstack/react-query` connect `formatOrpcError` to `UserStats.tsx`, `TaskKanbanBoard.tsx`, `web/package.json`, `SearchableSelector.tsx`, `ContactManagementTable.tsx`, `UpdateNotificationForm.tsx`, `NotificationProvider.tsx`, `contract/package.json`, `apiClient.ts`, `orpc.client.ts`, `formatDateWithTimezone`, `NotificationManagement.tsx`, `slider-filter.tsx`, `app/layout.tsx`, `useAuthStore`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `name`, `version`, `type` to the rest of the system?**
  _1726 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `email.table.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06025369978858351 - nodes in this community are weakly interconnected._
- **Should `eslint-config/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05454545454545454 - nodes in this community are weakly interconnected._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
