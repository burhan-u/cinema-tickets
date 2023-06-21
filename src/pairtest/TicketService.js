/* eslint-disable class-methods-use-this */
import TicketTypeRequest from './lib/TicketTypeRequest';
import InvalidPurchaseException from './lib/InvalidPurchaseException';
import errorMessages from './lib/ErrorMessages';
import config from './lib/TicketServiceConfig';

export default class TicketService {
  #ticketPaymentService;

  #seatReservationService;

  constructor(ticketPaymentService, seatReservationService) {
    this.#ticketPaymentService = ticketPaymentService;
    this.#seatReservationService = seatReservationService;
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    this.#validateAccountID(accountId);
    this.#validateTicketRequests(ticketTypeRequests);
    const ticketCount = this.#getTicketCount(ticketTypeRequests);
    this.#validateTicketCount(ticketCount);

    const totalPrice = this.#getTotalCost(ticketCount);
    const seatsToReserve = this.#getNumSeatsToReserve(ticketCount);

    this.#ticketPaymentService.makePayment(accountId, totalPrice);
    this.#seatReservationService.reserveSeat(accountId, seatsToReserve);
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

    if (totalTicketCount > config.maxTicketCount) {
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

  #getTotalCost(tickets) {
    let totalPrice = 0;

    Object.entries(tickets).forEach((entry) => {
      const [ticketType, ticketCount] = entry;
      totalPrice += (config.ticketPrices[ticketType] * ticketCount);
    });

    return totalPrice;
  }

  #getNumSeatsToReserve(tickets) {
    let totalSeats = 0;

    Object.entries(tickets).forEach((entry) => {
      const [ticketType, ticketCount] = entry;
      if (!config.seatReservationIgnore.includes(ticketType)) {
        totalSeats += ticketCount;
      }
    });

    return totalSeats;
  }
}
