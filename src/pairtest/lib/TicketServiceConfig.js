const config = Object.freeze({
  ticketPrices: Object.freeze({
    ADULT: 20,
    CHILD: 10,
    INFANT: 0,
  }),
  maxTicketCount: 20,
  seatReservationIgnore: Object.freeze(['INFANT']),
});

export default config;
