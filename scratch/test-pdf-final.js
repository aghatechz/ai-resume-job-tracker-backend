import { PDFParse } from 'pdf-parse';
import fs from 'fs';

async function test() {
    try {
        const buffer = Buffer.from("%PDF-1.4\n..."); 
        // Let's try to see if it's thenable
        const p = new PDFParse(buffer);
        console.log("Is thenable?", typeof p.then === 'function');
        
        // Let's check for a .text property or a .parse() method
        console.log("Instance keys:", Object.keys(p));
    } catch (e) {
        console.log("Error:", e.message);
    }
}
test();
