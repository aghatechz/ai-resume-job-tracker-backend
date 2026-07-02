import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function test() {
    try {
        console.log("Calling 'new PDFParse'...");
        const instance = new PDFParse(Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"));
        console.log("Instance type:", typeof instance);
        // Maybe it has a .then() or a method like .parse()
        console.log("Instance keys:", Object.keys(instance));
        if (typeof instance.then === 'function') {
            console.log("Instance is thenable (Promise)!");
            const result = await instance;
            console.log("Result keys:", Object.keys(result));
        }
    } catch (e) {
        console.log("Error during call:", e.message);
    }
}

test();
