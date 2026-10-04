# Application shell — Step 9

The shared protected layout now provides a desktop sidebar, compact mobile
navigation, account disclosure, skip link, and main content region.

| Destination | Route | Current content |
| --- | --- | --- |
| Map | `/app` | Welcome and clearly labeled map placeholder |
| Trips | `/app/trips` | Trip collection placeholder |
| Dashboard | `/app/dashboard` | Statistics placeholder |

No trip queries, fabricated statistics, map library, or CRUD are introduced.
Existing login/signup redirects still land at `/app`. Every destination verifies
identity in its server page, in addition to the layout and proxy checks.

`features/navigation/components/application-shell.tsx` composes navigation and
account controls. Only active-link detection and the account disclosure need
client behavior. The server passes a bounded name and email from the verified
Auth user, never session tokens. The welcome page still reads/provisions the
profile through RLS. A future profile editor should synchronize the displayed
name in Auth metadata or supply a canonical profile name to the shell.

Navigation appears once in the DOM and switches at 1024px from a horizontal
three-column row to a sidebar. Active destinations use `aria-current="page"`;
Trips and Dashboard also match their future child routes. Controls retain the
design system's focus styles and at least 44px touch targets.

The account control is a native disclosure, not an ARIA menu: Tab and Enter work
normally, Escape closes it and returns focus, and clicking outside dismisses it.
It shows only the current account's name/email and the existing sign-out action.
The shell owns the sole main landmark; page content uses sections.

## Verification

`npm run test:auth` includes shell navigation at 375px, 768px, and 1440px,
active links, overflow checks, account keyboard/outside-click behavior, and
signed-out redirects on both new routes. Existing auth tests exercise logout
from the new account control. The pending hosted email-callback verification
from Step 8 remains documented in [authentication.md](authentication.md).
