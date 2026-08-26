import PortfolioModel from "../models/PortfolioModel";

const STORAGE_KEY = "aequitas-properties";

export default class PropertyRepository {

  static getAll() {
    const properties = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return new PortfolioModel(properties);
  }

  static save(properties) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(properties)
    );
  }

  static clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

}