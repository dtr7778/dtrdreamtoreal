# Graph Report - dtr-dream-to-real (2026-09-18)

## Corpus Check

- 725 files · ~181,400 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 4074 nodes · 9006 edges · 238 communities (184 shown, 43 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `bc8d1255`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- email.table.ts
- eslint-config/package.json
- web/package.json
- auth.ts
- contact.contract.ts
- FileUpload.tsx
- mail/package.json
- Qstash.service.ts
- field.tsx
- separator.tsx
- contactSubmission.table.ts
- User.controller.ts
- dashboard/profile/page.tsx
- BaseServer.ts
- dependencies
- faceted-filter.tsx
- tasks/page.tsx
- tags/index.tsx
- userTableColumn.tsx
- schemas/index.ts
- Mail.service.tsx
- orpc.client.ts
- backend/package.json
- date-filter.tsx
- UserAvatar.tsx
- devDependencies
- zod-db-enums.ts
- ui/package.json
- server/types.ts
- spinner.tsx
- month-range-select.tsx
- EmailLayout.tsx
- employee.table.ts
- upload.procedure.ts
- TaskKanbanBoard.tsx
- UserBannedCell.tsx
- LinkingApps.tsx
- api/user.contract.ts
- RouteHandlerFactory.service.ts
- DevPanelContext.tsx
- sidebar.tsx
- Parameter.decorators.ts
- task.procedure.ts
- apiMessage.ts
- NotificationProvider.tsx
- package.json
- QstashService
- QstashMailResult
- storybook/package.json
- drizzle/package.json
- Storage.service.ts
- constants/index.ts
- date-time-picker.tsx
- user.procedure.ts
- pagination.tsx
- dependencies
- upload.contract.ts
- .createWrappedRouteHandler
- QstashMailService
- tasks
- mail/src/types/index.ts
- exports
- lib/package.json
- ui/components.json
- auth.middleware.ts
- buildPaginateOptions.ts
- input-group.tsx
- vitest-config/package.json
- compilerOptions
- web/components.json
- cn
- task.contract.ts
- devDependencies
- devDependencies
- upstashRateLimit.service.ts
- apiClient.ts
- contract/package.json
- ButtonProps
- devDependencies
- button.tsx
- AppBreadcrumb.tsx
- notification.contract.ts
- src/utils/index.ts
- ServiceError
- compilerOptions
- compilerOptions
- empty.tsx
- QstashMessageLogRepository
- tasks
- lib/env.ts
- lib/utils.ts
- app/layout.tsx
- rules
- scripts
- TestBaseServer.ts
- devDependencies
- UserStats.tsx
- ParameterType
- sheet.tsx
- compilerOptions
- scripts
- devDependencies
- DatabaseType
- compilerOptions
- exports
- zod/index.ts
- input.tsx
- UpdateNotificationForm.tsx
- orpc.types.ts
- web/tests/setup.ts
- user.table.ts
- compilerOptions
- devDependencies
- NotificationPermissionProvider.tsx
- CronJobService
- Graphify Skill
- express.d.ts
- scripts
- data-table-slider-filter.tsx
- QstashDeadLetterRepository
- dependencies
- emailThread.table.ts
- web/tsconfig.json
- NotificationPanel.tsx
- typescript-config/package.json
- address.table.ts
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
- FileUpload.stories.tsx
- ui/tsconfig.lint.json
- compilerOptions
- compilerOptions
- setup.sh
- .oxlintrc.json
- ProcedureApiUtils
- tanstack-query-provider.tsx
- db_created_at
- exports
- SearchableSelector.tsx
- contract.types.ts
- base-config.ts
- Graphify Pipeline
- main.ts
- next.config.ts
- overrides
- sql-generator.ts
- drizzle/tsconfig.json
- [userId]/page.tsx
- devDependencies
- dialog.tsx
- storage.seed.ts
- dependencies
- ui/postcss.config.mjs
- progress.tsx
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
- task.table.ts
- useAuthStore
- HandlerRegistry
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
- button.stories.tsx
- faceted-filter.stories.tsx
- ./enum-values
- devDependencies
- contract/tsconfig.json
- dependencies.ts
- baseZodSchema.ts
- dependencies
- label.tsx
- scripts
- CheckboxField.tsx
- auth.schema.ts
- slider-filter.tsx
- README.md

## God Nodes (most connected - your core abstractions)

1. `cn()` - 305 edges
2. `Button()` - 64 edges
3. `apiResponse()` - 35 edges
4. `ClassConstructor` - 34 edges
5. `db_id` - 33 edges
6. `drizzle-zod` - 32 edges
7. `useAuthStore()` - 31 edges
8. `QstashService` - 30 edges
9. `db_created_at` - 29 edges
10. `env` - 28 edges

## Surprising Connections (you probably didn't know these)

- `TaskKanbanCardSkeleton()` --calls--> `cn()` [EXTRACTED]
  apps/web/features/task/components/TaskKanbanSkeleton.tsx → packages/ui/src/lib/utils.ts
- `RootLayout()` --calls--> `cn()` [EXTRACTED]
  apps/web/app/layout.tsx → packages/ui/src/lib/utils.ts
- `ContactManagementTable()` --calls--> `useDebouncedCallback()` [EXTRACTED]
  apps/web/features/contact/components/contact-table/ContactManagementTable.tsx → packages/ui/src/hooks/use-debounced-callback.ts
- `SendNotificationProps` --references--> `DatabaseType` [EXTRACTED]
  apps/web/features/notification/data/sendNotification.ts → packages/drizzle/src/drizzle-client.ts
- `ORPCContext` --references--> `DatabaseType` [EXTRACTED]
  apps/web/types/orpc.types.ts → packages/drizzle/src/drizzle-client.ts

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

## Communities (238 total, 43 thin omitted)

### Community 0 - "email.table.ts"

Cohesion: 0.08
Nodes (29): EmailDirectionEnum, EmailRecipientTypeEnum, EmailStatusEnum, EmailDataModel, EmailRelations, EmailTable, InsertEmail, insertEmailSchema (+21 more)

### Community 1 - "eslint-config/package.json"

Cohesion: 0.05
Nodes (43): config, expressEslintConfig, nextJsConfig, author, contributors, devDependencies, eslint, eslint-config-prettier (+35 more)

### Community 2 - "web/package.json"

Cohesion: 0.05
Nodes (38): author, contributors, license, name, private, publishConfig, access, type (+30 more)

### Community 3 - "auth.ts"

Cohesion: 0.05
Nodes (46): { GET, POST }, DELETE, GET, HEAD, PATCH, POST, PUT, runtime (+38 more)

### Community 4 - "contact.contract.ts"

Cohesion: 0.22
Nodes (8): contactBaseContract, contactContract, createReplyContactContract, CreateReplyContactContractType, detailsContactContract, DetailsContactContractType, listContactContract, tags

### Community 5 - "FileUpload.tsx"

Cohesion: 0.12
Nodes (19): PerfEntry, PerformancePanel(), DefaultFilePreview(), DefaultPlaceholder(), FileUpload, FileUploadValidation, FileUploadVariant, VARIANT_ACCEPT (+11 more)

### Community 6 - "mail/package.json"

Cohesion: 0.04
Nodes (48): author, contributors, dependencies, drizzle-orm, react, react-dom, react-email, resend (+40 more)

### Community 7 - "Qstash.service.ts"

Cohesion: 0.12
Nodes (17): DEFAULTS, IQstashService, QstashCallbackHandler, QstashDeadLetter, QstashMessage, QstashPublishOptions, QstashPublishResult, QstashReceiptHandler (+9 more)

### Community 8 - "field.tsx"

Cohesion: 0.11
Nodes (26): FileUploadField(), loginSchema, LoginType, UserBannedType, LoginForm(), RememberMe(), RememberMeProps, UserBannedFormProps (+18 more)

### Community 9 - "separator.tsx"

Cohesion: 0.33
Nodes (5): Separator(), Horizontal, meta, Story, Vertical

### Community 10 - "contactSubmission.table.ts"

Cohesion: 0.08
Nodes (28): ContactStatusEnum, ContactSubmissionDataModel, ContactSubmissionRelations, ContactSubmissionTable, InsertContactSubmission, insertContactSubmissionSchema, SelectContactSubmission, selectContactSubmissionSchema (+20 more)

### Community 11 - "User.controller.ts"

Cohesion: 0.10
Nodes (20): CONTAINER_TYPES, container, env, main(), IUserController, UserController, UserCronService, Server (+12 more)

### Community 12 - "dashboard/profile/page.tsx"

Cohesion: 0.09
Nodes (31): metadata, metadata, metadata, metadata, metadata, metadata, ProfilePage(), metadata (+23 more)

### Community 13 - "BaseServer.ts"

Cohesion: 0.08
Nodes (26): LoggerConfig, LoggerType, BaseServer, BaseServerConfig, IBaseServer, ApiResponse, API_MESSAGE, createCsrf() (+18 more)

### Community 14 - "dependencies"

Cohesion: 0.05
Nodes (43): dependencies, axios, better-auth, @better-auth/drizzle-adapter, date-fns, drizzle-orm, @hookform/resolvers, @hugeicons/core-free-icons (+35 more)

### Community 15 - "faceted-filter.tsx"

Cohesion: 0.12
Nodes (24): Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator() (+16 more)

### Community 16 - "tasks/page.tsx"

Cohesion: 0.17
Nodes (24): ContactDetailsPage(), metadata, ContactPage(), metadata, NotificationPage(), metadata, RolesPage(), metadata (+16 more)

### Community 17 - "tags/index.tsx"

Cohesion: 0.11
Nodes (25): TagsField(), TagsFieldProps, TagsFieldRenderProps, TagType, Tags(), TagsContent(), TagsContentProps, TagsContext (+17 more)

### Community 18 - "userTableColumn.tsx"

Cohesion: 0.12
Nodes (25): ListContactContractType, ContactTable(), ContactTableProps, contactTableColumn, ContactTableRowDataType, ListRoleContractType, RoleTable(), RoleTableProps (+17 more)

### Community 19 - "schemas/index.ts"

Cohesion: 0.09
Nodes (40): generatePermissionsSql(), generateRolePermissionSql(), generateRolesSql(), main(), PermissionLevelEnumType, ResourceTypeEnumType, RoleEnumType, PermissionDataModel (+32 more)

### Community 20 - "Mail.service.tsx"

Cohesion: 0.06
Nodes (36): AccountLockedMail(), AccountLockedMailProps, EmailVerificationMail(), EmailVerificationMailProps, NewDeviceLoginMail(), NewDeviceLoginMailProps, PasswordChangedMail(), PasswordChangedMailProps (+28 more)

### Community 21 - "orpc.client.ts"

Cohesion: 0.20
Nodes (15): ExportData(), ContactManagementTable(), RoleManagementTable(), UserManagementTable(), useTableQueryState(), QueryStateBoundary(), QueryStateBoundaryProps, link (+7 more)

### Community 22 - "backend/package.json"

Cohesion: 0.09
Nodes (22): author, contributors, files, license, name, private, publishConfig, access (+14 more)

### Community 23 - "date-filter.tsx"

Cohesion: 0.10
Nodes (25): buttonVariants, Calendar(), CalendarDayButton(), CalendarProps, meta, MultipleMonths, Single, Story (+17 more)

### Community 24 - "UserAvatar.tsx"

Cohesion: 0.16
Nodes (16): UserAvatar(), UserAvatarImage(), UserAvatarImageProps, UserAvatarProps, resolveImagePath(), Avatar(), AvatarBadge(), AvatarFallback() (+8 more)

### Community 25 - "devDependencies"

Cohesion: 0.11
Nodes (18): devDependencies, cross-env, dotenv, eslint, reflect-metadata, source-map-support, supertest, tsup (+10 more)

### Community 26 - "zod-db-enums.ts"

Cohesion: 0.08
Nodes (38): PushPayload, serwist, WorkerGlobalScope, EmailEventTypeEnum, ACTION_TYPE, ADDRESS_TYPE, CONTACT_STATUS, EMAIL_DIRECTION (+30 more)

### Community 27 - "ui/package.json"

Cohesion: 0.05
Nodes (37): author, contributors, date-fns, eslint, @hugeicons/core-free-icons, @hugeicons/react, lucide-react, motion (+29 more)

### Community 28 - "server/types.ts"

Cohesion: 0.13
Nodes (20): Controller(), IControllerDecoratorOptions, ControllerInfos, IControllerLoaderConfiguration, MetadataExtractorService, OpenApiDocumentationService, IOpenApiLoaderConfigs, OpenApiLoader (+12 more)

### Community 29 - "spinner.tsx"

Cohesion: 0.10
Nodes (9): DashboardShellDescriptionSkeleton(), DashboardShellTitleSkeleton(), DashboardShellSkeleton(), DashboardShellSkeletonProps, Spinner(), Default, Large, meta (+1 more)

### Community 30 - "month-range-select.tsx"

Cohesion: 0.19
Nodes (13): MonthRange, MonthRangeSelect(), MonthRangeSelectProps, RangeGrid(), RangeGridItem, RangeGridProps, WeekRange, WeekRangeSelect() (+5 more)

### Community 31 - "EmailLayout.tsx"

Cohesion: 0.49
Nodes (6): EmailButton(), EmailHeading(), EmailInfoCard(), EmailLayout(), EmailLink(), react-email

### Community 32 - "employee.table.ts"

Cohesion: 0.05
Nodes (47): SocialMediaPlatfromTypeEnum, SocialMediaTypeEnum, SocialMediaPlatfromTypeEnumSchema, insertAddressSchema, EmployeeDataModel, EmployeeRelations, EmployeeTable, InsertEmployee (+39 more)

### Community 33 - "upload.procedure.ts"

Cohesion: 0.28
Nodes (10): DEFAULT_FILE_CACHE_TIMEOUT, assignFileEntityProcedure, confirmUploadProcedure, deleteUploadProcedure, getSignedDownloadUrlProcedure, getSignedUploadUrlProcedure, uploadImpl, resolveFileUrl() (+2 more)

### Community 34 - "TaskKanbanBoard.tsx"

Cohesion: 0.09
Nodes (27): TimeRangeFilter(), ListTaskContractType, TaskItem, TaskKanbanBoard(), TaskKanbanCard(), TaskPriorityBadge(), createRangeFilterClient(), KanbanBoard() (+19 more)

### Community 35 - "UserBannedCell.tsx"

Cohesion: 0.29
Nodes (8): UserBannedCell(), UserBannedProps, HoverCard(), HoverCardContent(), HoverCardTrigger(), Default, meta, Story

### Community 36 - "LinkingApps.tsx"

Cohesion: 0.14
Nodes (14): metadata, GoogleIcon(), ERROR_PAGE_PATH, Account, AccountCard(), LinkingApps(), SUPPORTED_OAUTH_PROVIDER_DETAILS, SupportedOAuthProvider (+6 more)

### Community 37 - "api/user.contract.ts"

Cohesion: 0.08
Nodes (29): listUserContract, listUserForSearchContract, ListUserForSearchContractType, profileUpdateContract, ProfileUpdateContractType, tags, userBaseContract, userContract (+21 more)

### Community 38 - "RouteHandlerFactory.service.ts"

Cohesion: 0.18
Nodes (12): ApiError, ApiErrorFilter, ExceptionHandlerService, ApiResponseType, IExceptionFilter, INextFunction, InputValidationError, IRequestExecutionContext (+4 more)

### Community 39 - "DevPanelContext.tsx"

Cohesion: 0.14
Nodes (22): AuthPanel(), ConsoleDevPanel(), filters, FilterType, LOG_BADGE_STYLES, orig, DevPanelBody(), DevPanelContext (+14 more)

### Community 40 - "sidebar.tsx"

Cohesion: 0.06
Nodes (56): AppSidebar(), AppSidebarProps, NestedMenuItem(), SettingsSidebar(), SidebarFooterMenu(), SidebarLogo(), SidebarMainMenu(), Topbar() (+48 more)

### Community 41 - "Parameter.decorators.ts"

Cohesion: 0.09
Nodes (21): REFLECT_KEYS, ICronJobClassOptions, ICronJobConfigs, createHttpMethodDecorator(), Delete, Get, Patch, Post (+13 more)

### Community 42 - "task.procedure.ts"

Cohesion: 0.12
Nodes (26): listNotificationProcedure, markAsReadProcedure, notificationImpl, settingsDetailsProcedure, subscribePushNotificationProcedure, unsubscribePushNotificationProcedure, updateSettingsProcedure, AssignedUser (+18 more)

### Community 43 - "apiMessage.ts"

Cohesion: 0.17
Nodes (19): POST(), POST(), POST(), POST(), POST(), API_MESSAGES, mail, getQstashPayload() (+11 more)

### Community 44 - "NotificationProvider.tsx"

Cohesion: 0.17
Nodes (15): NotificationProvider(), chimeSound(), getAudioContext(), NOTIFICATION_EVENT, notificationChannel(), getVisibilityChangeEvent(), getVisibilityProps(), isVisibilityAPISupported() (+7 more)

### Community 45 - "package.json"

Cohesion: 0.07
Nodes (26): author, contributors, @commitlint/config-conventional, dotenv, eslint, @storybook/addon-vitest, @supabase/supabase-js, typescript (+18 more)

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

Cohesion: 0.08
Nodes (24): author, contributors, better-auth, dotenv, drizzle-orm, eslint, @faker-js/faker, tsx (+16 more)

### Community 50 - "Storage.service.ts"

Cohesion: 0.13
Nodes (10): getStorageInstance(), BaseStorageService, createStorage(), IStorageService, StorageService, FileInfoType, SignedDownloadUrl, SignedUploadUrl (+2 more)

### Community 51 - "constants/index.ts"

Cohesion: 0.19
Nodes (13): manifest(), AUTH_ROUTES, BACKGROUND_COLOR, DEFAULT_AUTH_PATH, DEFAULT_PAGE_SIZE, PUBLIC_ROUTES, SUPPORTED_OAUTH_PROVIDERS, THEME_COLOR (+5 more)

### Community 52 - "date-time-picker.tsx"

Cohesion: 0.10
Nodes (22): DateTimeDayButton(), DateTimePicker(), DateTimePickerTriggerProps, MONTH_NAMES, basic, meta, Story, WithBookings (+14 more)

### Community 53 - "user.procedure.ts"

Cohesion: 0.10
Nodes (27): calcGrowth(), daysAgo(), listUserForSearchProcedure, listUserProcedure, profileUpdateProcedure, updateUserRoleProcedure, userDataExportProcedure, userDetailsProcedure (+19 more)

### Community 54 - "pagination.tsx"

Cohesion: 0.24
Nodes (12): MetaPagination(), Pagination(), PaginationContent(), PaginationEllipsis(), PaginationItem(), PaginationLink(), PaginationLinkProps, PaginationNext() (+4 more)

### Community 55 - "dependencies"

Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, @dnd-kit/core, @dnd-kit/sortable (+18 more)

### Community 56 - "upload.contract.ts"

Cohesion: 0.07
Nodes (31): authContract, authMetadataContract, AuthMetadataContractType, requestResetPasswordContract, RequestResetPasswordContractType, tags, userBanContract, UserBanContractType (+23 more)

### Community 57 - ".createWrappedRouteHandler"

Cohesion: 0.22
Nodes (7): RouteInfos, MiddlewareResolverService, RouteHandlerFactoryService, RouterFactoryService, IMiddleware, IRequestHandler, IRouteDefinition

### Community 59 - "tasks"

Cohesion: 0.08
Nodes (23): dependsOn, inputs, outputs, cache, persistent, dependsOn, globalEnv, dependsOn (+15 more)

### Community 60 - "mail/src/types/index.ts"

Cohesion: 0.20
Nodes (12): createMail(), MailConfig, ResendMailTransport, IMailTransport, InboundEmailAttachment, InboundEmailPayload, InboundEmailResult, MailCallbackPayload (+4 more)

### Community 61 - "exports"

Cohesion: 0.11
Nodes (19): import, import, types, types, exports, ./client, ./client/mock, ./paginate-query (+11 more)

### Community 62 - "lib/package.json"

Cohesion: 0.07
Nodes (28): author, contributors, license, name, private, publishConfig, access, scripts (+20 more)

### Community 63 - "ui/components.json"

Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 64 - "auth.middleware.ts"

Cohesion: 0.09
Nodes (35): RESET_PASSWORD_PATH, authImpl, authMetadataProcedure, requestResetPasswordProcedure, userBanProcedure, authRouter, contactImpl, createReplyContactProcedure (+27 more)

### Community 65 - "buildPaginateOptions.ts"

Cohesion: 0.20
Nodes (16): MetaPaginationProps, buildFilterWhere(), buildOrderBy(), buildPaginateOptions(), buildSearchWhere(), buildWhere(), DateRangeFilter, FilterValue (+8 more)

### Community 66 - "input-group.tsx"

Cohesion: 0.09
Nodes (24): DataTableFacetedFilter(), DataTableFacetedFilterProps, DataTableFilterItemProps, DataTableFilterItems(), FacetedFilter(), InputAddonFieldProps, InputAddonFieldRenderProps, InputGroup() (+16 more)

### Community 67 - "vitest-config/package.json"

Cohesion: 0.10
Nodes (20): author, contributors, eslint, tsx, @types/node, typescript, @vitejs/plugin-react, vitest (+12 more)

### Community 68 - "compilerOptions"

Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 69 - "web/components.json"

Cohesion: 0.10
Nodes (19): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+11 more)

