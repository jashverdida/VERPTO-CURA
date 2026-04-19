const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Minimal PNG files (1x1 pixels in various colors) - these are base64 encoded
// For production, replace with actual branded images
const minimalPNGs = {
  // Create simple solid color PNGs with proper dimensions
  'splash.png': createSolidColorPNG(1242, 2436, '#10B981'), // emerald-600
  'icon.png': createSolidColorPNG(1024, 1024, '#10B981'),
  'adaptive-icon.png': createSolidColorPNG(1024, 1024, '#10B981'),
  'favicon.png': createSolidColorPNG(48, 48, '#10B981')
};

function createSolidColorPNG(width, height, hexColor) {
  // For development, we use minimal PNG from a CDN or create placeholder
  // This base64 string represents a minimal 1x1 transparent PNG
  // In production environment, this would be replaced with actual assets

  // Return a simple placeholder buffer (1x1 PNG)
  // This is the smallest valid PNG: iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
  const minimalPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  return minimalPng;
}

// Create the asset files
Object.entries(minimalPNGs).forEach(([filename, content]) => {
  const filepath = path.join(assetsDir, filename);
  try {
    fs.writeFileSync(filepath, content);
    const stats = fs.statSync(filepath);
    console.log(`✓ Created ${filename} (${stats.size} bytes)`);
  } catch (error) {
    console.error(`✗ Failed to create ${filename}:`, error.message);
    process.exit(1);
  }
});

console.log('\n✓ Asset placeholders generated successfully!');
console.log('Note: These are minimal placeholders for development.');
console.log('For production, replace with actual branded images.');

