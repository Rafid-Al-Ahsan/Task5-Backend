const express = require('express');
const app = express();
const cors = require('cors');
const { faker } = require('@faker-js/faker');

// Middleware
app.use(express.json());
app.use(cors());

// Lookup tables for cities, names, and locales with more realistic data
const lookupData = {
    USA: {
        names: ['John', 'Jane', 'Michael', 'Emily', 'Chris', 'Jessica', 'David', 'Sarah'],
        surnames: ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller'],
        cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
        streetTypes: ['St', 'Ave', 'Blvd', 'Rd', 'Dr'],
        phoneFormats: ['(###) ###-####', '###-###-####']
    },
    Poland: {
        names: ['Jan', 'Anna', 'Piotr', 'Kasia', 'Tomasz', 'Ewa', 'Jakub', 'Zofia'],
        surnames: ['Kowalski', 'Nowak', 'Wojciechowski', 'Kwiatkowski', 'Zieliński'],
        cities: ['Warsaw', 'Krakow', 'Wrocław', 'Gdańsk', 'Poznań'],
        streetTypes: ['Ulica', 'Aleja'],
        phoneFormats: ['###-###-###', '+48 ### ### ###']
    },
    Georgia: {
        names: ['Giorgi', 'Nino', 'David', 'Ana', 'Levan', 'Salome'],
        surnames: ['Beridze', 'Tsiklauri', 'Kobakhidze', 'Kurdiani'],
        cities: ['Tbilisi', 'Batumi', 'Rustavi', 'Zugdidi'],
        streetTypes: ['Street'],
        phoneFormats: ['+995 ### ### ###']
    }
};

// Helper function to generate a more realistic address
function generateAddress(region) {
    const streetAddress = faker.address.streetAddress(); // Generates a street address
    const city = faker.helpers.arrayElement(lookupData[region].cities); // Get city based on region
    const state = faker.address.state(); // Generates a state name
    const zipCode = faker.address.zipCode(); // Generates a zip code

    return `${streetAddress}, ${city}, ${state} ${zipCode}`;
}

// Helper function to apply random errors
const applyErrors = (string, errorCount) => {
    const errorTypes = ['delete', 'add', 'swap'];
    const applyError = (str) => {
        const type = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        const pos = Math.floor(Math.random() * str.length);

        if (type === 'delete' && str.length > 1) {
            return str.slice(0, pos) + str.slice(pos + 1);
        } else if (type === 'add') {
            const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
            return str.slice(0, pos) + randomChar + str.slice(pos);
        } else if (type === 'swap' && str.length > 1 && pos < str.length - 1) {
            return str.slice(0, pos) + str[pos + 1] + str[pos] + str.slice(pos + 2);
        }
        return str;
    };

    for (let i = 0; i < errorCount; i++) {
        string = applyError(string);
    }
    return string;
};

// Endpoint to generate fake user data
app.post('/api/generate', (req, res) => {
    const { region, errorCount, seed, page, batchSize = 20 } = req.body;
    faker.seed(parseInt(seed, 36) + page); // Combine seed and page number

    const records = [];
    const regionData = lookupData[region];

    for (let i = 0; i < batchSize; i++) {
        const name = `${faker.helpers.arrayElement(regionData.names)} ${faker.helpers.arrayElement(regionData.surnames)}`;
        const address = generateAddress(region); // Pass region to address generation
        const phone = faker.phone.number(faker.helpers.arrayElement(regionData.phoneFormats));

        records.push({
            identifier: faker.string.uuid(),
            name: applyErrors(name, Math.floor(errorCount)),
            address: applyErrors(address, Math.floor(errorCount)),
            phone: applyErrors(phone, Math.floor(errorCount))
        });
    }

    res.json(records);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
