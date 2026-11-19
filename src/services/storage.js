const STORAGE_KEY = "aequitas-properties";

export function getProperties() {

    const data = localStorage.getItem(STORAGE_KEY);

    return data ? JSON.parse(data) : [];

}

export function getProperty(id) {

    return getProperties().find(
        property => String(property.id) === String(id)
    );

}

export function saveProperty(property) {

    const properties = getProperties();

    const id = Date.now();

    properties.push({

        id,

        ...property

    });

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(properties)
    );

    // Returned so the caller can open the new property.
    return id;

}

export function updateProperty(id, updatedProperty) {

    const properties = getProperties().map(property =>

        String(property.id) === String(id)

            ? {
                ...property,
                ...updatedProperty
            }

            : property

    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(properties)
    );

}

export function deleteProperty(id) {

    const properties = getProperties().filter(

        property =>

            String(property.id) !== String(id)

    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(properties)
    );

}