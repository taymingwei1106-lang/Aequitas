export function getPropertyById(properties, id) {
  return properties.find(
    (property) =>
      String(property.id) === String(id)
  );
}

export function getPropertyList() {
  return JSON.parse(
    localStorage.getItem("properties") || "[]"
  );
}

export function propertyExists(id) {
  return getPropertyList().some(
    (property) =>
      String(property.id) === String(id)
  );
}