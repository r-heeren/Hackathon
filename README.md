# Kate Moments

[Open the public app on Railway](https://hackathon-production-19c8.up.railway.app)

A KBC hackathon prototype: Kate proactively surfaces useful moments inside the familiar banking shell, then helps you take the next step in chat. All shell labels and copy are in English. Built with Next.js App Router, TypeScript, React, Tailwind CSS, and Lucide icons.

## Run

Requires Node.js 20.9 or later.

```sh
npm install
npm run dev
```

Open http://localhost:3000. `npm run build` creates a static production export in `out/`; `npm start` serves that export. `npm run typecheck` checks TypeScript.

## Personalization

1. **Who:** exactly four demo personas. Default pushes follow the brief. Student: Split, Ghost subscriptions, Goals, Regret, Profile. Steady earner and Homeowner: Idle cash, Ghost subscriptions, Payday, Guardian, Profile. Senior: Ghost subscriptions, Guardian, Profile. Every persona can discover every moment through Offerings.
2. **How:** each moment has distinct copy for all four segments. Homeowner idle-cash copy reserves a home buffer. Senior Guardian emphasizes scam checks and trusted contact channels.
3. **Learn:** per-persona feedback is stored in `localStorage` under `kate-preferences-v1`. Positive feedback raises a moment's rank by 2. Negative feedback reduces it by 5 and pauses it below -4. Dismissals persist; snoozes last 24 hours. Settings can reset a persona. Confirmed priorities, regret answers, budget categorization, goals, and budgets also persist. Quiet-hours and frequency settings are saved but no background notification scheduler exists.

Glass Box correction to Travel & experiences promotes Goals when enabled and suppresses Idle cash without changing segment defaults. Other priorities remain visible in the profile. Regret answers change subsequent chat wording; a negative purchase assessment increases reflection-tip priority. Payday bill classification is saved and displayed in the weekly overview.

## Signals

Current banking signals are **mocked**: age segment, income patterns, mortgage signals, account balances, restaurant transactions, recurring merchants, and buffer changes. New, explicit signals are push feedback, snooze/dismiss, confirmed/corrected profile priorities, purchase-value answers, bill categories, and user-entered goals/budgets. No real banking data is accessed.

## Working flows

- Split: upload a receipt or use the example → mocked line items → names and optional IBANs → equal-share review → demo payment requests.
- Payday: salary → editable buckets and custom buckets → classify an ambiguous bill → confirm a balanced plan → weekly allowance. An income-change action reopens the saved allocation for review. Changing monthly income updates the mock salary, prioritizes the Payday push, and requires a newly balanced plan.
- Profile: confirm or correct a priority; travel correction visibly changes applicable feed ranking.
- Regret: label a purchase and shape future wording.
- Subscriptions: keep, dismiss, or record cancellation intent.
- Goals: target, future deadline, participants → persisted goal and demo invitations.
- Idle cash: preview savings/investment choices; record a session-only example savings plan.
- Guardian: guided buffer or scam check, explicit confirmation, trusted-contact guidance.

Payment requests and invitations are examples: nothing is sent. Money is never moved. Receipt extraction is mocked, and uploaded files are not transmitted. Chat is scripted, not connected to an LLM. No authentication or bank APIs are present.

## Three-minute demo

1. Start as Student. Open Split, use the receipt example, review equal shares and create demo requests.
2. Give Split negative feedback. Close chat: the card disappears. It remains discoverable in Offerings.
3. Answer Regret and reopen it to see learned follow-up wording.
4. Switch to Senior: calmer copy, Guardian/Profile/Subscriptions, no Split push.
5. Switch to Homeowner: cash/home-buffer wording, Payday, Guardian.
6. Switch to Steady earner. Correct Profile to Travel & experiences: the Idle cash card is removed.

## Railway deployment

Deploy the GitHub repository `r-heeren/Hackathon`, branch `main`. Railway automatically detects the Dockerfile. The build runs `npm ci --include=dev` and `npm run build`; the runtime contains only the static export and the Node server. It runs as a non-root user and listens on `0.0.0.0` using Railway's `PORT`. The `/health` endpoint returns HTTP 200 after the exported app is present. No secrets or database are required. Set the service's Healthcheck Path to `/health` in Railway. The deprecated Config as Code format is intentionally omitted; new Railway services can no longer opt into it.

In the service's Settings → Networking, select **Generate Domain** to make the app publicly accessible over HTTPS. Repository/project visibility can stay private. Each visitor's demo learning stays in their own browser.

Run `npm run build` then `npm run test:production` to verify health, HTML, JavaScript, CSS, and HTTP method handling. For a Docker check: `docker build -t kate-moments .` then `docker run --rm -p 8080:8080 -e PORT=8080 kate-moments`.

## Submission status

Source is linked to [r-heeren/Hackathon](https://github.com/r-heeren/Hackathon) on the `main` branch. The app is deployed publicly on Railway, with automatic deployment from `main` and a `/health` readiness check. An Aikido before/after scan still requires scan access. No scan result is claimed.