### Community 70 - "cn"

Cohesion: 0.08
Nodes (44): DataTableActionBar(), DataTableProps, DataTablePagination(), DataTablePaginationProps, DataTableRowMenu(), DataTableSkeletonProps, DateTimePickerContent(), DrawerOverlay() (+36 more)

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

Cohesion: 0.09
Nodes (26): apiClient, instance, ApiClient, CallApiOptions, createApiClient(), createApiClientInternal(), CreateApiClientOptions, InfiniteKeyOptions (+18 more)

### Community 77 - "contract/package.json"

Cohesion: 0.06
Nodes (33): author, contributors, exports, license, name, private, publishConfig, access (+25 more)

### Community 78 - "ButtonProps"

Cohesion: 0.22
Nodes (10): LinkButtonProps, ButtonProps, CalendarCompProps, DateTimePickerContentProps, DateTimePickerProps, FacetedFilterProps, FacetedFilterTriggerProps, DateTimePickerFieldProps (+2 more)

### Community 79 - "devDependencies"

Cohesion: 0.11
Nodes (18): devDependencies, @chromatic-com/storybook, eslint-plugin-storybook, oxlint, playwright, storybook, @storybook/addon-a11y, @storybook/addon-docs (+10 more)

### Community 80 - "button.tsx"

