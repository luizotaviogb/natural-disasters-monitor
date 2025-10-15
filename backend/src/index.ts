import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import routes from './routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const openApiPath = path.join(__dirname, '../openapi.json');
if (fs.existsSync(openApiPath)) {
  const openapiDocument = JSON.parse(fs.readFileSync(openApiPath, 'utf-8'));
  app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(openapiDocument, {
    customSiteTitle: 'Natural Disasters Monitor API',
    customCss: '.swagger-ui .topbar { display: none }',
  }) as any);
}

app.use('/api', routes);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (fs.existsSync(openApiPath)) {
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  }
});
