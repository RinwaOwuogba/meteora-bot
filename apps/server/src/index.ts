import express, { Request, Response } from 'express';
import cors from 'cors';
import poolsRouter from './routes/pools';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/pools', poolsRouter);

// Default route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Meteora API Server' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