Cohesion: 0.09
Nodes (37): metadata, ExportDataProps, PRESET_KEYS, presetRanges, TimeRangeFilterProps, TimeRangeState, ExportFormat, Button() (+29 more)

### Community 81 - "AppBreadcrumb.tsx"

Cohesion: 0.21
Nodes (15): AppBreadcrumb(), findBreadcrumbs(), findRoute(), breadcrumbRoutes, BreadcrumbRouteType, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem() (+7 more)

### Community 82 - "notification.contract.ts"

Cohesion: 0.12
Nodes (16): listNotificationContract, markAsReadContract, MarkAsReadContractType, notificationContract, settingsDetailsContract, SettingsDetailsContractType, subscribePushNotificationContract, SubscribePushNotificationContractType (+8 more)

### Community 83 - "src/utils/index.ts"

Cohesion: 0.10
Nodes (25): useNotificationMarkAsRead(), ListNotificationContractType, CATEGORY_CONFIG, LEVEL_CONFIG, NotificationItem(), NotificationItemProps, timeAgo(), NotificationManagement() (+17 more)

### Community 84 - "ServiceError"

Cohesion: 0.25
Nodes (3): MailError, MailErrorCode, ServiceError

### Community 85 - "compilerOptions"

Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib, module (+9 more)

