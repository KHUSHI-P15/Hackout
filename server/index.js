require('dotenv').config();
const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const { dbConnect } = require('./utils/db.utils');
const { errorHandler } = require('./utils/route.utils');

// include routes here
const authRoutes = require('./routes/auth.route');
const citizensRoutes = require('./routes/citizens.route');
const communityRoutes = require('./routes/community.route');
const ngoRoutes = require('./routes/ngo.route');
const govtRoutes = require('./routes/government.route');

const app = express();

app.use(cors({ maxAge: 3600 }));
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(
	session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: false,
	})
);

// ✅ Apply JSON body parser ONLY to JSON routes
app.use('/auth', express.json({ limit: '10mb' }), authRoutes);
app.use('/citizen', express.json({ limit: '10mb' }), citizensRoutes);
app.use('/community', express.json({ limit: '10mb' }), communityRoutes);
app.use('/ngo', express.json({ limit: '10mb' }), ngoRoutes);

// ✅ Do NOT attach express.json here (multipart handled by Multer)
app.use('/government', govtRoutes);

app.use(errorHandler);

dbConnect()
	.then(() => {
		app.listen(process.env.PORT, () => {
			console.log('http://localhost:5000/');
		});
	})
	.catch((err) => {
		console.log(err);
		console.log('DB ERROR');
	});
