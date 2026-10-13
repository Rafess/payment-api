import { prisma } from "./lib/prisma";

async function main() {
    console.log("Configuração carregada:", {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  passwordLoaded: Boolean(process.env.DATABASE_PASSWORD),
});
  const count = await prisma.recipient.count();

  console.log("Conexão com MySQL funcionando!");
  console.log(`Destinatários cadastrados: ${count}`);
}

main()
  .catch((error) => {
    console.error("Erro ao consultar o banco:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });