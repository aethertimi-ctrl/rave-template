import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
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
import { submitRsvp, type RsvpResult } from '@/lib/supabase';
import { EVENT_TICKET_OPTIONS, type TicketType } from '@/config/event';
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

type Stage = 'main' | 'after';


const heroImage =
  'https://images.pexels.com/photos/32399568/pexels-photo-32399568.jpeg?auto=compress&cs=tinysrgb&h=1400&w=2200';

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

const ticketOptions = EVENT_TICKET_OPTIONS;

const ticketsUrl = 'https://nairaevents.com/events/irave-2-0-the-oblee-edition';

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
      'Door availability depends on capacity. Buy your ticket early on Nairaevents so you are not left outside, and join the guest list here for updates.',
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
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpen = useRef(false);
  const [stage, setStage] = useState<Stage>('main');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedTicket, setSelectedTicket] = useState<TicketType>('Regular pass');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState(''); // honeypot: real users never fill this
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
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
    if (!menuOpen) {
      if (wasMenuOpen.current) menuToggleRef.current?.focus();
      wasMenuOpen.current = false;
      return;
    }
    wasMenuOpen.current = true;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

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

  const selectTicket = (ticket: TicketType): void => {
    setSelectedTicket(ticket);
    scrollToSection('#rsvp');
  };

  const handleTabKeys = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const next: Stage = stage === 'main' ? 'after' : 'main';
    setStage(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  const handleRsvpSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isSubmitting) return;
    setSubmitMessage('');
    setSubmitError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setSubmitError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
      setSubmitError('Please enter a valid email address, like you@example.com.');
      return;
    }

    setIsSubmitting(true);
    let result: RsvpResult;
    try {
      result = await submitRsvp({
        name: cleanName,
        email: cleanEmail,
        ticket_type: selectedTicket,
        website: trap,
      });
    } catch {
      setSubmitError('We could not save that RSVP. Please try again.');
      return;
    } finally {
      setIsSubmitting(false);
    }

    if (!result.ok) {
      if (result.duplicate) {
        setSubmitMessage('You are already on the list. We will send the next drop to your inbox.');
        return;
      }
      setSubmitError(result.error ?? 'We could not save that RSVP. Please try again.');
      return;
    }

    setSubmitMessage(result.message ?? 'You are on the list. We will send the next drop to your inbox.');
    setName('');
    setEmail('');
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
          <button className="nav-cta" onClick={() => scrollToSection('#rsvp')}>
            Get on the list <ArrowUpRight size={16} aria-hidden="true" />
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
            ref={menuToggleRef}
            className="menu-toggle"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="nav-links"
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-photo" style={{ backgroundImage: `url(${heroImage})` }} role="img" aria-label="Crowd dancing at a night event" />
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-kicker"><span /> Jah Ent. presents <span /></div>
          <p className="hero-serial">ISSUE 02 <span>·</span> THE OBLEE EDITION</p>
          <h1>iRave<span>2.0</span></h1>
          <p className="hero-subtitle">A city-wide release of sound, colour, and unapologetic movement.</p>
          <div className="hero-actions">
            <a className="button button-light" href={ticketsUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              Get your pass <ArrowUpRight size={17} aria-hidden="true" />
              <span className="sr-only"> (opens Nairaevents in a new tab)</span>
            </a>
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
        <div className="section-label"><span>03</span><span>Choose your access</span></div>
        <div className="tickets-main" data-reveal>
          <div className="section-heading-row tickets-heading">
            <div><p className="eyebrow">Your night, your way</p><h2>Pick your<br /><em>entry point.</em></h2></div>
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
                <button className="ticket-button" onClick={() => selectTicket(ticket.name)} aria-label={`I am eyeing this: ${ticket.name}`}>I am eyeing this <ArrowUpRight size={16} aria-hidden="true" /></button>
              </article>
            ))}
          </div>
          <a className="button button-dark" href={ticketsUrl} target="_blank" rel="noreferrer" style={{ marginTop: 28, textDecoration: 'none' }}>
            Buy tickets on Nairaevents <ArrowUpRight size={17} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <p className="ticket-note" style={{ fontSize: 12, lineHeight: 1.5, margin: '14px 0 0', opacity: 0.75 }}>
            Tickets are sold on Nairaevents. A small booking fee applies at checkout on Regular and Group of 4 tickets.
          </p>
        </div>
      </section>

      <section className="rsvp section-grid" id="rsvp">
        <div className="section-label"><span>04</span><span>Make it official</span></div>
        <div className="rsvp-main" data-reveal>
          <div className="rsvp-copy"><p className="eyebrow">The guest list is open</p><h2>Be there<br />when it <em>drops.</em></h2><p className="body-copy">Leave your details and we will send you the next drop before doors open.</p></div>
          <form className="rsvp-form" onSubmit={handleRsvpSubmit} noValidate>
            <label htmlFor="name">Your name<input id="name" name="name" type="text" autoComplete="name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Tell us what to call you" /></label>
            <label htmlFor="email">Your email<input id="email" name="email" type="email" autoComplete="email" required maxLength={160} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
            <label htmlFor="ticket">I am eyeing<select id="ticket" name="ticket" value={selectedTicket} onChange={(event) => setSelectedTicket(event.target.value as TicketType)}>{ticketOptions.map((ticket) => <option key={ticket.name} value={ticket.name}>{ticket.name}</option>)}</select></label>
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
              <label htmlFor="company_url">Leave this empty<input id="company_url" name="company_url" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(event) => setTrap(event.target.value)} /></label>
            </div>
            <button className="button button-dark" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving your spot…' : 'Join the guest list'} {isSubmitting ? <Clock3 size={17} aria-hidden="true" /> : null}</button>
            <div aria-live="polite">
              {submitMessage && <p className="form-success" role="status"><Check size={16} aria-hidden="true" /> {submitMessage}</p>}
              {submitError && <p className="form-error" role="alert">{submitError}</p>}
            </div>
          </form>
        </div>
      </section>

      <section className="info section-grid" id="info">
        <div className="section-label"><span>05</span><span>Plan your night</span></div>
        <div className="info-main" data-reveal>
          <div className="info-card location-card"><div className="info-icon"><MapPin size={20} aria-hidden="true" /></div><p className="eyebrow">The address</p><h3>Ibadan North LGA Car Park</h3><p>Opposite Government House, Agodi Gate, Ibadan.</p></div>
          <div className="info-card date-card"><div className="info-icon"><CalendarDays size={20} aria-hidden="true" /></div><p className="eyebrow">The date</p><h3>Saturday<br />12 December</h3><p>Doors open at 8 PM. The party starts at 9 PM, till dawn.</p></div>
          <div className="info-card contact-card"><div className="info-icon"><Mail size={20} aria-hidden="true" /></div><p className="eyebrow">Enquiries and sponsorship</p><h3>Call the<br />team.</h3><p>+234 802 315 2346<br />+234 706 175 3137</p></div>
        </div>
      </section>

      <section className="faq section-grid">
        <div className="section-label"><span>06</span><span>Good to know</span></div>
        <div className="faq-main" data-reveal><div><p className="eyebrow">Before you pull up</p><h2>Questions?<br /><em>Answered.</em></h2></div><div className="faq-list">{faqs.map((faq, index) => (<div key={faq.question} className={`faq-item ${openFaq === index ? 'is-open' : ''}`}><button id={`faq-trigger-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-controls={`faq-panel-${index}`} aria-expanded={openFaq === index}><span>{faq.question}</span><ChevronDown size={17} aria-hidden="true" /></button>{openFaq === index && <p id={`faq-panel-${index}`} role="region" aria-labelledby={`faq-trigger-${index}`}>{faq.answer}</p>}</div>))}</div></div>
      </section>

      <section className="sponsors section-grid" id="sponsors" aria-labelledby="sponsors-title">
        <div className="section-label"><span>07</span><span>Powered by</span></div>
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

      <footer className="site-footer"><div className="footer-top"><div><div className="footer-logo"><span className="brand-symbol">J</span> Jah Ent.</div><p>For the ones who know<br />how to move.</p></div><a className="button button-light" href={ticketsUrl} target="_blank" rel="noreferrer">Get your pass</a></div><p className="footer-meta">2026 iRave 2.0 · Oblee edition</p></footer>
    </main>
  );
}

export default App;