### Community 86 - "compilerOptions"

Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 87 - "empty.tsx"

Cohesion: 0.31
Nodes (10): Empty(), EmptyContent(), EmptyDescription(), EmptyHeader(), EmptyMedia(), emptyMediaVariants, EmptyTitle(), Default (+2 more)

### Community 88 - "QstashMessageLogRepository"

Cohesion: 0.19
Nodes (4): QstashMessageLogRepository, EnsureRedisCompatible, HashSerializer, RedisSupportedTypes

### Community 89 - "tasks"

Cohesion: 0.12
Nodes (16): cache, dependsOn, inputs, outputs, dependsOn, inputs, outputs, cache (+8 more)

### Community 90 - "lib/env.ts"

Cohesion: 0.13
Nodes (13): metadata, SiteLogo(), AuthBackgroundShape(), sendNotification(), SendNotificationProps, env, getSupabaseClientInstance(), InsertNotification (+5 more)

### Community 91 - "lib/utils.ts"

Cohesion: 0.10
Nodes (20): TaskKanbanCardSkeleton(), TaskKanbanSkeleton(), TaskStatusEnumSchema, ButtonSkeleton(), buttonVariants, Default, Icon, meta (+12 more)

### Community 92 - "app/layout.tsx"

Cohesion: 0.22
Nodes (7): fontMono, ibmPlexSans, metadata, RootLayout(), spaceGroteskHeading, viewport, ThemeProvider()

