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
});
