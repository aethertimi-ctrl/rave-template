export const EVENT_DOORS_OPEN_AT = new Date('2026-12-12T20:00:00+01:00');
export const EVENT_ENDS_AT = new Date('2026-12-13T06:00:00+01:00');

export type TicketType = 'Regular pass' | 'Group of 4' | 'Table of 4';

export type TicketOption = {
  name: TicketType;
  price: string;
  description: string;
  featured?: boolean;
  perks: readonly string[];
};

export const EVENT_TICKET_OPTIONS: readonly TicketOption[] = [
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
