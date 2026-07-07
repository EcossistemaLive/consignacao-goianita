const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'scratch' || file === '.git' || file === 'css' || file === 'js') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (!content.includes('firebase-storage-compat.js')) {
                const target = '<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>';
                const replacement = target + '\n    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-storage-compat.js"></script>';
                if (content.includes(target)) {
                    content = content.replace(target, replacement);
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log('Updated: ' + fullPath);
                }
            }
        }
    }
}

processDir('.');
console.log('Done.');