### Community 93 - "rules"

Cohesion: 0.12
Nodes (15): extends, @commitlint/config-conventional, rules, body-max-line-length, body-min-length, footer-leading-blank, footer-max-line-length, header-max-length (+7 more)

### Community 94 - "scripts"

Cohesion: 0.12
Nodes (16): scripts, db:generate, db:generate-dbml, db:generate-full, db:generate-seed-sql, db:generate-sql, db:migrate, db:seed:dev (+8 more)

### Community 95 - "TestBaseServer.ts"

Cohesion: 0.15
Nodes (7): errorMiddleware(), getServerError(), jsonMiddleware(), ControllerLoader, ITestBaseServer, TestBaseServer, TestBaseServerConfig

### Community 96 - "devDependencies"

Cohesion: 0.12
Nodes (16): devDependencies, eslint, glob, jsdom, nyc, @testing-library/dom, @testing-library/react, tsx (+8 more)

### Community 97 - "UserStats.tsx"

Cohesion: 0.09
Nodes (33): ContactStatusBadge(), statusVariantMap, formatGrowth(), UserStats(), ContactStatusEnumType, Stat(), StatDescription(), StatIndicator() (+25 more)

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

### Community 103 - "DatabaseType"

Cohesion: 0.27
Nodes (4): DatabaseType, InsertEmailThread, EmailService, ThreadService

