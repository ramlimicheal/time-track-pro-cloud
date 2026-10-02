# Cloud foundation changes

These changes are local. They have not been pushed, deployed, or applied to the live Lovable database.
Local environment checks do not imply that your configured Lovable deployment is broken.

## What changed

- Active routes use Supabase authentication, profiles and database roles, not browser-local identity.
- Daily time entries, history, leave, review decisions and employee contact edits use typed cloud services.
- New timesheet forms never clear saved history. Dirty timesheet forms warn before navigation or reload.
- Rejected entries can be resubmitted. Pending and approved content is locked.
- History filters drive totals and the whole printable report. React escapes names, descriptions and decisions.
- Recovery links open `/reset-password` and update actual Supabase credentials.
- Timer sessions persist across refresh and device changes. Paused sessions do not accumulate break time.
  Transitions use the database clock and version checks. The ticking display still uses the device clock.
  Timer sessions do not automatically create payable timesheets.
- Administrators can configure total annual, sick and casual entitlement by account and year.
- The forward migration adds invite-only provisioning, active-account checks, guarded role changes,
  approval/content validation, leave overlap/entitlement checks, timer RPCs and database audit events.
- Follow-up repairs remove the legacy lint errors and all reported dependency advisories.
  Hooks and style helpers live outside component modules so Fast Refresh boundaries remain valid.
- Active pages load on demand rather than sharing one oversized application chunk.
- Legacy print helpers escape names, descriptions, dates and status attributes, with regression coverage.
- Login and recovery pages have main landmarks and correctly ordered headings.

This is a **single-company foundation**, not a multi-agency Gulf manpower SaaS yet.
`profiles` currently represent application accounts, not a complete worker/deployment record.

## Local setup and checks

Use Node.js 22.12 or newer and npm. `package-lock.json` is the maintained lockfile for this pass;
the older `bun.lockb` has not been regenerated.

1. Run `npm ci`.
2. Copy `.env.example` to a local `.env` and enter your project's public URL and anon/publishable key.
   The generated Lovable client reads `VITE_SUPABASE_PUBLISHABLE_KEY`, not `VITE_SUPABASE_ANON_KEY`.
   Never put a secret/service-role key into any `VITE_` variable.
3. Run `npm run dev`. The development server is bound to loopback, not the public network.

Checks:

```text
npm test
npm run test:db
npm run typecheck
npm run lint:foundation
npm run build
npm run lint
npm audit
```

Database tests use an isolated, in-memory PGlite PostgreSQL instance with a simulated Supabase auth schema.
They replay the active migration chain and exercise authenticated row-level security, not only SQL parsing.
They also verify that an existing account and approved record survive the forward migration.
Frontend tests mock cloud responses. They do not contact live accounts.
PGlite serializes operations, so the tests do **not** prove multi-connection concurrency,
Supabase Auth invitation delivery, OAuth linking or PostgREST behavior. Verify these on staging.

CI gates typechecks, full-repository lint (including warnings), tests, builds and dependency audit.
Lint and audit are no longer optional advisory steps.

### Local validation results

- Clean lockfile installation (`npm ci --ignore-scripts`): passed.
- All 105 tests passed, including 36 PostgreSQL migration/permission tests.
  The explicit thread pool avoids an intermittent Windows fork-worker shutdown timeout.
- Both application and configuration TypeScript checks passed.
- Production builds passed with a dummy local configuration. Route splitting removed the
  previous 500 kB chunk-size warning.
- Full-repository lint: zero errors and zero warnings, down from 65 errors and 11 warnings at audit.
- Full and production-only dependency audits: zero reported vulnerabilities.
- Isolated Chromium smoke checks passed for login, expired recovery links, anonymous admin redirects,
  fresh mocked employee login, dirty timesheet navigation, reset confirmation and preserved legacy data.
  At 375 px width, the tested login and timesheet views had no horizontal overflow.
- Login and recovery accessibility scans reported zero violations. The login gradient leaves
  three contrast checks marked incomplete by axe; this is not a complete accessibility certification.
- Lockfile registry/integrity checks and Git whitespace checks passed. Generated Lovable integration
  files were not changed, and the archived migration's content matches the original.
- GitHub Actions has been added locally, not executed on GitHub. Live invitation/recovery delivery,
  Supabase/PostgREST integration and concurrent multi-device behavior still require staging validation.

## Database schema and migration history

