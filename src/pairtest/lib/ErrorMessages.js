import config from './TicketServiceConfig';

const errorMessages = Object.freeze({
  invalidAccId: 'Invalid account ID',
  invalidTickets: 'Invalid ticket type',
  noTickets: 'No tickets provided',
  noAdult: 'Tickets cannot be purchased without an Adult ticket',
  maxInfants: 'Number of Infant tickets cannot be greater than number of Adult tickets',
  maxTickets: `Maximum of ${config.maxTicketCount} tickets per purchase`,
});

export default errorMessages;