### Community 104 - "compilerOptions"

Cohesion: 0.13
Nodes (14): compilerOptions, emitDecoratorMetadata, experimentalDecorators, lib, module, moduleResolution, resolveJsonModule, sourceMap (+6 more)

### Community 105 - "exports"

Cohesion: 0.12
Nodes (16): exports, ./node-zod, ./qstash, ./qstash/error, ./rate-limit, ./rate-limit/mock, ./redis, ./redis/mock (+8 more)

### Community 106 - "zod/index.ts"

Cohesion: 0.13
Nodes (6): nodeFieldValidatorZodSchema(), nodePaginateInputZodSchema(), searchFilterZodSchema(), fieldValidatorZodSchema(), ExtractObjectKeys, paginateInputZodSchema()

### Community 107 - "input.tsx"

Cohesion: 0.11
Nodes (16): DataTableGlobalSearchProps, Input(), Default, Disabled, meta, Story, PasswordInput(), Default (+8 more)

### Community 108 - "UpdateNotificationForm.tsx"

Cohesion: 0.13
Nodes (15): FormConfig, NOTIFICATION_FIELDS, NotificationFormProps, prepareFormData(), SwitchFieldProps, UpdateNotificationForm(), NotificationUpdateType, FieldTitle() (+7 more)

### Community 109 - "orpc.types.ts"

Cohesion: 0.15
Nodes (21): DashboardPage(), metadata, SessionPage(), SessionManagement(), getAuthUser(), getAuthUserCache, getAuthUserWithRolesAndPermissions(), getAuthUserWithRolesAndPermissionsCache (+13 more)

### Community 110 - "web/tests/setup.ts"

Cohesion: 0.17
Nodes (12): protectedRateLimit, publicRateLimit, redisClient, createMockDrizzleClient(), createMockRateLimit(), createMockRedisClient(), store, createChannelMock() (+4 more)

### Community 111 - "user.table.ts"

Cohesion: 0.04
Nodes (79): db_id, db_soft_delete, db_updated_at, NotificationCategoryEnum, NotificationLevelEnum, AccountDataModel, AccountRelations, AccountTable (+71 more)

### Community 112 - "compilerOptions"

Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins, display (+3 more)

### Community 113 - "devDependencies"

Cohesion: 0.17
Nodes (12): devDependencies, eslint, @storybook/react-vite, tailwindcss, @tailwindcss/postcss, @turbo/gen, @types/node, @types/react (+4 more)

### Community 114 - "NotificationPermissionProvider.tsx"

Cohesion: 0.09
Nodes (37): checkPermission(), isIOSStandalone(), isPushSupportedOnPlatform(), isSupported(), NotificationPermissionProvider(), NotificationPromptCard(), requestPlatformPermission(), requiresGesture() (+29 more)

### Community 116 - "Graphify Skill"

Cohesion: 0.20
Nodes (10): Add and Watch Reference, Exports Reference, Extraction Specification, GitHub and Merge Reference, Hooks Reference, Query Reference, Transcribe Reference, Update Reference (+2 more)

### Community 118 - "scripts"

Cohesion: 0.20
Nodes (10): scripts, build, dev, format, lint, start, test, test:coverage (+2 more)

### Community 119 - "data-table-slider-filter.tsx"

Cohesion: 0.31
Nodes (5): DataTableSliderFilter(), DataTableSliderFilterProps, RangeValue, SliderMeta, SliderUtils

### Community 121 - "dependencies"

Cohesion: 0.18
Nodes (11): dependencies, drizzle-orm, express, http-status-codes, inversify, node-cron, @t3-oss/env-core, @workspace/contract (+3 more)

### Community 122 - "emailThread.table.ts"

