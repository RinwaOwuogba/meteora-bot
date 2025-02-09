import { DB_URL } from '@/config/config';
import { migrateToLatest } from './migration';

migrateToLatest(DB_URL);
