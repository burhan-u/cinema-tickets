// eslint-disable-next-line import/no-extraneous-dependencies
import { jest } from '@jest/globals';
import TicketService from '../../src/pairtest/TicketService';
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest';
import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException';
import errorMessages from '../../src/pairtest/lib/ErrorMessages';
import TicketPaymentService from '../../src/thirdparty/paymentgateway/TicketPaymentService';

const ticketPaymentServiceMock = jest
  .spyOn(TicketPaymentService.prototype, 'makePayment')
  .mockImplementation(() => {});

describe('TicketService', () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
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
      ticketService = new TicketService(new TicketPaymentService());
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
});
