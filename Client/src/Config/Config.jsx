export default class Config {
  constructor() {
    console.log("Config initialized with endpoint:", import.meta.env.VITE_ENDPOINT);
    this.endpoint = import.meta.env.VITE_ENDPOINT;
  }
}