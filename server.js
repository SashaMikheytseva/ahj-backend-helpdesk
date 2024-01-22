const http = require('http');
const uuid = require('uuid');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const cors = require('@koa/cors');
const app = new Koa();

const tickets = [];

app.use(
  koaBody({
    urlencoded: true,
    multipart: true,
    text: true,
    json: true,
  })
);

app.use(cors('Access-Control-Allow-Origin', '*'));

app.use(async (ctx) => {
  const { method, id } = ctx.request.query;
  const { name, description, status } = ctx.request.body;

  switch (method) {
    case 'allTickets':
      const allTickets = [];
      for(let i = 0; i < tickets.length; i += 1) {
        const { description, ...short } = tickets[i];
        allTickets.push(short);
      }
      ctx.response.body = JSON.stringify(allTickets);
      ctx.response.status = 200;
      break;
    case 'ticketById':
      if (id) {
        const ticket = tickets.find((item) => item.id === id);
        if (ticket) {
          ctx.response.body = ticket;
        } else {
          ctx.response.status = 404;
        }
      }
      break;
    case 'createTicket':
      const newTicketData = ctx.request.body;
      const newTicket = {
        id: uuid.v4(),
        name: newTicketData.name,
        status: false,
        description: newTicketData.description || '',
        created: new Date(),
      };
      tickets.push(newTicket);
      ctx.response.body = [newTicket];
      break;
    case 'removeById':
      const index = tickets.findIndex((item) => item.id === id);
      tickets.splice(index, 1);
      ctx.response.body = true;
      break;
    case 'editTicket':
      if (id) {
        const index = tickets.findIndex((item) => item.id === id);
        tickets[index].name = name;
        tickets[index].description = description;
      }
      ctx.response.body = true;
      break;
    case 'checkTicket':
      if (id) {
        const index = tickets.findIndex((item) => item.id === id);
        tickets[index].status = status;
      }
      ctx.response.body = true;
      break;
    default:
      ctx.response.status = 404;
      break;
  }
});

const server = http.createServer(app.callback());
const port = process.env.PORT || 7070;
server.listen(port, () => console.log('Server started'));