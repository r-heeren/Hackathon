import {
  Utensils,
  Wallet,
  Repeat2,
  Users,
  Heart,
  ChartPie,
  ShieldCheck,
  Fingerprint,
} from "lucide-react";
export type MomentId =
  | "split"
  | "cash"
  | "subscriptions"
  | "goals"
  | "regret"
  | "payday"
  | "guardian"
  | "profile";
export type PersonaId = "student" | "earner" | "homeowner" | "senior";
export const personas = {
  student: {
    label: "Student / young-adult",
    name: "Jules",
    initials: "JV",
    role: "Student",
    current: 1248.5,
    savings: 2860,
    income: 950,
    defaults: ["split", "regret", "goals", "subscriptions", "profile"],
    signal: "Irregular income · renting · dining out",
  },
  earner: {
    label: "Steady earner",
    name: "Alex",
    initials: "AD",
    role: "Steady earner",
    current: 5840.72,
    savings: 18400,
    income: 3200,
    defaults: ["cash", "payday", "guardian", "subscriptions", "profile"],
    signal: "Stable salary · healthy buffer · renting",
  },
  homeowner: {
    label: "Homeowner",
    name: "Sam",
    initials: "SV",
    role: "Homeowner",
    current: 7420.35,
    savings: 24600,
    income: 3800,
    defaults: ["cash", "payday", "guardian", "subscriptions", "profile"],
    signal: "Mortgage payments · stable salary · home buffer",
  },
  senior: {
    label: "Senior",
    name: "Marie",
    initials: "MD",
    role: "Senior",
    current: 3980.2,
    savings: 32500,
    income: 1850,
    defaults: ["guardian", "subscriptions", "profile"],
    signal: "Pension income · quieter spending · extra reassurance",
  },
} as const;
export const moments = [
  {
    id: "split",
    title: "Split the bill",
    icon: Utensils,
    color: "#69d0f0",
    tag: "A little less awkward",
    description: "Good food. Good company. Fair shares.",
    amount: "€ 86.40",
    action: "Let’s split it",
    copy: {
      student:
        "Dinner at Bar Botanique? 🍝 I can split the €86.40 bill, so you don’t have to chase anyone.",
      earner:
        "Your €86.40 restaurant payment can be shared. Shall we prepare the payment requests?",
      homeowner:
        "Would you like to share your €86.40 restaurant payment? I can help calculate each person’s share.",
      senior:
        "You paid €86.40 at Bar Botanique. If you shared this meal, I can help you divide the bill. You can review everything first.",
    },
  },
  {
    id: "cash",
    title: "Idle cash",
    icon: Wallet,
    color: "#b5d9aa",
    tag: "Make room for tomorrow",
    description: "Give your spare money a purpose.",
    amount: "€ 1,200",
    action: "Explore my options",
    copy: {
      student:
        "A little spare cash can be a head start. Want to set some aside?",
      earner:
        "You have €1,200 above your usual buffer. You could move it to savings or explore investing at your own pace.",
      homeowner:
        "Your home buffer is healthy. Keep €6,000 available for home expenses, then consider setting €1,200 aside in savings.",
      senior:
        "You have money available beyond your usual expenses. We can look at a savings option together. There is no need to decide now.",
    },
  },
  {
    id: "subscriptions",
    title: "Ghost subscriptions",
    icon: Repeat2,
    color: "#cfb6ef",
    tag: "Small charges add up",
    description: "A fresh look at your recurring payments.",
    amount: "€ 179.88 / year",
    action: "Review subscriptions",
    copy: {
      student:
        "Still using StreamPlus? It’s €14.99 a month — that’s €179.88 a year. Let’s check 👀",
      earner:
        "StreamPlus costs €179.88 a year. Would you like to review this recurring payment?",
      homeowner:
        "Reviewing recurring payments could free up €179.88 a year for your home buffer.",
      senior:
        "There is a recurring payment of €14.99 to StreamPlus every month. Would you like to check whether you still need it?",
    },
  },
  {
    id: "goals",
    title: "Collaborative goals",
    icon: Users,
    color: "#ecc589",
    tag: "Better, together",
    description: "Your next adventure starts with a plan.",
    amount: "Lisbon · € 1,200",
    action: "Create a shared goal",
    copy: {
      student:
        "Lisbon with your friends? ☀️ Let’s make a shared pot and turn “someday” into September.",
      earner:
        "Plan a shared goal with a target and a deadline. I can help calculate the monthly contribution.",
      homeowner:
        "A shared goal can keep a family project on track. Set a target, then invite the people involved.",
      senior:
        "You can save towards a goal with people you trust. First, we will choose an amount and a date.",
    },
  },
  {
    id: "regret",
    title: "Regret scoring",
    icon: Heart,
    color: "#e8a5a7",
    tag: "Worth it?",
    description: "More of what matters. Less of what doesn’t.",
    amount: "€ 42.00",
    action: "Tell Kate",
    copy: {
      student:
        "Those €42 headphones — worth it, or a bit of an impulse buy? No judgment. Your answer helps me give better tips.",
      earner:
        "Was your €42 electronics purchase worthwhile? Your answer will help me tailor future spending suggestions.",
      homeowner:
        "Did your €42 electronics purchase feel worthwhile? I will use your answer to make future suggestions more relevant.",
      senior:
        "You spent €42 at an electronics shop. Were you happy with the purchase? Answering is optional.",
    },
  },
  {
    id: "payday",
    title: "Payday allocator",
    icon: ChartPie,
    color: "#80b7f0",
    tag: "A plan for your payday",
    description: "Every euro, a little more intentional.",
    amount: "Salary received",
    action: "Plan my month",
    copy: {
      student:
        "Money just landed 🙌 Let’s give it a plan, without making it complicated.",
      earner:
        "Your salary has arrived. Shall we allocate it across bills, everyday spending, savings, and a flexible buffer?",
      homeowner:
        "Your salary has arrived. Let’s reserve your mortgage and home buffer first, then plan everyday spending and savings.",
      senior:
        "Your income has arrived. We can make a simple plan for your regular bills and savings. You will confirm it before saving.",
    },
  },
  {
    id: "guardian",
    title: "Quiet Guardian",
    icon: ShieldCheck,
    color: "#a8d7c4",
    tag: "Looking out for you",
    description: "A gentle heads-up, before it becomes a worry.",
    amount: "A quick check-in",
    action: "Check with Kate",
    copy: {
      student:
        "Your buffer is a bit lower this month. Want a quick look together?",
      earner:
        "Your available buffer has decreased by €340 this month. Shall we check what changed?",
      homeowner:
        "Your home buffer has decreased by €340. Let’s review recent bills before making any changes.",
      senior:
        "Have you received a message asking you to move money to a “safe account”? Please pause. I can help you check the message and contact KBC through a trusted channel.",
    },
  },
  {
    id: "profile",
    title: "Glass Box Profile",
    icon: Fingerprint,
    color: "#b6c6ed",
    tag: "Your life. Your say.",
    description: "See what Kate thinks. Put the story right.",
    amount: "You’re in control",
    action: "Review my profile",
    copy: {
      student:
        "I think you’re saving for your first place. Am I on the right track? You know your life better than I do.",
      earner:
        "Your savings pattern suggests you may be planning to buy a home. Is that correct?",
      homeowner:
        "I understand that maintaining a home buffer is important to you. Is this still your priority?",
      senior:
        "I think keeping your savings accessible and secure is important to you. Please tell me whether that is right.",
    },
  },
] as const;
export const euro = (amount: number) =>
  new Intl.NumberFormat("en-BE", { style: "currency", currency: "EUR" }).format(
    amount,
  );
