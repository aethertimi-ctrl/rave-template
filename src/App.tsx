import { KeyboardEvent, useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Disc3,
  Mail,
  MapPin,
  Menu,
  Moon,
  Music2,
  Radio,
  Sparkles,
  Sun,
  Ticket,
  X,
} from 'lucide-react';
import Countdown from './Countdown';
import eniobanke from './assets/sponsors/eniobanke.png';
import adekola from './assets/sponsors/adekola.png';
import dolikin from './assets/sponsors/dolikin.png';
import mt from './assets/sponsors/mt.png';
import airpath from './assets/sponsors/airpath.png';
import leoAutos from './assets/sponsors/leo-autos.png';
import crest from './assets/sponsors/crest.png';
import jk from './assets/sponsors/jk.png';

type Theme = 'day' | 'night';

type TicketType = 'Regular pass' | 'Group of 4' | 'Table of 4';
type Stage = 'main' | 'after';

type TicketOption = {
  name: TicketType;
  price: string;
  description: string;
  featured?: boolean;
  perks: string[];
};


const navItems = [
  { label: 'The night', href: '#the-night' },
  { label: 'Line-up', href: '#lineup' },
  { label: 'Tickets', href: '#tickets' },
  { label: 'Info', href: '#info' },
];

const lineupByStage: Record<Stage, { time: string; name: string; tag: string }[]> = {
  main: [
    { time: '8:00 PM', name: 'Doors open', tag: 'Welcome to iRave' },
    { time: '9:00 PM', name: 'The party starts', tag: 'Till dawn' },
    { time: '10:30 PM', name: 'Warm-up selectors', tag: 'Afrobeats · Amapiano' },
    { time: '12:00 AM', name: 'The Oblee set', tag: 'Main room' },
    { time: '02:00 AM', name: 'Special guest', tag: 'TBA' },
  ],
  after: [
    { time: '11:00 PM', name: 'The side room', tag: 'Alté · R&B' },
    { time: '01:00 AM', name: 'Late night energy', tag: 'House · Dance' },
    { time: '03:00 AM', name: 'Last dance', tag: 'All night people' },
  ],
};

const ticketOptions: TicketOption[] = [
  {
    name: 'Regular pass',
    price: '₦3,000',
    description: 'General admission to the Oblee edition.',
    perks: ['General admission'],
  },
  {
    name: 'Group of 4',
    price: '₦10,000',
    description: 'Bring your people. Four regular tickets, one better night.',
    featured: true,
    perks: ['Admits 4 people', 'General admission'],
  },
  {
    name: 'Table of 4',
    price: '₦100,000',
    description: 'Your own VIP corner of the night, drinks included.',
    perks: ['VIP access', 'Drinks included', 'Table for four'],
  },
];

const ticketsUrl = 'https://nairaevents.com/events/irave-2-0-the-oblee-edition';
const partyfinderUrl = 'https://app.partyfinder.website/event/1139';

// Organiser's WhatsApp number: international format, digits only (no "+" or spaces).
const whatsappNumber = '2348023152346';
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello! I have a question about iRave 2.0 (The Oblee Edition).')}`;

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// Taken from the "Powered by" strip on the flyer. The last two logos carry no readable name.
const sponsors: { name: string; logo: string }[] = [
  { name: 'Eniobanke', logo: eniobanke },
  { name: 'Adekola', logo: adekola },
  { name: 'Dolikin', logo: dolikin },
  { name: 'MT', logo: mt },
  { name: 'Airpath', logo: airpath },
  { name: 'Leo Autos', logo: leoAutos },
  { name: 'Partner crest', logo: crest },
  { name: 'JK', logo: jk },
];

