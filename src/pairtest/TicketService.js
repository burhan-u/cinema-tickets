/* eslint-disable class-methods-use-this */
import TicketTypeRequest from './lib/TicketTypeRequest';
import InvalidPurchaseException from './lib/InvalidPurchaseException';
import errorMessages from './lib/ErrorMessages';

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
      throw new InvalidPurchaseException(errorMessages.invalidAccId);
    }
  }

  #validateTickets(ticketTypeRequests) {
    if (!ticketTypeRequests.length) {
      throw new InvalidPurchaseException(errorMessages.invalidTickets);
    }

    let adultTicketPurchased = false;
    ticketTypeRequests.forEach((ticket) => {
      if (!(ticket instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException(errorMessages.invalidTickets);
      }

      if (ticket.getTicketType() === 'ADULT') {
        adultTicketPurchased = true;
      }
    });

    if (adultTicketPurchased === false) {
      throw new InvalidPurchaseException(errorMessages.noAdult);
    }

    // eslint-disable-next-line arrow-body-style
    const totalTickets = ticketTypeRequests.reduce((total, tickets) => {
      return total + tickets.getNoOfTickets();
    }, 0);

    const MAX_TICKET_AMOUNT = 20;
    if (totalTickets > MAX_TICKET_AMOUNT) {
      throw new InvalidPurchaseException(errorMessages.maxTickets);
    }
  }
}
