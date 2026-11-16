/**
 * Text and demo rows for the marketing page (pages/LandingPage.tsx).
 * Kept apart from the markup so copy changes don't touch layout code.
 */

import { CircleHelp, Eye, LockKeyhole, Shield } from 'lucide-react';

export const DEMO_REQUESTS = [
  { time: '14:32:08', method: 'GET', path: '/', kind: 'Human', code: '200', tone: 'human' },
  { time: '14:32:09', method: 'GET', path: '/products/summer', kind: 'Human', code: '200', tone: 'human' },
  { time: '14:32:11', method: 'POST', path: '/wp-login.php', kind: 'Attack', code: '403', tone: 'attack' },
  { time: '14:32:12', method: 'GET', path: '/robots.txt', kind: 'Bot', code: '200', tone: 'bot' },
  { time: '14:32:13', method: 'GET', path: '/cart', kind: 'Human', code: '200', tone: 'human' },
];

export const INTEGRATIONS = ['nginx', 'Apache', 'Caddy', 'IIS', 'LiteSpeed', 'Traefik', 'Node.js', 'Laravel', '.NET', 'Django', 'WordPress', 'Docker'];

export const FEATURES = [
  { n: '01', icon: Eye, title: 'See it live', desc: 'Every visit, every page, every moment — in one clear feed. No digging through confusing server logs.' },
  {
    n: '02',
    icon: CircleHelp,
    title: 'Understand it',
    desc: 'People, helpful bots, and troublemakers — explained in everyday language, not developer jargon.',
  },
  { n: '03', icon: Shield, title: 'Control it', desc: 'Block a suspicious visitor with one click. Changed your mind? Undo it just as easily.' },
  {
    n: '04',
    icon: LockKeyhole,
    title: 'Share it safely',
    desc: 'Bring your team in with the right access. Every change is recorded, so everyone stays in the loop.',
  },
];

export const CONNECTIONS = [
  {
    num: '01',
    title: 'Proxy',
    label: 'COMING SOON',
    desc: 'Point your DNS to HTTPowl. Nothing to install on your website. We sit quietly between visitors and your site.',
    code: 'your-site.com  →  HTTPowl  →  your server',
    accent: 'cyan',
  },
  {
    num: '02',
    title: 'Agent',
    label: 'FOR MORE CONTROL',
    desc: 'Add a tiny agent to your server. HTTPowl can work directly with your firewall to stop bad traffic at the door.',
    code: '$ curl -sL httpowl.net/install | sudo sh',
    accent: 'amber',
  },
  {
    num: '03',
    title: 'Plugin',
    label: 'COMING SOON',
    desc: 'Connect with a small plugin for WordPress, Laravel, Node, .NET, or Django. A few clicks and you’re in.',
    code: 'composer require httpowl/connector',
    accent: 'purple',
  },
];

export const PLANS = [
  {
    name: 'Free',
    desc: 'A safer start for one website.',
    price: '$0',
    suffix: 'forever',
    items: ['1 website', 'Live request feed', 'Plain-English daily note', 'One-click blocking'],
    action: 'Start for free',
  },
  {
    name: 'Pro',
    desc: 'For growing websites and busy owners.',
    price: 'Soon',
    suffix: 'price announced at launch',
    items: ['Everything in Free', 'Up to 5 websites', 'Real-time alerts', '90-day history', 'Team access'],
    action: 'Get early access',
    featured: true,
  },
  {
    name: 'Agency',
    desc: 'One calm dashboard for all your clients.',
    price: 'Soon',
    suffix: 'price announced at launch',
    items: ['Everything in Pro', 'Unlimited websites', 'Client-ready reports', 'Priority support', 'Change history'],
    action: 'Talk to us',
  },
];
