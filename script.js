// give an array of five obj with properties: id, name, status
// status can be either "open" or "closed"
//
const tickets = [
  { id: 1, name: "Ticket 1", status: "open" },
  { id: 2, name: "Ticket 2", status: "closed" },
  { id: 3, name: "Ticket 3", status: "open" },
  { id: 4, name: "Ticket 4", status: "closed" },
  { id: 5, name: "Ticket 5", status: "open" },
];

const updatedTickets = tickets.map((tic) => {
  if (tic.id == 4) {
    tic.status = "__";
    return tic;
  } else {
    return tic;
  }
});

console.log(updatedTickets);
