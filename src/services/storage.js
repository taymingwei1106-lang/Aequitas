const STORAGE_KEY = "aequitas-properties";

export function getProperties() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  return JSON.parse(data);
}

export function saveProperty(property) {
  const properties = getProperties();

  properties.push({
    id: Date.now(),
    ...property,
  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(properties)
  );
}

export function deleteProperty(id) {
  const properties = getProperties().filter(
    property => property.id !== id
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(properties)
  );
}