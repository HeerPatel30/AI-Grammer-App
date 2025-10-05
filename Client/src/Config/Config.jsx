export default class Config {
  constructor() {
    console.log("Config initialized with endpoint:", process.env.REACT_APP_ENDPOINT);
    this.endpoint = process.env.REACT_APP_ENDPOINT || "http://localhost:3031/api/";
  }
}
