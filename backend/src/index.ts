import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