The canonical schema is the generated Lovable daily `timesheets(user_id, work_date, ...)` schema,
with `profiles`, `user_roles`, `leave_applications`, `leave_balances`, and `audit_logs`.

`supabase/migrations/20261001223000_harden_cloud_workflows.sql` is a transactional, forward-only migration.
It does not delete existing accounts or business records, recompute historical totals, or rewrite old decisions.
It intentionally restricts future edits. It requires the existing canonical schema and original policy names.

The incompatible employee/month schema formerly at
`supabase/migrations/20251019142407_create_initial_schema.sql` is preserved unchanged under `supabase/legacy/`.
It must **not** be replayed against the canonical daily schema.
This relocation affects local migration inventory, not the live database's migration history.
Before using a linked CLI migration command, compare local and remote migration inventories.
If the remote history includes the archived version, stop and review the difference with the database owner.
Do not blindly push the migration chain, reset the database, or mark migrations reverted/applied.
Deploy only the reviewed forward migration once existing schema/history compatibility is established.

Legacy browser-local employees and `timesheet-*` records are left untouched.
They are not automatically imported into cloud records or used for authentication.
Export and reconcile them separately before retiring legacy components.

## Staging deployment order

1. Obtain approval from the database/deployment owner. Back up the database and verify restoration.
2. Inspect the actual schema, policies, migration inventory, current roles and active admin accounts.
   The migration's daily-schema guard does not replace this review.
3. Confirm at least one intended active administrator and assign another trusted administrator
   before changing access. Existing roles are retained; review any previously auto-created admins.
4. Apply the forward migration on an isolated staging copy **before** deploying the new frontend.
   New timer and role controls require its table/RPCs. The migration is not designed to run twice.
   If a statement fails, its transaction rolls back. Investigate; do not skip failed statements.
5. Configure the staging Auth site URL and allowed redirects for the exact application origins,
   including `/reset-password`. Disable public signup in Auth settings as well as the database guard.
6. Send a real administrator invitation through the trusted Lovable/Supabase auth administration
   flow with a redirect to `https://YOUR-APP/reset-password`. New invites default to employee.
   There is deliberately no service-role key or public account-creation API in the frontend.
7. Verify invite delivery, initial password setup, expired recovery links, login, logout and OAuth
   for already provisioned accounts. New OAuth identities must not bypass invite-only provisioning.
8. Configure leave entitlement totals for each relevant year in Admin > Employees > Leave entitlement.
   Check whether existing `leave_balances` values are totals or previously decremented remaining balances.
   Reconcile them before approval, because this version subtracts approved calendar-day usage.
   Cross-year paid leave requires entitlement rows for both years. No country-specific legal default is assumed.
9. Test employee/manager/admin accounts: record isolation, self-review denial, stale-tab decisions,
   rejected-entry resubmission, filtered printing, paused timer refresh and multiple devices.
   Test simultaneous approvals/timer transitions from separate connections and verify audit rows.
10. After staging succeeds, obtain explicit production approval and repeat the reviewed sequence.

For a genuinely new project with no administrator, a trusted database owner must promote one selected
invited profile using privileged administration after verifying its identity. Public signup never grants
administrator access. Do not expose a bootstrap function or server credentials in the frontend.

## Operational boundaries and remaining work

- Account invitations and disabling/deleting Auth identities require trusted external administration.
  The UI edits profiles/roles but does not invite or hard-delete accounts.
- Leave uses inclusive calendar days and whole-day UI entitlement. Public holidays, weekly rest,
  fractional leave, payroll rules and country policies need a separate, agreed implementation.
- Rejected leave is retained; a corrected request is a new application. Approved records are locked.
  Cancellation/correction of approved time or leave needs a separate audited workflow.
- Dashboard counts are actual database records, refreshed periodically, not live presence monitoring.
  Notifications are recent persisted decisions, not a delivery/read-state notification system.
- Old mock/local components remain in the tree but are not the active routed workflows.
  Do not reconnect them without migrating their schema and authorization.
- Agency isolation, workers without login accounts, trades, clients, sites, deployment contracts,
  supervisor bulk entry, client approval, billing, invoicing and compliance remain subsequent phases.
- Tested pinned upgrades: Vite 7.3.6, Vitest 4.1.11, React Router DOM 7.18.4,
  React SWC plugin 4.3.3 and Lovable tagger 1.3.5. The reported dependency audit count is now zero.
  Keep reviewing future advisories; an empty audit does not prove the application is vulnerability-free.
  Do not use `npm audit fix --force` without compatibility testing, including Lovable tooling.
