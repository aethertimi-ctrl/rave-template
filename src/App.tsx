import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Disc3,
  Instagram,
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
import { supabase } from '@/lib/supabase';

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
    { time: '9:30 PM', name: 'Warm-up selectors', tag: 'Afrobeats · Amapiano' },
    { time: '11:00 PM', name: 'The Oble set', tag: 'Main room' },
    { time: '01:00 AM', name: 'Special guest', tag: 'TBA' },
  ],
  after: [
    { time: '10:00 PM', name: 'The side room', tag: 'Alté · R&B' },
    { time: '12:00 AM', name: 'Late night energy', tag: 'House · Dance' },
    { time: '02:00 AM', name: 'Last dance', tag: 'All night people' },
  ],
};

const ticketOptions: TicketOption[] = [
  {
    name: 'Regular pass',
    price: '₦3,000',
    description: 'Your all-access entry into the Oble edition.',
    perks: ['General entry', 'Main room access', 'Good energy guaranteed'],
  },
  {
    name: 'Group of 4',
    price: '₦10,000',
    description: 'Bring your people. Four passes, one better night.',
    featured: true,
    perks: ['Entry for four', 'Priority group lane', 'Main room access'],
  },
  {
    name: 'Table of 4',
    price: '₦100,000',
    description: 'Your own corner of the night with table service.',
    perks: ['Reserved table for four', 'Premium table service', 'Fast-track entry'],
  },
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
      'Doors open at 8:00 PM. Come early for the warm-up sets and a smoother entry before the room gets loud.',
  },
  {
    question: 'Can I buy at the door?',
    answer:
      'Door availability depends on capacity. Reserve your pass here first so you are not left outside the moment.',
  },
  {
    question: 'Is there a dress code?',
    answer:
      'Come as your loudest self. Comfortable shoes, expressive fits, and enough room to dance are highly recommended.',
  },
];

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('irave-theme');
    if (stored === 'day' || stored === 'night') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('main');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedTicket, setSelectedTicket] = useState<TicketType>('Regular pass');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

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

  const doorsOpen = new Date('2026-12-12T20:00:00');
  const timeLeft = Math.max(0, doorsOpen.getTime() - now);
  const countdown = [
    { label: 'Days', value: Math.floor(timeLeft / 86400000) },
    { label: 'Hours', value: Math.floor(timeLeft / 3600000) % 24 },
    { label: 'Mins', value: Math.floor(timeLeft / 60000) % 60 },
    { label: 'Secs', value: Math.floor(timeLeft / 1000) % 60 },
  ];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('irave-theme', theme);
  }, [theme]);

  const scrollToSection = (href: string): void => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const selectTicket = (ticket: TicketType): void => {
    setSelectedTicket(ticket);
    scrollToSection('#rsvp');
  };

  const handleRsvpSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    const { error } = await supabase.from('irave_rsvps').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      ticket_type: selectedTicket,
    });

    setIsSubmitting(false);

    if (error) {
      setSubmitError('We could not save that RSVP. Please try again.');
      return;
    }

    setSubmitMessage('You are on the list. We will send the next drop to your inbox.');
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

        <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <button key={item.href} onClick={() => scrollToSection(item.href)}>
              {item.label}
            </button>
          ))}
          <button className="nav-cta" onClick={() => scrollToSection('#rsvp')}>
            Get on the list <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={() => setTheme((current) => (current === 'day' ? 'night' : 'day'))}
            aria-label={theme === 'day' ? 'Switch to night mode' : 'Switch to day mode'}
            title={theme === 'day' ? 'Night mode' : 'Day mode'}
          >
            {theme === 'day' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen((current) => !current)} aria-label="Toggle navigation menu" aria-expanded={menuOpen}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-photo" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="hero-noise" />
        <div className="hero-content">
          <div className="hero-kicker"><span /> Jah Ent. presents <span /></div>
          <p className="hero-serial">ISSUE 02 <span>·</span> THE OBLEE EDITION</p>
          <h1>iRave<span>2.0</span></h1>
          <p className="hero-subtitle">A city-wide release of sound, colour, and unapologetic movement.</p>
          <div className="hero-actions">
            <button className="button button-light" onClick={() => scrollToSection('#tickets')}>
              Get your pass <ArrowUpRight size={17} />
            </button>
            <button className="text-link" onClick={() => scrollToSection('#the-night')}>
              Discover the night <ArrowDown size={17} />
            </button>
          </div>
          <div className="countdown" aria-label="Countdown to doors open">
            {timeLeft === 0
              ? <span className="countdown-live">Doors are open — pull up!</span>
              : countdown.map((cell) => (
                <div className="countdown-cell" key={cell.label}>
                  <strong>{String(cell.value).padStart(2, '0')}</strong>
                  <span>{cell.label}</span>
                </div>
              ))}
          </div>
        </div>
        <div className="hero-stamp">No sleep<br /><span>in Ibadan</span></div>
        <div className="hero-date-card">
          <span className="date-card-label">Save the feeling</span>
          <strong>12<span>·</span>12</strong>
          <span className="date-card-meta">Saturday · doors 8 PM</span>
        </div>
        <div className="hero-footer">
          <span>Ibadan, Nigeria</span>
          <span className="hero-scroll"><span className="scroll-line" /> Scroll to enter</span>
          <span>2026 edition</span>
        </div>
      </section>

      <section className="ticker" aria-label="Event highlights">
        <div className="ticker-track">
          {['Afrobeats', 'Amapiano', 'Alté', 'House', 'Dance', 'The Oble Edition', 'Afrobeats', 'Amapiano', 'Alté', 'House', 'Dance', 'The Oble Edition'].map((item, index) => (
            <span key={`${item}-${index}`}>{item} <b>✳</b></span>
          ))}
        </div>
      </section>

      <section className="manifesto section-grid" id="the-night">
        <div className="section-label"><span>01</span><span>What is iRave?</span></div>
        <div className="manifesto-copy" data-reveal>
          <p className="eyebrow">Not just another party</p>
          <h2>The city gets<br /><em>louder.</em></h2>
          <p className="body-copy">iRave is a full-sensory night for the people who make Ibadan move. A meeting point for great music, bold fits, new faces, and that one song that changes the whole room.</p>
          <div className="manifesto-detail"><span className="detail-mark"><Sparkles size={19} /></span><span>One night.<br /><strong>Zero quiet moments.</strong></span></div>
        </div>
        <div className="manifesto-side" data-reveal style={{ transitionDelay: '.12s' }}>
          <div className="side-number">02</div>
          <p>We are bringing the Oble edition to a new address with a bigger room, a sharper sound, and more reasons to stay until the lights come on.</p>
          <button className="circle-arrow" onClick={() => scrollToSection('#lineup')} aria-label="View line-up"><ArrowDown size={20} /></button>
        </div>
      </section>

      <section className="visual-break" aria-label="The crowd is the headline">
        <div className="visual-break-overlay" />
        <div className="visual-copy"><span>Bring the<br />whole <em>you.</em></span><small>iRave 2.0 · Oble edition</small></div>
        <div className="visual-circle"><Disc3 size={32} /><span>Turn it<br />all the way up</span></div>
      </section>

      <section className="lineup section-grid" id="lineup">
        <div className="section-label"><span>02</span><span>Sound check</span></div>
        <div className="lineup-main" data-reveal>
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">The floor plan</p>
              <h2>Follow<br /><em>the sound.</em></h2>
            </div>
            <Radio className="heading-icon" size={48} strokeWidth={1.2} />
          </div>
          <div className="stage-tabs" role="tablist" aria-label="Event rooms">
            <button className={stage === 'main' ? 'active' : ''} onClick={() => setStage('main')} role="tab" aria-selected={stage === 'main'}>Main room</button>
            <button className={stage === 'after' ? 'active' : ''} onClick={() => setStage('after')} role="tab" aria-selected={stage === 'after'}>Side room</button>
          </div>
          <div className="schedule-list">
            {lineupByStage[stage].map((item) => (
              <div className="schedule-row" key={`${stage}-${item.time}`}>
                <span className="schedule-time">{item.time}</span>
                <strong>{item.name}</strong>
                <span className="schedule-tag">{item.tag}</span>
              </div>
            ))}
          </div>
          <p className="lineup-note"><Music2 size={16} /> Line-up details land here first. Stay close.</p>
        </div>
      </section>

      <section className="tickets section-grid" id="tickets">
        <div className="section-label"><span>03</span><span>Choose your access</span></div>
        <div className="tickets-main" data-reveal>
          <div className="section-heading-row tickets-heading">
            <div><p className="eyebrow">Your night, your way</p><h2>Pick your<br /><em>entry point.</em></h2></div>
            <Ticket className="heading-icon" size={48} strokeWidth={1.2} />
          </div>
          <div className="ticket-grid">
            {ticketOptions.map((ticket, ticketIndex) => (
              <article className={`ticket-card ${ticket.featured ? 'featured' : ''}`} key={ticket.name} data-reveal style={{ transitionDelay: `${ticketIndex * 0.1}s` }}>
                {ticket.featured && <div className="featured-badge">Most loved</div>}
                <span className="ticket-index">0{ticketOptions.indexOf(ticket) + 1}</span>
                <h3>{ticket.name}</h3>
                <div className="ticket-price">{ticket.price}</div>
                <p>{ticket.description}</p>
                <ul>{ticket.perks.map((perk) => <li key={perk}><Check size={15} /> {perk}</li>)}</ul>
                <button className="ticket-button" onClick={() => selectTicket(ticket.name)}>Reserve this <ArrowUpRight size={16} /></button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rsvp section-grid" id="rsvp">
        <div className="section-label"><span>04</span><span>Make it official</span></div>
        <div className="rsvp-main" data-reveal>
          <div className="rsvp-copy"><p className="eyebrow">The guest list is open</p><h2>Be there<br />when it <em>drops.</em></h2><p className="body-copy">Leave your details and we will send you the next ticket release, event updates, and the information you actually need.</p></div>
          <form className="rsvp-form" onSubmit={handleRsvpSubmit}>
            <label htmlFor="name">Your name<input id="name" name="name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Tell us what to call you" required minLength={2} maxLength={80} /></label>
            <label htmlFor="email">Your email<input id="email" name="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
            <label htmlFor="ticket">I am eyeing<select id="ticket" name="ticket" value={selectedTicket} onChange={(event) => setSelectedTicket(event.target.value as TicketType)}>{ticketOptions.map((ticket) => <option key={ticket.name}>{ticket.name}</option>)}</select></label>
            <button className="button button-dark" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving your spot…' : 'Join the guest list'} {isSubmitting ? <Clock3 size={17} className="spin" /> : <ArrowUpRight size={17} />}</button>
            {submitMessage && <p className="form-success"><Check size={16} /> {submitMessage}</p>}
            {submitError && <p className="form-error">{submitError}</p>}
          </form>
        </div>
      </section>

      <section className="info section-grid" id="info">
        <div className="section-label"><span>05</span><span>Plan your night</span></div>
        <div className="info-main" data-reveal>
          <div className="info-card location-card"><div className="info-icon"><MapPin size={20} /></div><p className="eyebrow">The address</p><h3>Ibadan North LGA Car Park</h3><p>Opposite Government House<br />Agodi Gate, Ibadan</p><a href="https://maps.google.com/?q=Ibadan+North+LGA+Car+Park" target="_blank" rel="noreferrer">Open maps <ArrowUpRight size={15} /></a></div>
          <div className="info-card date-card"><div className="info-icon"><CalendarDays size={20} /></div><p className="eyebrow">The date</p><h3>Saturday<br />12 December</h3><p>Doors open at 8:00 PM<br />Last dance when it feels right</p></div>
          <div className="info-card contact-card"><div className="info-icon"><Mail size={20} /></div><p className="eyebrow">Need to ask?</p><h3>Talk to<br />the team.</h3><a href="mailto:hello@jahent.com">hello@jahent.com <ArrowUpRight size={15} /></a><a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={16} /> @jahentertainment</a></div>
        </div>
      </section>

      <section className="faq section-grid">
        <div className="section-label"><span>06</span><span>Good to know</span></div>
        <div className="faq-main" data-reveal><div><p className="eyebrow">Before you pull up</p><h2>Questions?<br /><em>Answered.</em></h2></div><div className="faq-list">{faqs.map((faq, index) => <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={faq.question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span>{faq.question}</span><ChevronDown size={18} /></button>{openFaq === index && <p>{faq.answer}</p>}</div>)}</div></div>
      </section>

      <footer className="site-footer"><div className="footer-top"><div><div className="footer-logo"><span className="brand-symbol">J</span> Jah Ent.</div><p>For the ones who know<br />how to move.</p></div><button className="footer-back" onClick={() => scrollToSection('#top')}>Back to top <ArrowUpRight size={16} /></button></div><div className="footer-bottom"><span>iRave 2.0 · The Oble Edition</span><span>© Jah Entertainment</span><span className="footer-social"><a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={15} /></a><a href="mailto:hello@jahent.com"><Mail size={15} /></a></span></div></footer>
    </main>
  );
}

export default App;
