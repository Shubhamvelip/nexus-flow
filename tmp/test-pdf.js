const fs = require('fs');
const pdfParse = require('pdf-parse');

async function test() {
    try {
        const dataBuffer = fs.readFileSync('test1.pdf');
        console.log("Buffer length:", dataBuffer.length);
        const data = await pdfParse(dataBuffer);
        console.log("PDF parsed successfully, text length:", data.text.length);
    } catch (err) {
        console.error("Parse error:", err);
    }
}
test();
