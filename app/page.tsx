"use client";
import { useEffect, useRef, useState } from "react";
import {
  Users,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Home,
  Layers,
  List,
  Mic,
  MoreHorizontal,
  PiggyBank,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  ThumbsDown,
  ThumbsUp,
  Upload,
  Wallet,
  X,
  Leaf,
  MapPin,
  Receipt,
  CheckCheck,
} from "lucide-react";
import { euro, moments, personas, type MomentId, type PersonaId } from "./data";
type Preference = {
  weights: Partial<Record<MomentId, number>>;
  dismissed: MomentId[];
  snoozed: Partial<Record<MomentId, number>>;
  profile?: string;
  regret?: string;
  category?: string;
  quiet?: boolean;
  frequency?: string;
  goal?: { name: string; amount: number; deadline: string; people: string };
  income?: number;
  budget?: Record<string, number>;
  requests?: string[];
};
const fresh = (): Preference => ({ weights: {}, dismissed: [], snoozed: {} });
function KateMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`kate-mark ${small ? "small" : ""}`}>
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
export default function App() {
  const [persona, setPersona] = useState<PersonaId>("student");
  const p = personas[persona];
  const [prefs, setPrefs] = useState<Partial<Record<PersonaId, Preference>>>(
    {},
  );
  const pref = prefs[persona] || fresh();
  const income = pref.income || p.income;
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("Start");
  const [active, setActive] = useState<MomentId | null>(null);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<
    "settings" | "notifications" | "accounts" | null
  >(null);
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<
    { by: "user" | "kate"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [reason, setReason] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [people, setPeople] = useState("Jules, Emma, Noah");
  const [ibans, setIbans] = useState("");
  const [goal, setGoal] = useState("Lisbon weekend");
  const [goalAmount, setGoalAmount] = useState(1200);
  const [deadline, setDeadline] = useState("2027-09-01");
  const [buckets, setBuckets] = useState<Record<string, number>>({});
  const [custom, setCustom] = useState("");
  const [cashAmount, setCashAmount] = useState(1200);
  const [profileChoice, setProfileChoice] = useState("Travel & experiences");
  const [payments, setPayments] = useState(true);
  const [search, setSearch] = useState("");
  const chatEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kate-preferences-v1");
      if (saved) setPrefs(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("kate-preferences-v1", JSON.stringify(prefs));
      } catch {}
    }
  }, [prefs, ready]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(""), 4500);
      return () => clearTimeout(t);
    }
  }, [notice]);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, step]);
  const update = (patch: Partial<Preference>) =>
    setPrefs((all) => ({
      ...all,
      [persona]: { ...(all[persona] || fresh()), ...patch },
    }));
  const open = (id: MomentId) => {
    setActive(id);
    setStep(0);
    setMessages([]);
    setInput("");
    setReason(false);
    setReceipt("");
    if (id === "split") {
      setPeople(p.name + ", Emma, Noah");
      setIbans("");
    }
    if (id === "goals" && pref.goal) {
      setGoal(pref.goal.name);
      setGoalAmount(pref.goal.amount);
      setDeadline(pref.goal.deadline);
      setPeople(pref.goal.people);
      setStep(1);
    }
    setBuckets(
      pref.budget || {
        Bills: Math.round(income * 0.4),
        "Everyday spending": Math.round(income * 0.3),
        Savings: Math.round(income * 0.2),
        Buffer:
          income -
          Math.round(income * 0.4) -
          Math.round(income * 0.3) -
          Math.round(income * 0.2),
      },
    );
    setModal(null);
  };
  const add = (user: string, kate: string) =>
    setMessages((msg) => [
      ...msg,
      { by: "user", text: user },
      { by: "kate", text: kate },
    ]);
  const feedback = (id: MomentId, useful: boolean, why?: string) => {
    const weights = {
      ...pref.weights,
      [id]: (pref.weights[id] || 0) + (useful ? 2 : -5),
    };
    update({ weights });
    setNotice(
      useful
        ? "Thanks. You’ll see more tips like this."
        : `${moments.find((m) => m.id === id)?.title} tips paused for ${p.name}. Your feedback changed your feed.`,
    );
    if (why)
      add(
        why,
        "Thank you. I have paused these tips for your profile. You can still open this feature in KBC products.",
      );
    setReason(false);
  };
  const feed = moments
    .filter(
      (m) =>
        (p.defaults as readonly string[]).includes(m.id) &&
        !pref.dismissed.includes(m.id) &&
        !(pref.snoozed[m.id] && pref.snoozed[m.id]! > Date.now()) &&
        (pref.weights[m.id] || 0) > -4 &&
        !(pref.profile === "Travel & experiences" && m.id === "cash"),
    )
    .sort(
      (a, b) =>
        (pref.weights[b.id] || 0) -
        (pref.weights[a.id] || 0) +
        (p.defaults as readonly string[]).indexOf(a.id) -
        (p.defaults as readonly string[]).indexOf(b.id) +
        (pref.profile === "Travel & experiences"
          ? (b.id === "goals" ? 3 : 0) - (a.id === "goals" ? 3 : 0)
          : 0),
    );
  useEffect(() => {
    if (!active && !modal) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(null);
        setModal(null);
      }
    };
    document.addEventListener("keydown", listener);
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", listener);
      document.body.style.overflow = before;
    };
  }, [active, modal]);
  const current = moments.find((m) => m.id === active);
  const tone = current?.copy[persona];
  const choosePersona = (id: PersonaId) => {
    setPersona(id);
    setActive(null);
    setModal(null);
    setNotice(`Kate is now personalizing for ${personas[id].name}.`);
  };
  function send() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    const match = moments.find(
      (m) =>
        text.toLowerCase().includes(m.title.toLowerCase()) ||
        text.toLowerCase().includes(m.id),
    );
    if (match) {
      open(match.id);
      return;
    }
    add(
      text,
      active === "guardian"
        ? "You can review this safely here. Never share your PIN or approve a payment at someone else’s request. Use the contact option below if you need support."
        : "I can help with your money moments. Choose one of the actions above, or ask about splitting a bill, subscriptions, savings, or your profile. This demo uses example banking data.",
    );
  }
  const nav = [
    { name: "Start", icon: Wallet },
    { name: "My KBC", icon: List },
    { name: "Investments", icon: PiggyBank },
    { name: "Offerings", icon: Layers },
  ];
  return (
    <div className="app-wrap">
      <aside className="sidebar">
        <div className="brand">
          <span className="kbc-logo">
            KBC
            <span />
          </span>
          <span>Mobile</span>
        </div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.name}
              className={tab === n.name ? "selected" : ""}
              onClick={() => {
                setTab(n.name);
                setActive(null);
              }}
            >
              <n.icon size={21} />
              {n.name}
              {tab === n.name && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="secure">
            <ShieldCheck size={17} /> Your money. Your peace of mind.
          </div>
          <span className="prototype">KBC × Kate · Concept demo</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            Your everyday, made easier <span>/</span> <strong>{tab}</strong>
          </div>
          <div className="persona-control">
            <span className="demo-label">DEMO PERSONA</span>
            <select
              aria-label="Demo persona"
              value={persona}
              onChange={(e) => choosePersona(e.target.value as PersonaId)}
            >
              {Object.entries(personas).map(([id, v]) => (
                <option value={id} key={id}>
                  {v.label}
                </option>
              ))}
            </select>
            <div className="avatar">{p.initials}</div>
          </div>
        </header>
        <main>
          <div className="main-header">
            <div>
              <div className="eyebrow">WEDNESDAY, 30 SEPTEMBER</div>
              <h1>
                {tab === "Start"
                  ? `Good evening, ${p.name}`
                  : tab === "Offerings"
                    ? "A little more possibility."
                    : tab === "My KBC"
                      ? "Your banking, together."
                      : "Make room for tomorrow."}
                <span className="hello-dot">.</span>
              </h1>
              {tab === "Start" && (
                <p className="subtitle">
                  All the everyday things. A little help along the way.
                </p>
              )}
            </div>
            <div className="header-actions">
              <button
                className="circle"
                aria-label="Settings"
                onClick={() => setModal("settings")}
              >
                <Settings size={21} />
              </button>
              <button
                className="circle bell"
                aria-label="Notifications"
                onClick={() => setModal("notifications")}
              >
                <Bell size={21} />
                {feed.length > 0 && <i />}
              </button>
              <button
                className="circle"
                aria-label="Open Kate"
                onClick={() => open(feed[0]?.id || "profile")}
              >
                <KateMark small />
              </button>
            </div>
          </div>
          <div className="search-row">
            <button
              className="kate-search"
              onClick={() => open(feed[0]?.id || "profile")}
            >
              <Search size={18} />
              <span>How can I help you?</span>
              <KateMark small />
              <strong>Kate</strong>
            </button>
            <div className="product-pills">
              <button onClick={() => setModal("accounts")}>
                <Wallet size={17} />
                Accounts
              </button>
              <button onClick={() => open("guardian")}>
                <Home size={17} />
                MyHome
              </button>
              <button onClick={() => open("goals")}>
                <MapPin size={17} />
                MyMobility
              </button>
              <button onClick={() => open("subscriptions")}>
                <RepeatIcon />
                Subscriptions
              </button>
              <button
                className="all-products"
                onClick={() => setTab("Offerings")}
              >
                All products <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
          {(tab === "Start" || tab === "My KBC") && (
            <>
              <div className="banking-grid">
                <section className="accounts-section">
                  <div className="section-heading">
                    <h2>Your accounts</h2>
                    <button
                      className="text-button"
                      onClick={() => setModal("accounts")}
                    >
                      Manage <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="accounts">
                    <button
                      className="account"
                      onClick={() => setModal("accounts")}
                    >
                      <div className="account-art">
                        <Wallet size={48} strokeWidth={1.3} />
                        <span className="account-type">EVERYDAY</span>
                        <span className="art-orb" />
                      </div>
                      <div className="account-info">
                        <span>
                          Current account <ArrowUpRight size={17} />
                        </span>
                        <strong>{euro(p.current)}</strong>
                        <small>BE •••• 4821</small>
                        <div className="account-line" />
                      </div>
                    </button>
                    <button
                      className="account savings"
                      onClick={() => setModal("accounts")}
                    >
                      <div className="account-art">
                        <PiggyBank size={51} strokeWidth={1.3} />
                        <span className="account-type">FOR LATER</span>
                        <span className="art-orb" />
                      </div>
                      <div className="account-info">
                        <span>
                          Savings account <ArrowUpRight size={17} />
                        </span>
                        <strong>{euro(p.savings)}</strong>
                        <small>BE •••• 7906</small>
                        <div className="account-line" />
                      </div>
                    </button>
                  </div>
                </section>
                <section className="payments">
                  <div className="section-heading">
                    <h2>Recent activity</h2>
                    <button
                      className="icon-plain"
                      aria-label="Toggle payments"
                      onClick={() => setPayments(!payments)}
                    >
                      <MoreHorizontal size={22} />
                    </button>
                  </div>
                  {payments ? (
                    <>
                      <button
                        className="transaction"
                        onClick={() => open("split")}
                      >
                        <span className="transaction-icon">
                          <UtensilsIcon />
                        </span>
                        <div>
                          <strong>Bar Botanique</strong>
                          <small>Today · Food & drinks</small>
                        </div>
                        <span>− €86.40</span>
                      </button>
                      <button
                        className="transaction"
                        onClick={() => open("subscriptions")}
                      >
                        <span className="transaction-icon purple">
                          <Layers size={19} />
                        </span>
                        <div>
                          <strong>StreamPlus</strong>
                          <small>Yesterday · Subscription</small>
                        </div>
                        <span>− €14.99</span>
                      </button>
                      <button
                        className="transaction"
                        onClick={() => open("payday")}
                      >
                        <span className="transaction-icon green">
                          <ArrowLeft size={19} />
                        </span>
                        <div>
                          <strong>
                            {persona === "senior"
                              ? "Pension payment"
                              : persona === "student"
                                ? "Monthly allowance"
                                : "Salary payment"}
                          </strong>
                          <small>28 Sep · Income</small>
                        </div>
                        <span className="positive">+ {euro(income)}</span>
                      </button>
                      <button
                        className="text-button activity-link"
                        onClick={() => setModal("accounts")}
                      >
                        View all activity <ArrowRight size={15} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="text-button"
                      onClick={() => setPayments(true)}
                    >
                      Show payments
                    </button>
                  )}
                </section>
              </div>
              {tab === "Start" && (
                <section className="for-you">
                  <div className="section-heading">
                    <div className="heading-with-badge">
                      <h2>For you</h2>
                      <span className="pill-badge">A LITTLE AHEAD</span>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setModal("notifications")}
                    >
                      All messages <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="feed-intro">
                    <KateMark small />
                    <span>A few things I thought you’d like to know.</span>
                    <span className="personalized">
                      <span />
                      Personalized for you
                    </span>
                  </div>
                  <div className="moment-grid">
                    {feed.map((m, index) => (
                      <article
                        className={`moment-card ${index === 0 ? "featured" : ""}`}
                        key={m.id}
                      >
                        <div className="moment-card-top">
                          <span
                            className="moment-symbol"
                            style={{
                              color: m.color,
                              background: `${m.color}14`,
                            }}
                          >
                            <m.icon size={23} strokeWidth={1.5} />
                          </span>
                          <span className="kate-tip">
                            <KateMark small />
                            Kate tip
                          </span>
                          <div className="card-controls">
                            <button
                              aria-label={`Snooze ${m.title}`}
                              title="Snooze for 24 hours"
                              onClick={() => {
                                update({
                                  snoozed: {
                                    ...pref.snoozed,
                                    [m.id]: Date.now() + 86400000,
                                  },
                                });
                                setNotice("Snoozed for 24 hours.");
                              }}
                            >
                              <Clock size={14} />
                            </button>
                            <button
                              aria-label={`Dismiss ${m.title}`}
                              onClick={() => {
                                update({
                                  dismissed: [...pref.dismissed, m.id],
                                });
                                setNotice(
                                  "Dismissed. You can still find it in KBC products.",
                                );
                              }}
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                        <button
                          className="moment-main"
                          onClick={() => open(m.id)}
                        >
                          <span className="moment-tag">{m.tag}</span>
                          <h3>{m.title}</h3>
                          <p>
                            {m.id === "goals" && pref.goal
                              ? `${pref.goal.name}: €0 of ${euro(pref.goal.amount)} saved. Your deadline is ${pref.goal.deadline}. Shall we check your shared plan?`
                              : m.id === "profile" && pref.profile
                                ? `Your confirmed priority is ${pref.profile}. You can review or change it any time.`
                                : m.copy[persona]}
                          </p>
                          <span className="moment-cta">
                            {m.action}
                            <ArrowRight size={17} />
                          </span>
                        </button>
                        <div className="card-feedback">
                          <span>Useful for you?</span>
                          <button
                            aria-label={`Useful ${m.title}`}
                            onClick={() => feedback(m.id, true)}
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            aria-label={`Not useful ${m.title}`}
                            onClick={() => feedback(m.id, false)}
                          >
                            <ThumbsDown size={14} />
                          </button>
                          <span className="moment-amount">{m.amount}</span>
                        </div>
                      </article>
                    ))}
                    {!feed.length && (
                      <div className="empty-feed">
                        <KateMark />
                        <h3>You’re all caught up.</h3>
                        <p>
                          Your feedback has quieted these tips. All moments are
                          still in Offerings.
                        </p>
                        <button
                          className="primary"
                          onClick={() => setTab("Offerings")}
                        >
                          Explore moments
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="learning-note">
                    <SlidersHorizontal size={15} />
                    <span>
                      Kate learns from what you tell her.{" "}
                      <button onClick={() => open("profile")}>
                        You’re always in control.
                      </button>
                    </span>
                  </div>
                </section>
              )}
              {tab === "My KBC" && (
                <section className="profile-summary">
                  <h2>Your preferences</h2>
                  <p>{pref.profile || p.signal}</p>
                  <button className="primary" onClick={() => open("profile")}>
                    Review with Kate
                  </button>
                </section>
              )}
            </>
          )}
          {tab === "Offerings" && (
            <>
              <div className="section-heading">
                <h2>Your favorites</h2>
                <button
                  className="icon-plain"
                  aria-label="Edit favorites"
                  onClick={() =>
                    setNotice("Choose any product below to explore it.")
                  }
                >
                  <MoreHorizontal />
                </button>
              </div>
              <div className="favorites">
                <button onClick={() => open("goals")}>
                  <span className="favorite-icon">
                    <MapPin />
                  </span>
                  MyMobility
                </button>
                <button onClick={() => open("profile")}>
                  <span className="favorite-icon add">
                    <Plus />
                  </span>
                  Add a favorite
                </button>
              </div>
              <div className="promo">
                <div>
                  <span className="eyebrow">A LITTLE AHEAD OF LIFE</span>
                  <h2>Your plans deserve a head start.</h2>
                  <p>A shared goal. A smarter payday. Kate’s here to help.</p>
                  <button className="primary" onClick={() => open("goals")}>
                    Make a plan <ArrowRight size={17} />
                  </button>
                </div>
                <div className="promo-art">
                  <KateMark />
                  <span className="orbit one" />
                  <span className="orbit two" />
                </div>
              </div>
              <div className="section-heading">
                <h2>KBC products</h2>
                <span className="muted">Every moment, for everyone</span>
              </div>
              <div className="offering-grid">
                {moments.map((m) => (
                  <button
                    className="product-tile"
                    key={m.id}
                    onClick={() => open(m.id)}
                  >
                    <m.icon size={34} strokeWidth={1.3} />
                    <strong>{m.title}</strong>
                    <small>{m.description}</small>
                    <ArrowUpRight className="tile-arrow" size={17} />
                  </button>
                ))}
              </div>
              <div className="section-heading themes-heading">
                <h2>Themes</h2>
                <button
                  className="text-button"
                  onClick={() => setNotice("Explore a theme below.")}
                >
                  Show all
                </button>
              </div>
              <div className="theme-grid">
                {[
                  { name: "MyMobility", icon: MapPin, id: "goals" },
                  { name: "MyHome", icon: Home, id: "cash" },
                  { name: "A greener future", icon: Leaf, id: "payday" },
                  { name: "Peace of mind", icon: ShieldCheck, id: "guardian" },
                ].map((t) => (
                  <button key={t.name} onClick={() => open(t.id as MomentId)}>
                    <span>
                      <t.icon size={27} />
                    </span>
                    {t.name}
                  </button>
                ))}
              </div>
            </>
          )}
          {tab === "Investments" && (
            <section className="investment-view">
              <div className="investment-icon">
                <PiggyBank size={64} strokeWidth={1} />
              </div>
              <h2>A next step that fits your life.</h2>
              <p>
                {persona === "homeowner"
                  ? "Your home buffer comes first. Explore what to do with money above that buffer."
                  : "Start with your buffer, your plans, and a pace you’re comfortable with."}
              </p>
              <button className="primary" onClick={() => open("cash")}>
                Explore with Kate <ArrowRight size={18} />
              </button>
              <p className="muted">
                Example options only. No real investments are made.
              </p>
            </section>
          )}
          <footer className="page-footer">
            <span className="kbc-wordmark">KBC</span>
            <span>A little ahead of life.</span>
            <span className="footer-demo">Prototype · Example data</span>
          </footer>
        </main>
      </div>
      <nav className="bottom-nav">
        {nav.map((n) => (
          <button
            key={n.name}
            className={tab === n.name ? "selected" : ""}
            onClick={() => {
              setTab(n.name);
              setActive(null);
            }}
          >
            <n.icon size={21} />
            <span>{n.name}</span>
          </button>
        ))}
      </nav>
      {active && current && (
        <div className="chat-overlay" onClick={() => setActive(null)}>
          <section
            className="chat-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Kate chat"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="chat-header">
              <button
                className="circle"
                aria-label="Back"
                onClick={() => setActive(null)}
              >
                <ArrowLeft size={22} />
              </button>
              <div>
                <KateMark small />
                <strong>Kate</strong>
                <span>Here for you</span>
              </div>
              <button
                className="circle"
                aria-label="Close Kate"
                onClick={() => setActive(null)}
              >
                <X size={22} />
              </button>
            </header>
            <div className="chat-scroll">
              <div className="chat-date">
                Today <span>Your personal assistant</span>
              </div>
              <div className="chat-topic">
                <current.icon size={19} />
                {current.title}
              </div>
              <div className="kate-message">
                <KateMark small />
                <p>
                  {persona === "student"
                    ? `Hey ${p.name} 👋`
                    : `Hello ${p.name}.`}{" "}
                  {tone}
                  {active === "regret" &&
                    pref.regret &&
                    ` Last time you said “${pref.regret}”, so I’ll keep that in mind.`}
                  {active === "profile" &&
                    pref.profile &&
                    ` Your saved priority is ${pref.profile}.`}
                </p>
              </div>
              {active === "split" && (
                <div className="flow-box">
                  {step === 0 ? (
                    <>
                      <h3>Let’s start with the receipt.</h3>
                      <p>
                        Upload a receipt, or try the example from Bar Botanique.
                      </p>
                      <label className="upload">
                        <Upload size={23} />
                        {receipt || "Choose a receipt"}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          aria-label="Upload receipt"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setReceipt(file.name);
                              setStep(1);
                              add(
                                `Receipt: ${file.name}`,
                                "I’ve prepared sample line items. Receipt extraction is mocked in this demo; review them before continuing.",
                              );
                            }
                          }}
                        />
                      </label>
                      <button
                        className="primary"
                        onClick={() => {
                          setReceipt("Bar Botanique sample");
                          setStep(1);
                          add(
                            "Use an example receipt",
                            "Here are the sample items. Let’s check the total together.",
                          );
                        }}
                      >
                        Use example receipt <ArrowRight size={16} />
                      </button>
                      <small>Demo receipt extraction · No real OCR</small>
                    </>
                  ) : step === 1 ? (
                    <>
                      <h3>Bar Botanique</h3>
                      {[
                        ["Pasta × 3", "€ 54.00"],
                        ["Drinks × 3", "€ 24.90"],
                        ["Dessert", "€ 7.50"],
                      ].map(([label, value]) => (
                        <div className="line-item" key={label}>
                          <span>{label}</span>
                          <span>{value}</span>
                        </div>
                      ))}
                      <div className="line-item total">
                        <strong>Total</strong>
                        <strong>€ 86.40</strong>
                      </div>
                      <label>
                        Who’s splitting?
                        <input
                          value={people}
                          onChange={(e) => setPeople(e.target.value)}
                          placeholder="Names, separated by commas"
                        />
                      </label>
                      <label>
                        IBANs (optional)
                        <textarea
                          value={ibans}
                          onChange={(e) => setIbans(e.target.value)}
                          placeholder="Add one IBAN per person if you know it"
                        />
                      </label>
                      <p>
                        Split equally between{" "}
                        {people.split(",").filter((s) => s.trim()).length || 1}{" "}
                        people:{" "}
                        <strong>
                          {euro(
                            86.4 /
                              (people.split(",").filter((s) => s.trim())
                                .length || 1),
                          )}{" "}
                          each
                        </strong>
                      </p>
                      <button
                        className="primary"
                        disabled={!people.trim()}
                        onClick={() => setStep(2)}
                      >
                        Review requests <ArrowRight size={16} />
                      </button>
                    </>
                  ) : step === 2 ? (
                    <>
                      <h3>Everything look right?</h3>
                      <p>You paid €86.40. Equal shares:</p>
                      {people
                        .split(",")
                        .filter((s) => s.trim())
                        .map((name, i) => (
                          <div className="line-item" key={i}>
                            <span>
                              {name.trim()}
                              <small>
                                {ibans.split("\n")[i] || "Payment link"}
                              </small>
                            </span>
                            <strong>
                              {euro(
                                86.4 /
                                  people.split(",").filter((s) => s.trim())
                                    .length,
                              )}
                            </strong>
                          </div>
                        ))}
                      <button
                        className="primary"
                        onClick={() => {
                          setStep(3);
                          update({
                            requests: people
                              .split(",")
                              .filter((s) => s.trim() && s.trim() !== p.name),
                          });
                          add(
                            "Create payment requests",
                            "Done. Your demo payment requests are ready. No money has moved and no messages have been sent.",
                          );
                        }}
                      >
                        Create demo requests <Check size={17} />
                      </button>
                    </>
                  ) : (
                    <div className="success">
                      <CheckCheck size={38} />
                      <h3>All squared up.</h3>
                      <p>
                        {pref.requests?.length} demo payment requests created.
                      </p>
                      <button
                        className="outline"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              (pref.requests || [])
                                .map(
                                  (name, i) =>
                                    `${name}: https://kate.example/demo-request/botanique-${i + 1}`,
                                )
                                .join("\n"),
                            );
                            setNotice("Demo payment links copied.");
                          } catch {
                            setNotice(
                              "Clipboard unavailable. Your requests are saved in this demo.",
                            );
                          }
                        }}
                      >
                        Copy demo links
                      </button>
                    </div>
                  )}
                </div>
              )}
              {active === "payday" && (
                <div className="flow-box">
                  <h3>
                    {step === 2
                      ? "Your week, with a plan."
                      : "Your monthly money plan"}
                  </h3>
                  <p>
                    {euro(income)} received ·{" "}
                    {persona === "homeowner"
                      ? "Mortgage and home expenses are reserved in Bills."
                      : "Adjust the buckets to fit your life."}
                  </p>
                  {step < 2 ? (
                    <>
                      <label>
                        Monthly income (€)
                        <input
                          type="number"
                          min="1"
                          value={income}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            if (value > 0) {
                              update({
                                income: value,
                                weights: { ...pref.weights, payday: 3 },
                              });
                            }
                          }}
                        />
                      </label>
                      <div className="budget-total">
                        {euro(
                          Object.values(buckets).reduce((a, b) => a + b, 0),
                        )}{" "}
                        <span>of {euro(income)} allocated</span>
                      </div>
                      {Object.entries(buckets).map(([name, value]) => (
                        <label className="budget-row" key={name}>
                          <span>{name}</span>
                          <input
                            aria-label={`${name} budget`}
                            type="number"
                            min="0"
                            value={value}
                            onChange={(e) =>
                              setBuckets({
                                ...buckets,
                                [name]: Math.max(0, Number(e.target.value)),
                              })
                            }
                          />
                        </label>
                      ))}
                      <div className="inline-field">
                        <input
                          placeholder="Custom bucket name"
                          aria-label="Custom bucket name"
                          value={custom}
                          onChange={(e) => setCustom(e.target.value)}
                        />
                        <button
                          className="circle"
                          aria-label="Add bucket"
                          disabled={!custom.trim() || custom.trim() in buckets}
                          onClick={() => {
                            setBuckets({ ...buckets, [custom.trim()]: 0 });
                            setCustom("");
                          }}
                        >
                          <Plus size={19} />
                        </button>
                      </div>
                      <div className="category-check">
                        <strong>
                          Help me learn: where does the €38.50 “Luminus” bill
                          go?
                        </strong>
                        <div className="chips">
                          {["Bills", "Everyday spending", "Other"].map((c) => (
                            <button
                              className={pref.category === c ? "chosen" : ""}
                              key={c}
                              onClick={() => {
                                update({ category: c });
                                setNotice(`Luminus learned as ${c}.`);
                              }}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                      {Object.values(buckets).reduce((a, b) => a + b, 0) !==
                        income && (
                        <p className="validation">
                          Allocate exactly {euro(income)} before saving.
                        </p>
                      )}
                      <button
                        className="primary"
                        disabled={
                          Object.values(buckets).reduce((a, b) => a + b, 0) !==
                          income
                        }
                        onClick={() => {
                          update({ budget: buckets });
                          setStep(2);
                          add(
                            "Confirm my budget",
                            "Your monthly plan is saved. These are planning buckets; no money has moved.",
                          );
                        }}
                      >
                        Confirm my plan <Check size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="line-item">
                        <span>Everyday weekly allowance</span>
                        <strong>
                          {euro((buckets["Everyday spending"] || 0) / 4)}
                        </strong>
                      </div>
                      {Object.entries(buckets).map(([n, v]) => (
                        <div className="line-item" key={n}>
                          <span>{n}</span>
                          <strong>{euro(v)}</strong>
                        </div>
                      ))}
                      <p className="muted">
                        Learned bill category: {pref.category || "Not yet set"}
                      </p>
                      <button
                        className="outline"
                        onClick={() => {
                          setStep(0);
                          add(
                            "My income has changed",
                            "Let’s update the allocation. Your saved plan is prefilled; adjust the amounts before confirming.",
                          );
                        }}
                      >
                        Review after an income change
                      </button>
                    </>
                  )}
                </div>
              )}
              {active === "profile" && (
                <div className="flow-box">
                  <h3>Here’s what I understand.</h3>
                  <div className="profile-insight">
                    <FingerprintIcon />
                    <strong>
                      {pref.profile ||
                        (persona === "student" || persona === "earner"
                          ? "Saving for a first home"
                          : persona === "homeowner"
                            ? "Protecting a home buffer"
                            : "Keeping savings safe and accessible")}
                    </strong>
                    <small>
                      Based on example banking patterns · You can correct this
                    </small>
                  </div>
                  <p className="muted">Signals: {p.signal}</p>
                  <button
                    className="primary"
                    onClick={() => {
                      update({
                        profile:
                          pref.profile ||
                          (persona === "homeowner"
                            ? "Home & buffer"
                            : persona === "senior"
                              ? "Security & access"
                              : "First home"),
                      });
                      add(
                        "That’s right",
                        "Thank you for confirming. I will prioritize this goal when choosing your suggestions.",
                      );
                      setNotice("Your confirmed priority is saved.");
                    }}
                  >
                    That’s right <Check size={17} />
                  </button>
                  <label>
                    Actually, my priority is
                    <select
                      value={profileChoice}
                      onChange={(e) => setProfileChoice(e.target.value)}
                    >
                      {[
                        "Travel & experiences",
                        "Home & buffer",
                        "First home",
                        "Security & access",
                        "Everyday balance",
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="outline"
                    onClick={() => {
                      update({ profile: profileChoice });
                      add(
                        `My priority is ${profileChoice}`,
                        `Thanks for putting me right. Your priority is now ${profileChoice}. ${profileChoice === "Travel & experiences" ? "Shared goals move up when enabled, and idle-cash pushes are held back." : "I will use your confirmed priority when planning future suggestions."}`,
                      );
                      setNotice(
                        "Profile corrected. Your feed has been updated.",
                      );
                    }}
                  >
                    Correct my profile
                  </button>
                </div>
              )}
              {active === "regret" && (
                <div className="flow-box">
                  <h3>How did this purchase feel?</h3>
                  <div className="purchase">
                    <span>Soundlab · Headphones</span>
                    <strong>€ 42.00</strong>
                  </div>
                  <div className="chips vertical">
                    {["Worth every euro", "An impulse buy", "Not worth it"].map(
                      (v) => (
                        <button
                          className={pref.regret === v ? "chosen" : ""}
                          key={v}
                          onClick={() => {
                            update({
                              regret: v,
                              weights: {
                                ...pref.weights,
                                regret:
                                  (pref.weights.regret || 0) +
                                  (v === "Worth every euro" ? 1 : 2),
                              },
                            });
                            add(
                              v,
                              v === "Worth every euro"
                                ? "Got it. I’ll focus on what you value, rather than treating every purchase as something to cut."
                                : "Thanks for being honest. I’ll offer gentle pause-and-reflect reminders for similar purchases.",
                            );
                            setNotice(
                              "Your answer is saved. Kate’s follow-up style has changed.",
                            );
                          }}
                        >
                          {v}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
              {active === "subscriptions" && (
                <div className="flow-box">
                  <h3>A closer look at StreamPlus</h3>
                  <div className="purchase">
                    <span>€14.99 monthly</span>
                    <strong>€179.88 / year</strong>
                  </div>
                  <p>
                    Recurring charge detected on the 29th. We don’t know whether
                    you use this service.
                  </p>
                  <div className="chips vertical">
                    {[
                      "Keep it — I use it",
                      "Dismiss this suggestion",
                      "I want to cancel",
                    ].map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          if (v !== "I want to cancel")
                            update({
                              dismissed: [...pref.dismissed, "subscriptions"],
                            });
                          setStep(v === "I want to cancel" ? 1 : 2);
                          add(
                            v,
                            v === "I want to cancel"
                              ? "Your cancellation intent is saved for this session. Open your StreamPlus account and choose Manage subscription to cancel directly. Kate cannot cancel it for you."
                              : "Understood. I have removed this subscription tip from your feed.",
                          );
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  {step === 1 && (
                    <div className="confirmation">
                      <Check size={17} />
                      Cancellation intent recorded. No subscription was
                      cancelled.
                    </div>
                  )}
                </div>
              )}
              {active === "cash" && (
                <div className="flow-box">
                  <h3>
                    {persona === "homeowner"
                      ? "Keep your home buffer comfortable."
                      : "A little more purpose for your money."}
                  </h3>
                  <label>
                    Amount to plan for
                    <input
                      type="number"
                      min="1"
                      max={p.current}
                      value={cashAmount}
                      onChange={(e) => setCashAmount(Number(e.target.value))}
                    />
                  </label>
                  <div className="chips vertical">
                    <button
                      disabled={cashAmount <= 0 || cashAmount > p.current}
                      onClick={() => {
                        setStep(1);
                        add(
                          `Plan ${euro(cashAmount)} for savings`,
                          `Your savings plan for ${euro(cashAmount)} is recorded for this session. Your account balances are unchanged; no transfer has been made.`,
                        );
                      }}
                    >
                      Park in savings <PiggyBank size={19} />
                    </button>
                    <button
                      onClick={() => {
                        setStep(2);
                        add(
                          "Explore investing",
                          "Before investing, consider your buffer, time horizon, and whether you are comfortable with losses. This demo does not recommend or purchase investments.",
                        );
                      }}
                    >
                      Explore investing <ArrowUpRight size={17} />
                    </button>
                  </div>
                  {step > 0 && (
                    <p className="confirmation">
                      <Check size={17} />
                      Example plan only. No real money movement.
                    </p>
                  )}
                </div>
              )}
              {active === "goals" && (
                <div className="flow-box">
                  <h3>
                    {pref.goal
                      ? "Your shared goal"
                      : "Something to look forward to."}
                  </h3>
                  {step === 0 ? (
                    <>
                      <label>
                        Goal name
                        <input
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                        />
                      </label>
                      <label>
                        Target amount (€)
                        <input
                          type="number"
                          min="1"
                          value={goalAmount}
                          onChange={(e) =>
                            setGoalAmount(Number(e.target.value))
                          }
                        />
                      </label>
                      <label>
                        Deadline
                        <input
                          type="date"
                          min="2026-10-01"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                        />
                      </label>
                      <label>
                        Invite people (names)
                        <input
                          value={people}
                          onChange={(e) => setPeople(e.target.value)}
                        />
                      </label>
                      <button
                        className="primary"
                        disabled={
                          !goal.trim() ||
                          goalAmount <= 0 ||
                          deadline <= "2026-09-30" ||
                          !people.trim()
                        }
                        onClick={() => {
                          update({
                            goal: {
                              name: goal,
                              amount: goalAmount,
                              deadline,
                              people,
                            },
                          });
                          setStep(1);
                          add(
                            "Create my shared goal",
                            "Your shared goal is saved. Demo invitations are prepared; no messages are sent. I’ll include progress reminders in your For you feed.",
                          );
                        }}
                      >
                        Create demo goal <Users size={17} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="goal-progress">
                        <span>{pref.goal?.name}</span>
                        <strong>
                          {euro(0)}{" "}
                          <small>of {euro(pref.goal?.amount || 0)}</small>
                        </strong>
                        <div />
                        <p>
                          Deadline: {pref.goal?.deadline} · {pref.goal?.people}
                        </p>
                      </div>
                      <button
                        className="outline"
                        onClick={() => {
                          setStep(0);
                          setNotice("You can update the target and deadline.");
                        }}
                      >
                        Edit goal
                      </button>
                    </>
                  )}
                </div>
              )}
              {active === "guardian" && (
                <div className="flow-box">
                  <h3>
                    {persona === "senior"
                      ? "Let’s take this one step at a time."
                      : "A small check-in."}
                  </h3>
                  <p>
                    {persona === "senior"
                      ? "KBC will never ask you to transfer money to a “safe account”. Do not share your PIN."
                      : "A recent €340 increase in household spending reduced your usual buffer. Review the payments before changing your plan."}
                  </p>
                  <div className="chips vertical">
                    <button
                      onClick={() =>
                        add(
                          "Help me check",
                          persona === "senior"
                            ? "First, stop replying to the sender. Next, contact KBC using the number in your banking app or on your bank card. Do not use a number from the suspicious message."
                            : "The main changes are an energy bill of €210 and household purchases of €130. Are these expected? If so, we can review your next payday plan.",
                        )
                      }
                    >
                      Help me check <ShieldCheck size={18} />
                    </button>
                    <button
                      onClick={() =>
                        add(
                          "These payments are expected",
                          "Thank you for confirming. I’ll remember that you reviewed this check-in. Nothing has been changed in your accounts.",
                        )
                      }
                    >
                      I’ve checked — everything is okay
                    </button>
                    <button
                      onClick={() =>
                        add(
                          "Contact KBC",
                          "In the real app, use KBC Live or the number on your bank card. This prototype cannot place calls.",
                        )
                      }
                    >
                      Contact KBC Live
                    </button>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.by === "user" ? "user-message" : "kate-message"}
                >
                  {m.by === "kate" && <KateMark small />}
                  <p>{m.text}</p>
                </div>
              ))}
              <div className="chat-feedback">
                <strong>Was this notification useful?</strong>
                <p>Your answer helps me choose what to send next.</p>
                <div className="chips">
                  <button
                    onClick={() => {
                      feedback(active, true);
                      add(
                        "Yes, useful",
                        "Thank you. I’ll prioritize more tips like this.",
                      );
                    }}
                  >
                    <ThumbsUp size={15} />
                    Yes, useful
                  </button>
                  <button onClick={() => setReason(true)}>
                    <ThumbsDown size={15} />
                    Not really
                  </button>
                </div>
                {reason && (
                  <div className="chips reasons">
                    {["Too often", "Wrong moment", "Not relevant"].map((r) => (
                      <button
                        key={r}
                        onClick={() => feedback(active, false, r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div ref={chatEnd} />
            </div>
            <form
              className="chat-compose"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <input
                placeholder="Ask Kate a question"
                aria-label="Ask Kate a question"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="button"
                className="mic"
                aria-label="Voice input"
                onClick={() =>
                  setNotice(
                    "Voice input is not connected in this prototype. You can type your question.",
                  )
                }
              >
                <Mic size={21} />
              </button>
              <button
                type="submit"
                className="send"
                aria-label="Send message"
                disabled={!input.trim()}
              >
                <Send size={18} />
              </button>
            </form>
            <div className="chat-disclaimer">
              Kate concept demo · No real banking actions
            </div>
          </section>
        </div>
      )}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Banking details"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="circle modal-close"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <X size={20} />
            </button>
            {modal === "settings" ? (
              <>
                <h2>You decide what comes through.</h2>
                <p>Notification preferences for {p.name}</p>
                <label className="switch-label">
                  Quiet hours: 22:00–08:00
                  <input
                    type="checkbox"
                    checked={!!pref.quiet}
                    onChange={(e) => update({ quiet: e.target.checked })}
                  />
                </label>
                <label>
                  Notification frequency
                  <select
                    value={pref.frequency || "As moments happen"}
                    onChange={(e) => update({ frequency: e.target.value })}
                  >
                    <option>As moments happen</option>
                    <option>Daily digest</option>
                    <option>Weekly digest</option>
                  </select>
                </label>
                <p className="muted">
                  Saved locally for this persona. This demo has no background
                  notification service.
                </p>
                <button
                  className="outline"
                  onClick={() => {
                    setPrefs((all) => ({ ...all, [persona]: fresh() }));
                    setNotice(`Learning reset for ${p.name}.`);
                    setModal(null);
                  }}
                >
                  Reset this persona’s learning
                </button>
              </>
            ) : modal === "notifications" ? (
              <>
                <h2>Your Kate messages</h2>
                <p>Personalized for {p.name}</p>
                {feed.map((m) => (
                  <button
                    className="notification-row"
                    key={m.id}
                    onClick={() => open(m.id)}
                  >
                    <m.icon size={22} />
                    <span>
                      <strong>{m.title}</strong>
                      <small>{m.tag}</small>
                    </span>
                    <ChevronRight size={19} />
                  </button>
                ))}
                {!feed.length && (
                  <p>No new messages. Explore all moments in Offerings.</p>
                )}
              </>
            ) : (
              <>
                <h2>Your accounts</h2>
                <p>Example account details for {p.name}</p>
                <div className="line-item">
                  <span>Current · BE •••• 4821</span>
                  <strong>{euro(p.current)}</strong>
                </div>
                <div className="line-item">
                  <span>Savings · BE •••• 7906</span>
                  <strong>{euro(p.savings)}</strong>
                </div>
                <h3>Recent payments</h3>
                {[
                  "Bar Botanique · − €86.40",
                  "StreamPlus · − €14.99",
                  `Income · + ${euro(income)}`,
                ].map((t) => (
                  <p className="line-item" key={t}>
                    {t}
                  </p>
                ))}
                <button className="primary" onClick={() => open("payday")}>
                  Plan with Kate
                </button>
              </>
            )}
          </section>
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
          <button aria-label="Dismiss message" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function UtensilsIcon() {
  const Icon = moments[0].icon;
  return <Icon size={20} />;
}
function RepeatIcon() {
  const Icon = moments[2].icon;
  return <Icon size={17} />;
}
function FingerprintIcon() {
  const Icon = moments[7].icon;
  return <Icon size={30} />;
}
