# cinema-tickets

Implementation of `cinema-tickets` coding exercise written in JavaScript.

## Implementation notes and assumptions

- Built with the Active LTS version of Node.js, rather than the Maintenance release. The engine version in `package.json` has been upgraded to reflect this change. Previous releases should work, but they haven't been tested.

- Jest has been updated to the latest version.

- The `TicketService` constructor requires the injection of two third-party modules: `TicketPaymentService` and `SeatReservationService`.

- The `purchaseTickets` method in the `TicketService` class accepts an integer as the account ID and one or more tickets of type `TicketTypeRequest`.

- Although the specification states that the third-party modules work without defects, the calls to these modules have been wrapped in a simple `try/catch` block as an additional measure. If an exception occurs, the code will return an error message, but no further handling of the exception is implemented.

- There are no tests specifically targeting the exception handling of calls made to the third-party modules.

- Child and infant tickets cannot be purchased without also purchasing an adult ticket.

- The number of infant tickets cannot exceed the number of adult tickets since infants are expected to sit on an adult's lap. Therefore, the number of infant tickets should always be equal to or less than the number of adult tickets.

- Infants are not charged for a ticket, and no seat is reserved for them. However, they are still issued a ticket.

- The maximum number of tickets that can be purchased at a time is 20.

## Requirements

- `node` >= 18.15.0
- `npm` >= 8.19.2

## Clone or download the repository

```bash
git clone https://github.com/burhan-u/cinema-tickets.git
cd cinema-tickets
```

## Install

```bash
npm install
```

## Tests

### Run tests

```bash
npm test
```

### Run tests with coverage report

```bash
npm run test-coverage
```

### Run mutation tests

```bash
npm run test-mutation
```
