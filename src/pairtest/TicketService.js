/* eslint-disable class-methods-use-this */
import TicketTypeRequest from './lib/TicketTypeRequest';
import InvalidPurchaseException from './lib/InvalidPurchaseException';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    this.#validateAccountID(accountId);
    this.#validateTickets(ticketTypeRequests);
  }

  #validateAccountID(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException('Invalid account ID');
    }
  }

  #validateTickets(ticketTypeRequests) {
    if (!ticketTypeRequests.length) {
      throw new InvalidPurchaseException('Invalid ticket type');
    }

    ticketTypeRequests.forEach((ticket) => {
      if (!(ticket instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException('Invalid ticket type');
      }
    });

    // eslint-disable-next-line arrow-body-style
    const totalTickets = ticketTypeRequests.reduce((total, tickets) => {
      return total + tickets.getNoOfTickets();
    }, 0);

    const MAX_TICKET_AMOUNT = 20;
    if (totalTickets > MAX_TICKET_AMOUNT) {
      throw new InvalidPurchaseException('Maximum of 20 tickets per purchase');
    }
  }
}
