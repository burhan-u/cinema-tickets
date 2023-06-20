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

    it('should throw an exception if account id is zero', () => {
      expect(() => {
        ticketService.purchaseTickets(0, ticket);
      }).toThrow(new InvalidPurchaseException('Invalid account ID'));
    });

    it('should throw an exception if account id is less than zero', () => {
      expect(() => {
        ticketService.purchaseTickets(-1, ticket);
      }).toThrow(new InvalidPurchaseException('Invalid account ID'));
    });
  });
});