Cohesion: 0.07
Nodes (31): EmailThreadDataModel, EmailThreadRelations, EmailThreadTable, insertEmailThreadSchema, SelectEmailThread, selectEmailThreadSchema, UpdateEmailThread, updateEmailThreadSchema (+23 more)

### Community 123 - "web/tsconfig.json"

Cohesion: 0.22
Nodes (8): compilerOptions, paths, plugins, exclude, extends, include, @workspace/ui/\*, @workspace/typescript-config/nextjs.json

### Community 124 - "NotificationPanel.tsx"

Cohesion: 0.16
Nodes (15): Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), PopoverTrigger(), Default, meta (+7 more)

### Community 125 - "typescript-config/package.json"

Cohesion: 0.22
Nodes (8): author, contributors, license, name, private, publishConfig, access, version

### Community 126 - "address.table.ts"

Cohesion: 0.11
Nodes (18): AddressTypeEnum, AddressDataModel, AddressRelations, AddressTable, InsertAddress, SelectAddress, selectAddressSchema, UpdateAddress (+10 more)

### Community 127 - "web/types/index.ts"

Cohesion: 0.29
Nodes (9): permissionSeparator, UserTableRowAction(), usePermissionCheck(), buildPermissionMap(), hasPermission(), PermissionStrType, ActionTypeEnumSchema, ActionTypeEnumType (+1 more)

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

Cohesion: 0.33
Nodes (5): createRedisClient(), ExtendedRedis, IUpstashRedistService, UpstashRedisService, UpstashRedisServiceConfig

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

### Community 148 - "FileUpload.stories.tsx"

Cohesion: 0.20
Nodes (10): FileUploadProps, FileUploadRef, Default, FileUploadStory(), meta, Multiple, Story, WithMaxSizeValidation (+2 more)

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

### Community 155 - "tanstack-query-provider.tsx"

Cohesion: 0.36
Nodes (5): TanstackQueryProvider(), Window, createQueryClient(), serializer, @tanstack/react-query-devtools

### Community 156 - "db_created_at"

Cohesion: 0.09
Nodes (24): db_created_at, RoleEnum, InsertPermission, insertPermissionSchema, PermissionTable, PermissionTableRelations, SelectPermission, selectPermissionSchema (+16 more)

### Community 157 - "exports"

Cohesion: 0.33
Nodes (6): exports, ./components/_, ./globals.css, ./hooks/_, ./lib/\*, ./postcss.config

### Community 158 - "SearchableSelector.tsx"

Cohesion: 0.12
Nodes (21): SearchableSelector(), SearchableSelectorContent(), SearchableSelectorContentProps, SearchableSelectorContext, SearchableSelectorContextProps, SearchableSelectorEmpty(), SearchableSelectorEmptyProps, SearchableSelectorItem() (+13 more)

### Community 159 - "contract.types.ts"

Cohesion: 0.32
Nodes (7): ContractInput, ContractInputs, ContractMeta, ContractOutput, ContractOutputs, InferContractType, HTTPMethods

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

Cohesion: 0.40
Nodes (5): esbuild, postcss, sharp, pnpm, overrides

### Community 165 - "sql-generator.ts"

Cohesion: 0.60
Nodes (4): execAsync, exportDrizzleSQL(), main(), SQL_OUTPUT_PATH

### Community 166 - "drizzle/tsconfig.json"

Cohesion: 0.40
Nodes (4): exclude, extends, include, @workspace/typescript-config/base.json

### Community 167 - "[userId]/page.tsx"

Cohesion: 0.16
Nodes (16): metadata, LinkButton(), TabNavigation(), TabNavigationContent(), TabNavigationList(), TabNavigationProps, TabNavigationTrigger(), Default (+8 more)

### Community 168 - "devDependencies"

Cohesion: 0.29
Nodes (7): devDependencies, eslint, tsup, @types/node, typescript, @workspace/eslint-config, @workspace/typescript-config

### Community 169 - "dialog.tsx"

Cohesion: 0.12
Nodes (24): createReplySchema, CreateReplyType, UserUpdateDialog(), DataTableFilterView(), DataTableFilterViewProps, DataTableToolbar(), DataTableToolbarProps, DataTableViewOptions() (+16 more)

### Community 171 - "dependencies"

Cohesion: 0.50
Nodes (4): dependencies, react, react-dom, @workspace/ui

### Community 173 - "progress.tsx"

Cohesion: 0.24
Nodes (9): Progress(), ProgressIndicator(), ProgressLabel(), ProgressTrack(), ProgressValue(), Default, meta, Story (+1 more)

### Community 174 - "scripts"

Cohesion: 0.50
Nodes (4): scripts, format, lint, typecheck

### Community 175 - "formatOrpcError"

Cohesion: 0.12
Nodes (28): ProgressType, useBanUnbannedUser(), useRequestPasswordReset(), useContactReplyCreate(), ReplyCreateDialog(), useNotificationSettingsUpdate(), NotificationUpdateForm(), useCreateTask() (+20 more)

### Community 176 - "./ui"

Cohesion: 0.50
Nodes (4): ./ui, import, require, types

### Community 183 - "config"

Cohesion: 0.67
Nodes (3): path, config, commitizen

### Community 195 - "task.table.ts"

