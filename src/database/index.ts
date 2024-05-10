import prisma from "../../prisma/client";

const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to the database");
  } catch (e: any) {
    console.error("Error connecting to the database:\n", e.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

export default connectDb;

