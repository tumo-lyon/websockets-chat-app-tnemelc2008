import {createServer} from 'node:http';
import express from 'express';
import {Server} from 'socket.io'

const app = express();
const server = createServer(app);
const io = new Server(server);
const typingUsers = new Set()

app.use(express.static('public'));

app.get('/',(req, res) => {
    res.redirect('/index.html');
});

io.on('connection', (socket) => {
	// connection
	console.log('Client connected');
	io.emit('system_message', {
		content: `Welcome to ${socket.id}`
	});
	//deconnection
	socket.on('disconnect', () => {
		console.log('User disconnect');
		typingUsers.delete(socket.id);
		io.emit('typing',Array.from(typingUsers));
		io.emit('system_message', {
			content: `Goodbye to ${socket.id}`
		});
	});
	
	socket.on('user_message_send', (data) => {
		console.log('Nouveau message');
		io.emit('user_message', {
			author: socket.id,
			content: data.content,
			time: new Date().toLocaleTimeString(),
			isMe: false
		});
	});

	socket.on('typing_start', () => {
		typingUsers.add(socket.id);
		io.emit('typing',Array.from(typingUsers));
	})
	socket.on('typing_stop', () => {
		typingUsers.delete(socket.id);
		io.emit('typing',Array.from(typingUsers));
	})
});


server.listen(3000, () => {
    console.log('Server is running on port 3000')
});