import { createApp } from "./app";
import { config } from "./config/env";

createApp().listen(config.port, "0.0.0.0", () => {
  console.log(`IR Fácil API ouvindo em http://0.0.0.0:${config.port}`);
});
