import app from "./app";
import { Env } from "./config/env";
// import "./models"; // Import models to initialize associations
import sequelize from "./config/database";

const port = Env.PORT;

async function bootstrap() {
  await sequelize.authenticate();
  await sequelize.sync({ force: false });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

void bootstrap();