Cohesion: 0.17
Nodes (11): TaskPriorityEnum, TaskStatusEnum, InsertTask, insertTaskSchema, SelectTask, selectTaskSchema, TaskDataModel, TaskRelations (+3 more)

### Community 196 - "useAuthStore"

Cohesion: 0.24
Nodes (7): metadata, UpdatePasswordForm(), SetPasswordButton(), CreateTaskDialog(), UserBannedForm(), ProfileUpdateForm(), useAuthStore()

### Community 201 - "contract/tsconfig.lint.json"

Cohesion: 0.25
Nodes (7): compilerOptions, outDir, types, exclude, extends, include, @workspace/typescript-config/base.json

### Community 223 - "src/types.ts"

Cohesion: 0.36
Nodes (5): BuildConfigOptions, CopyDirectoryOptions, Entry, OutputOptions, tsup

### Community 224 - "button.stories.tsx"

Cohesion: 0.40
Nodes (4): Icon, meta, Primary, Story

### Community 225 - "faceted-filter.stories.tsx"

Cohesion: 0.25
Nodes (7): Option, Default, meta, options, SingleSelect, Story, WithCounts

### Community 226 - "./enum-values"

Cohesion: 0.67
Nodes (3): import, types, ./enum-values

### Community 227 - "devDependencies"

Cohesion: 0.29
Nodes (7): devDependencies, eslint, @types/node, typescript, vitest, @workspace/eslint-config, @workspace/typescript-config

### Community 228 - "contract/tsconfig.json"

Cohesion: 0.29
Nodes (6): compilerOptions, types, exclude, extends, include, @workspace/typescript-config/base.json

### Community 230 - "baseZodSchema.ts"

Cohesion: 0.29
Nodes (5): RangeSearchEnum, RangeSearchEnumSchema, stringArraySchema, stringBooleanSchema, stringToArray()

### Community 231 - "dependencies"

Cohesion: 0.33
Nodes (6): dependencies, axios, @tanstack/react-query, @workspace/drizzle, @workspace/lib, zod

### Community 232 - "label.tsx"

Cohesion: 0.40
Nodes (4): Label(), Default, meta, Story

### Community 234 - "scripts"

Cohesion: 0.40
Nodes (5): scripts, build, format, lint, typecheck

### Community 235 - "CheckboxField.tsx"

Cohesion: 0.16
Nodes (9): Checkbox(), Checked, Disabled, meta, Story, Unchecked, FieldContent(), CheckboxFieldProps (+1 more)

### Community 238 - "auth.schema.ts"

Cohesion: 0.11
Nodes (23): DEFAULT_UNAUTH_PATH, ForgetPasswordType, magicLinkSchema, MagicLinkType, registerSchema, RegisterType, resetPasswordSchema, ResetPasswordType (+15 more)

### Community 239 - "slider-filter.tsx"

Cohesion: 0.13
Nodes (15): RangeValue, SliderFilter(), SliderFilterTriggerProps, Default, LargeRange, meta, Story, Slider() (+7 more)

## Knowledge Gaps

- **1720 isolated node(s):** `metadata`, `TimeRangeState`, `TimeRangeFilterProps`, `PRESET_KEYS`, `presetRanges` (+1715 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1907 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `FileUpload.tsx`, `field.tsx`, `separator.tsx`, `dashboard/profile/page.tsx`, `faceted-filter.tsx`, `tasks/page.tsx`, `tags/index.tsx`, `userTableColumn.tsx`, `orpc.client.ts`, `date-filter.tsx`, `UserAvatar.tsx`, `spinner.tsx`, `month-range-select.tsx`, `SearchableSelector.tsx`, `TaskKanbanBoard.tsx`, `UserBannedCell.tsx`, `LinkingApps.tsx`, `DevPanelContext.tsx`, `[userId]/page.tsx`, `dialog.tsx`, `sidebar.tsx`, `progress.tsx`, `date-time-picker.tsx`, `pagination.tsx`, `input-group.tsx`, `button.tsx`, `AppBreadcrumb.tsx`, `src/utils/index.ts`, `empty.tsx`, `lib/env.ts`, `lib/utils.ts`, `app/layout.tsx`, `UserStats.tsx`, `sheet.tsx`, `label.tsx`, `CheckboxField.tsx`, `UpdateNotificationForm.tsx`, `input.tsx`, `slider-filter.tsx`, `NotificationPanel.tsx`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `zod` connect `apiClient.ts` to `web/package.json`, `contact.contract.ts`, `api/user.contract.ts`, `task.contract.ts`, `User.controller.ts`, `contract/package.json`, `auth.schema.ts`, `notification.contract.ts`, `backend/package.json`, `upload.contract.ts`, `lib/env.ts`, `lib/package.json`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `drizzle-zod` connect `user.table.ts` to `email.table.ts`, `employee.table.ts`, `task.table.ts`, `contactSubmission.table.ts`, `drizzle/package.json`, `emailThread.table.ts`, `db_created_at`, `address.table.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `metadata`, `TimeRangeState`, `TimeRangeFilterProps` to the rest of the system?**
  _1720 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `email.table.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08021390374331551 - nodes in this community are weakly interconnected._
- **Should `eslint-config/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05454545454545454 - nodes in this community are weakly interconnected._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
