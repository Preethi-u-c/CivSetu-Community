# CivSetu Community

CivSetu is a municipal grievance portal for Lakshmeshwar TMC. Citizens can lodge and track complaints; authenticated authority officers review, assign, update, escalate, and resolve them.

## Authority directory and escalation levels

| Level | Authority / department | Officer role | Account email |
| --- | --- | --- | --- |
| Local Authority | Executive & Municipal Administration, Lakshmeshwar TMC | Chief Officer / Commissioner | `commissioner@lakshmeshwar-tmc.gov.in` |
| Local Authority | Water Supply & Maintenance Wing, Lakshmeshwar TMC | Assistant Executive Engineer | `aee.water@lakshmeshwar-tmc.gov.in` |
| Local Authority | Health & Solid Waste Management Section, Lakshmeshwar TMC | Senior Health & Sanitation Inspector | `health.sanitation@lakshmeshwar-tmc.gov.in` |
| Local Authority | Electrical & Streetlighting Wing, Lakshmeshwar TMC | Junior Engineer (Electrical) | `electrical@lakshmeshwar-tmc.gov.in` |
| Block level | Lakshmeshwar Taluk Panchayat Executive Office | Taluk Executive Officer | `eo.taluk@lakshmeshwar-tp.gov.in` |
| District Panchayat | Gadag Zilla Panchayat | Chief Executive Officer | `ceo.zp@gadag.nic.in` |
| District Administration | Office of the Deputy Commissioner, Gadag District | Deputy Commissioner & District Magistrate | `dc.gadag@karnataka.gov.in` |

Authority accounts are accessed at `/authority/dashboard`. Passwords and password hashes are intentionally not stored in this repository or this README. Provision or reset them through the administrator-controlled account process and keep them in a password manager or secret manager.

### Credential provisioning

1. An administrator creates or activates the authority account using the officer's official email address.
2. The administrator delivers a unique temporary password to the officer through a secure, separate channel (for example, an approved password manager or verified official contact).
3. The officer signs in at `/authority/dashboard` and changes the temporary password immediately.
4. Lost or compromised credentials must be reset or deactivated by an administrator; they must never be sent in email, chat, tickets, screenshots, or repository files.

Every authority account must have a unique password. Do not reuse citizen, administrator, database, SMTP, API, or other service credentials for an authority account.

## Complaint notification flow

When a citizen lodges a complaint, the portal records the citizen who owns it and sends notifications only to that citizen's registered email address. The citizen receives an in-app notification, a real-time update, and an email for:

- submission and acknowledgement;
- under review, assignment, in-progress, near-deadline, reopened, and other status updates;
- an officer's remark or request for additional information;
- escalation to each next authority level; and
- resolution, including the resolution notes.

The escalation chain is Local Authority → Block level → District Panchayat → District Administration. Every action appears in the complaint timeline.

## Email setup

Set `EMAIL_USER`, `EMAIL_PASS`, and `NEXT_PUBLIC_APP_URL` in a local, untracked environment file or deployment secret store. Do not commit `DATABASE_URL`, session secrets, API keys, OTP secrets, email credentials, or password hashes. When email credentials are absent, CivSetu logs a simulated email dispatch for local development.