const faqs = [
  {
    question: 'Where is iRave happening?',
    answer:
      'We are taking over Ibadan North LGA Car Park, opposite Government House, Agodi Gate, Ibadan.',
  },
  {
    question: 'What time should I arrive?',
    answer:
      'Doors open at 8:00 PM and the party starts at 9:00 PM, running till dawn. Come early for a smoother entry before the room gets loud.',
  },
  {
    question: 'Can I buy at the door?',
    answer:
      'Door availability depends on capacity. Buy your ticket early on Nairaevents or Partyfinder so you are not left outside.',
  },
  {
    question: 'Is there a dress code?',
    answer:
      'Come as your loudest self. Comfortable shoes, expressive fits, and enough room to dance are highly recommended.',
  },
];

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('irave-theme');
    if (stored === 'day' || stored === 'night') return stored;
  } catch {
    // localStorage can throw in private mode; fall through to the system preference.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
}

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('main');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('irave-theme', theme);
    } catch {
      // ignore storage failures
    }
  }, [theme]);

  const scrollToSection = (href: string): void => {
    setMenuOpen(false);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelector(href)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const handleTabKeys = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next: Stage = stage === 'main' ? 'after' : 'main';
    setStage(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  return (
    <main className="site-shell">
      <nav className="site-nav" aria-label="Main navigation">
        <button className="brand-mark" onClick={() => scrollToSection('#top')} aria-label="Back to top">
          <span className="brand-symbol">J</span>
          <span>Jah Ent.</span>
        </button>

        <div className={`nav-links ${menuOpen ? 'is-open' : ''}`} id="nav-links">
          {navItems.map((item) => (
            <button key={item.href} onClick={() => scrollToSection(item.href)}>
              {item.label}
            </button>
          ))}
          <button className="nav-cta" onClick={() => scrollToSection('#tickets')}>
            Get tickets <ArrowUpRight size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={() => setTheme((current) => (current === 'day' ? 'night' : 'day'))}
            aria-label={theme === 'day' ? 'Switch to night mode' : 'Switch to day mode'}
            title={theme === 'day' ? 'Night mode' : 'Day mode'}
          >
            {theme === 'day' ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
          </button>
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="nav-links"
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-photo" aria-hidden="true" />
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-kicker"><span /> Jah Ent. presents <span /></div>
          <p className="hero-serial">ISSUE 02 <span>·</span> THE OBLEE EDITION</p>
          <h1>iRave<span>2.0</span></h1>
          <p className="hero-subtitle">A city-wide release of sound, colour, and unapologetic movement.</p>
          <div className="hero-actions">
            <button className="button button-light" onClick={() => scrollToSection('#tickets')}>
              Get your pass <ArrowUpRight size={17} aria-hidden="true" />
            </button>
            <button className="text-link" onClick={() => scrollToSection('#the-night')}>
              Discover the night <ArrowDown size={17} aria-hidden="true" />
            </button>
          </div>
          <Countdown />
        </div>
        <div className="hero-stamp">No sleep<br /><span>in Ibadan</span></div>
        <div className="hero-date-card">
          <span className="date-card-label">Save the feeling</span>
          <strong>12<span>·</span>12</strong>
          <span className="date-card-meta">Saturday · doors 8 PM · party 9 PM</span>
        </div>
        <div className="hero-footer">
          <span>Ibadan, Nigeria</span>
          <span className="hero-scroll"><span className="scroll-line" /> Scroll to enter</span>
          <span>2026 edition</span>
        </div>
      </section>

      <section className="ticker" aria-label="Event highlights">
        <div className="ticker-track" aria-hidden="true">
          {['Afrobeats', 'Amapiano', 'Alté', 'House', 'Dance', 'The Oblee Edition', 'Afrobeats', 'Amapiano', 'Alté', 'House', 'Dance', 'The Oblee Edition'].map((item, index) => (
            <span key={`${item}-${index}`}>{item} <b>✳</b></span>
          ))}
        </div>
        <p className="sr-only">Afrobeats, Amapiano, Alté, House and Dance. The Oblee Edition.</p>
      </section>

      <section className="manifesto section-grid" id="the-night">
        <div className="section-label"><span>01</span><span>What is iRave?</span></div>
        <div className="manifesto-copy" data-reveal>
          <p className="eyebrow">Not just another party</p>
          <h2>The city gets<br /><em>louder.</em></h2>
          <p className="body-copy">iRave is a full-sensory night for the people who make Ibadan move. A meeting point for great music, bold fits, new faces, and that one song that changes the whole night.</p>
          <div className="manifesto-detail"><span className="detail-mark"><Sparkles size={19} aria-hidden="true" /></span><span>One night.<br /><strong>Zero quiet moments.</strong></span></div>
        </div>
        <div className="manifesto-side" data-reveal style={{ transitionDelay: '.12s' }}>
          <div className="side-number">02</div>
          <p>We are bringing the Oblee edition to a new address with a bigger room, a sharper sound, and more reasons to stay until the lights come on.</p>
          <button className="circle-arrow" onClick={() => scrollToSection('#lineup')} aria-label="View line-up"><ArrowDown size={20} aria-hidden="true" /></button>
        </div>
      </section>

      <section className="visual-break" aria-label="The crowd is the headline">
        <div className="visual-break-overlay" aria-hidden="true" />
        <div className="visual-copy"><span>Bring the<br />whole <em>you.</em></span><small>iRave 2.0 · Oblee edition</small></div>
        <div className="visual-circle" aria-hidden="true"><Disc3 size={32} /><span>Turn it<br />all the way up</span></div>
      </section>

      <section className="lineup section-grid" id="lineup">
        <div className="section-label"><span>02</span><span>Sound check</span></div>
        <div className="lineup-main" data-reveal>
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">The floor plan</p>
              <h2>Follow<br /><em>the sound.</em></h2>
            </div>
            <Radio className="heading-icon" size={48} strokeWidth={1.2} aria-hidden="true" />
          </div>
          <div className="stage-tabs" role="tablist" aria-label="Event rooms" onKeyDown={handleTabKeys}>
            <button id="tab-main" className={stage === 'main' ? 'active' : ''} onClick={() => setStage('main')} role="tab" aria-selected={stage === 'main'} aria-controls="stage-panel" tabIndex={stage === 'main' ? 0 : -1}>Main room</button>
            <button id="tab-after" className={stage === 'after' ? 'active' : ''} onClick={() => setStage('after')} role="tab" aria-selected={stage === 'after'} aria-controls="stage-panel" tabIndex={stage === 'after' ? 0 : -1}>After hours</button>
          </div>
          <div className="schedule-list" id="stage-panel" role="tabpanel" aria-labelledby={`tab-${stage}`}>
            {lineupByStage[stage].map((item) => (
              <div className="schedule-row" key={`${stage}-${item.time}`}>
                <span className="schedule-time">{item.time}</span>
                <strong>{item.name}</strong>
                <span className="schedule-tag">{item.tag}</span>
              </div>
            ))}
          </div>
          <p className="lineup-note"><Music2 size={16} aria-hidden="true" /> Line-up details land here first. Stay close.</p>
        </div>
      </section>

      <section className="tickets section-grid" id="tickets">
        <div className="section-label"><span>03</span><span>Tickets</span></div>
        <div className="tickets-main" data-reveal>
          <div className="section-heading-row tickets-heading">
            <div><p className="eyebrow">Your night, your way</p><h2>Ticket<br /><em>prices.</em></h2></div>
            <Ticket className="heading-icon" size={48} strokeWidth={1.2} aria-hidden="true" />
          </div>
          <div className="ticket-grid">
            {ticketOptions.map((ticket, ticketIndex) => (
              <article className={`ticket-card ${ticket.featured ? 'featured' : ''}`} key={ticket.name} data-reveal style={{ transitionDelay: `${ticketIndex * 0.1}s` }}>
                {ticket.featured && <div className="featured-badge">Most loved</div>}
                <span className="ticket-index">0{ticketIndex + 1}</span>
                <h3>{ticket.name}</h3>
                <div className="ticket-price">{ticket.price}</div>
                <p>{ticket.description}</p>
                <ul>{ticket.perks.map((perk) => <li key={perk}><Check size={15} aria-hidden="true" /> {perk}</li>)}</ul>
              </article>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
            <a className="button button-dark" href={ticketsUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', width: 'auto' }}>
              Buy on Nairaevents <ArrowUpRight size={17} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a className="button button-dark" href={partyfinderUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', width: 'auto' }}>
              Buy on Partyfinder <ArrowUpRight size={17} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
          <p className="ticket-note" style={{ fontSize: 12, lineHeight: 1.5, margin: '14px 0 0', opacity: 0.75 }}>
            Tickets are sold on Nairaevents and Partyfinder. Booking fees may apply at checkout.
          </p>
        </div>
      </section>

      <section className="info section-grid" id="info">
        <div className="section-label"><span>04</span><span>Plan your night</span></div>
        <div className="info-main" data-reveal>
          <div className="info-card location-card"><div className="info-icon"><MapPin size={20} aria-hidden="true" /></div><p className="eyebrow">The address</p><h3>Ibadan North LGA Car Park</h3><p>Opposite Government House, Agodi Gate, Ibadan.</p></div>
          <div className="info-card date-card"><div className="info-icon"><CalendarDays size={20} aria-hidden="true" /></div><p className="eyebrow">The date</p><h3>Saturday<br />12 December</h3><p>Doors open at 8 PM. The party starts at 9 PM, till dawn.</p></div>
          <div className="info-card contact-card"><div className="info-icon"><Mail size={20} aria-hidden="true" /></div><p className="eyebrow">Enquiries and sponsorship</p><h3>Call the<br />team.</h3><p>+234 802 315 2346<br />+234 706 175 3137</p><a href={whatsappUrl} target="_blank" rel="noreferrer">Chat on WhatsApp <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></div>
        </div>
      </section>

      <section className="faq section-grid">
        <div className="section-label"><span>05</span><span>Good to know</span></div>
        <div className="faq-main" data-reveal><div><p className="eyebrow">Before you pull up</p><h2>Questions?<br /><em>Answered.</em></h2></div><div className="faq-list">{faqs.map((faq, index) => (<div key={faq.question} className={`faq-item ${openFaq === index ? 'is-open' : ''}`}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span>{faq.question}</span><ChevronDown size={17} aria-hidden="true" /></button>{openFaq === index && <p>{faq.answer}</p>}</div>))}</div></div>
      </section>

      <section className="sponsors section-grid" id="sponsors" aria-labelledby="sponsors-title">
        <div className="section-label"><span>06</span><span>Powered by</span></div>
        <div className="sponsors-main" data-reveal>
          <p className="eyebrow">With thanks to</p>
          <h2 id="sponsors-title">Our<br /><em>sponsors.</em></h2>
          <ul className="sponsor-list">
            {sponsors.map((sponsor) => (
              <li className="sponsor-item" key={sponsor.name}>
                <img src={sponsor.logo} alt={sponsor.name} loading="lazy" />
                <span>{sponsor.name}</span>
              </li>
            ))}
          </ul>
          <p className="sponsor-cta">Want to sponsor iRave? Call <a href="tel:+2348023152346">+234 802 315 2346</a> or <a href="tel:+2347061753137">+234 706 175 3137</a>.</p>
        </div>
      </section>

      <footer className="site-footer"><div className="footer-top"><div><div className="footer-logo"><span className="brand-symbol">J</span> Jah Ent.</div><p>For the ones who know<br />how to move.</p></div><a className="button button-light" href="#tickets" style={{ textDecoration: 'none' }}>Get your pass</a></div><p className="footer-meta">2026 iRave 2.0 · Oblee edition</p></footer>

      <a
        className="whatsapp-fab"
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with the organiser on WhatsApp (opens in a new tab)"
        title="Chat on WhatsApp"
      >
        <WhatsAppIcon />
      </a>
    </main>
  );
}

export default App;
