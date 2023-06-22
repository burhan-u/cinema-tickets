// eslint-disable-next-line import/no-extraneous-dependencies
import {
  beforeEach, describe, expect, it, jest,
} from '@jest/globals';
import TicketService from '../../src/pairtest/TicketService';
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest';
import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException';
import errorMessages from '../../src/pairtest/lib/ErrorMessages';
import TicketPaymentService from '../../src/thirdparty/paymentgateway/TicketPaymentService';
import SeatReservationService from '../../src/thirdparty/seatbooking/SeatReservationService';

const ticketPaymentServiceMock = jest
  .spyOn(TicketPaymentService.prototype, 'makePayment')
  .mockImplementation(() => {});

const seatReservationServiceMock = jest
  .spyOn(SeatReservationService.prototype, 'reserveSeat')
  .mockImplementation(() => {});

describe('TicketService', () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
    jest.clearAllMocks();
  });

  describe('Account ID validation', () => {
    const ticket = new TicketTypeRequest('ADULT', 1);
    const invalidIdException = new InvalidPurchaseException(errorMessages.invalidAccId);

    it.each([
      [0],
      [-1],
    ])('should throw an exception if account id is less than 1', (accountId) => {
      expect(() => {
        ticketService.purchaseTickets(accountId, ticket);
      }).toThrow(invalidIdException);
    });

    it.each([
      [10.11],
      ['1'],
      [null],
    ])('should throw an exception if account id is not an integer', (accountId) => {
      expect(() => {
        ticketService.purchaseTickets(accountId, ticket);
      }).toThrow(invalidIdException);
    });

    it.each([
      [1],
      [10],
      [100],
    ])('should not throw an exception if account id is valid', (accountId) => {
      expect(() => {
        ticketService.purchaseTickets(accountId, ticket);
      }).not.toThrow(invalidIdException);
    });
  });

  describe('Ticket Type Requests validation', () => {
    const accountId = 1;
    const invalidTicketException = new InvalidPurchaseException(errorMessages.invalidTickets);
    const maximumTicketExcepion = new InvalidPurchaseException(errorMessages.maxTickets);

    it('should throw exception if tickets are not provided', () => {
      expect(() => {
        ticketService.purchaseTickets(accountId);
      }).toThrow(invalidTicketException);
    });

    it('should throw an exception if tickets are of invalid type', () => {
      const tickets = [{ ADULT: 5 }, { CHILD: 2 }];

      expect(() => {
        ticketService.purchaseTickets(accountId, tickets);
      }).toThrow(invalidTicketException);
    });

    it('should throw an exception if ticket type requests contain no tickets', () => {
      const tickets = [new TicketTypeRequest('ADULT', 0), new TicketTypeRequest('CHILD', 0)];

      expect(() => {
        ticketService.purchaseTickets(accountId, ...tickets);
      }).toThrow(new InvalidPurchaseException(errorMessages.noTickets));
    });

    it.each([
      [[new TicketTypeRequest('ADULT', 21)]],
      [[new TicketTypeRequest('ADULT', 12), new TicketTypeRequest('CHILD', 10)]],
    ])('should throw an exception if total number of tickets is greater than 20', (tickets) => {
      expect(() => {
        ticketService.purchaseTickets(accountId, ...tickets);
      }).toThrow(maximumTicketExcepion);
    });

    it('should not throw an exception if tickets are valid', () => {
      const tickets = new TicketTypeRequest('ADULT', 20);

      expect(() => {
        ticketService.purchaseTickets(accountId, tickets);
      }).not.toThrow(maximumTicketExcepion);
    });

    it.each([
      [new TicketTypeRequest('CHILD', 1)],
      [new TicketTypeRequest('INFANT', 1)],
    ])('should throw an exception if trying to purchase tickets without an adult ticket', (tickets) => {
      expect(() => {
        ticketService.purchaseTickets(accountId, tickets);
      }).toThrow(new InvalidPurchaseException(errorMessages.noAdult));
    });

    it('should throw an exception if number of infant tickets greater than number of adult tickets', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 1);
      const infantTickets = new TicketTypeRequest('INFANT', 2);

      expect(() => {
        ticketService.purchaseTickets(accountId, adultTickets, infantTickets);
      }).toThrow(new InvalidPurchaseException(errorMessages.maxInfants));
    });

    it('should not throw an exception if number of infant tickets equal number of adult tickets', () => {
      const adultTickets = new TicketTypeRequest('ADULT', 2);
      const infantTickets = new TicketTypeRequest('INFANT', 2);

      expect(() => {
        ticketService.purchaseTickets(accountId, adultTickets, infantTickets);
      }).not.toThrow(new InvalidPurchaseException(errorMessages.maxInfants));
    });
  });

  describe('Ticket price calculation', () => {
    const accountId = 1;

    beforeEach(() => {
      const paymentService = new TicketPaymentService();
      const seatReservationService = new SeatReservationService();
      ticketService = new TicketService(paymentService, seatReservationService);
    });

    it('should calculate the cost of a single adult ticket and call the payment service', () => {
      const ticket = new TicketTypeRequest('ADULT', 1);
      const expectedCost = 20;

      ticketService.purchaseTickets(accountId, ticket);

      expect(ticketPaymentServiceMock).toBeCalledWith(accountId, expectedCost);
    });

    it.each([
      { tickets: [new TicketTypeRequest('ADULT', 2)], expectedCost: 40 },
      {
        tickets: [
          new TicketTypeRequest('ADULT', 1),
          new TicketTypeRequest('CHILD', 2),
        ],
        expectedCost: 40,
      },
      {
        tickets: [
          new TicketTypeRequest('ADULT', 3),
          new TicketTypeRequest('CHILD', 1),
          new TicketTypeRequest('INFANT', 2),
        ],
        expectedCost: 70,
      },
      {
        tickets: [
          new TicketTypeRequest('ADULT', 1),
          new TicketTypeRequest('CHILD', 5),
          new TicketTypeRequest('INFANT', 1),
        ],
        expectedCost: 70,
      },
    ])('should calculate the cost of multiple tickets and call the payment service', ({ tickets, expectedCost }) => {
      ticketService.purchaseTickets(accountId, ...tickets);

      expect(ticketPaymentServiceMock).toBeCalledWith(accountId, expectedCost);
    });

    it('should calculate the cost of multiples of the same ticket type', () => {
      const tickets = [
        new TicketTypeRequest('ADULT', 1),
        new TicketTypeRequest('ADULT', 2),
      ];
      const expectedCost = 60;

      ticketService.purchaseTickets(accountId, ...tickets);

      expect(ticketPaymentServiceMock).toBeCalledWith(accountId, expectedCost);
    });
  });

  describe('Seat reservation calculation', () => {
    const accountId = 1;

    beforeEach(() => {
      const paymentService = new TicketPaymentService();
      const seatReservationService = new SeatReservationService();
      ticketService = new TicketService(paymentService, seatReservationService);
    });

    it('should calculate number of seats for a single adult ticket and call reservation service', () => {
      const ticket = new TicketTypeRequest('ADULT', 1);
      const expectedSeats = 1;

      ticketService.purchaseTickets(accountId, ticket);

      expect(seatReservationServiceMock).toBeCalledWith(accountId, expectedSeats);
    });

    it.each([
      {
        tickets: [
          new TicketTypeRequest('ADULT', 1),
          new TicketTypeRequest('INFANT', 1),
        ],
        expectedSeats: 1,
      },
      {
        tickets: [
          new TicketTypeRequest('ADULT', 4),
          new TicketTypeRequest('INFANT', 4),
        ],
        expectedSeats: 4,
      },
      {
        tickets: [
          new TicketTypeRequest('ADULT', 8),
          new TicketTypeRequest('INFANT', 6),
        ],
        expectedSeats: 8,
      },
    ])('should not reserve seats for infant tickets', ({ tickets, expectedSeats }) => {
      ticketService.purchaseTickets(accountId, ...tickets);

      expect(seatReservationServiceMock).toBeCalledWith(accountId, expectedSeats);
    });

    it.each([
      {
        tickets: [
          new TicketTypeRequest('ADULT', 1),
          new TicketTypeRequest('CHILD', 2),
        ],
        expectedSeats: 3,
      },
      {
        tickets: [
          new TicketTypeRequest('ADULT', 3),
          new TicketTypeRequest('CHILD', 1),
          new TicketTypeRequest('INFANT', 2),
        ],
        expectedSeats: 4,
      },
      {
        tickets: [
          new TicketTypeRequest('ADULT', 1),
          new TicketTypeRequest('CHILD', 15),
          new TicketTypeRequest('INFANT', 0),
        ],
        expectedSeats: 16,
      },
    ])('should calculate number of seats for multiple tickets', ({ tickets, expectedSeats }) => {
      ticketService.purchaseTickets(accountId, ...tickets);

      expect(seatReservationServiceMock).toBeCalledWith(accountId, expectedSeats);
    });

    it('should calculate number of seats for multiples of the same ticket type', () => {
      const tickets = [
        new TicketTypeRequest('ADULT', 6),
        new TicketTypeRequest('ADULT', 2),
        new TicketTypeRequest('ADULT', 9),
      ];
      const expectedSeats = 17;

      ticketService.purchaseTickets(accountId, ...tickets);

      expect(seatReservationServiceMock).toBeCalledWith(accountId, expectedSeats);
    });
  });

  describe('Successful purchase message', () => {
    it('should return an object containing success message, account id, tickets, total price, and seats reserved', () => {
      const paymentService = new TicketPaymentService();
      const seatReservationService = new SeatReservationService();
      ticketService = new TicketService(paymentService, seatReservationService);

      const accountId = 7025;
      const tickets = [
        new TicketTypeRequest('CHILD', 2),
        new TicketTypeRequest('ADULT', 1),
        new TicketTypeRequest('INFANT', 6),
        new TicketTypeRequest('ADULT', 5),
        new TicketTypeRequest('CHILD', 1),
      ];

      const expectedMessage = {
        message: 'success',
        accountId: 7025,
        tickets: {
          adult: 6,
          child: 3,
          infant: 6,
        },
        totalPrice: 150,
        seatsReserved: 9,
      };

      const message = ticketService.purchaseTickets(accountId, ...tickets);

      expect(message).toEqual(expectedMessage);
    });
  });
});
