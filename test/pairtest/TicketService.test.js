import TicketService from '../../src/pairtest/TicketService';
import TicketTypeRequest from '../../src/pairtest/lib/TicketTypeRequest';
import InvalidPurchaseException from '../../src/pairtest/lib/InvalidPurchaseException';

describe('TicketService', () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
  });

  describe('Account ID validation', () => {
    const ticket = new TicketTypeRequest('ADULT', 1);
    const invalidIdException = new InvalidPurchaseException('Invalid account ID');

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
    const invalidTicketException = new InvalidPurchaseException('Invalid ticket type');
    const maximumTicketExcepion = new InvalidPurchaseException('Maximum of 20 tickets per purchase');

    it('should throw exception if tickets are empty', () => {
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
  });
});
