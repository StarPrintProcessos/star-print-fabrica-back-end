// prisma.config.ts
import { defineConfig, env } from 'prisma/config';

// Importe dotenv/config para carregar variáveis de ambiente em tempo de execução, se necessário
import 'dotenv/config'; 

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // A função env() lê a variável de ambiente do sistema
    url: env('DATABASE_URL'), 
  },
});
