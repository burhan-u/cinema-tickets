/* eslint-disable class-methods-use-this */
import TicketTypeRequest from './lib/TicketTypeRequest';
import InvalidPurchaseException from './lib/InvalidPurchaseException';
import errorMessages from './lib/ErrorMessages';

export default class TicketService {
  #MAX_TICKET_COUNT = 20;

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    this.#validateAccountID(accountId);
    this.#validateTicketRequests(ticketTypeRequests);
    const ticketCount = this.#getTicketCount(ticketTypeRequests);
    this.#validateTicketCount(ticketCount);
  }

  #validateAccountID(accountId) {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new InvalidPurchaseException(errorMessages.invalidAccId);
    }
  }

  #validateTicketRequests(ticketTypeRequests) {
    if (!ticketTypeRequests.length) {
      throw new InvalidPurchaseException(errorMessages.invalidTickets);
    }

    ticketTypeRequests.forEach((ticket) => {
      if (!(ticket instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException(errorMessages.invalidTickets);
      }
    });
  }

  #validateTicketCount(tickets) {
    let totalTicketCount = 0;
    Object.values(tickets).forEach((ticketCount) => {
      totalTicketCount += ticketCount;
    });

    if (totalTicketCount === 0) {
      throw new InvalidPurchaseException(errorMessages.noTickets);
    }

    if (tickets.ADULT === 0) {
      throw new InvalidPurchaseException(errorMessages.noAdult);
    }

    if (tickets.INFANT > tickets.ADULT) {
      throw new InvalidPurchaseException(errorMessages.maxInfants);
    }

    if (totalTicketCount > this.#MAX_TICKET_COUNT) {
      throw new InvalidPurchaseException(errorMessages.maxTickets);
    }
  }

  #getTicketCount(ticketTypeRequests) {
    const ticketCount = {
      ADULT: 0,
      CHILD: 0,
      INFANT: 0,
    };

    ticketTypeRequests.forEach((ticket) => {
      ticketCount[ticket.getTicketType()] += ticket.getNoOfTickets();
    });

    return ticketCount;
  }
}
