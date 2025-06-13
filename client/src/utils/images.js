// Helper function to load images asynchronously
function loadImageAsync(p, src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const p5Image = p.createImage(img.width, img.height);
      p5Image.drawingContext.drawImage(img, 0, 0);
      resolve(p5Image);
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    // Use the full path from the root of the project
    img.src = '/src/Images/' + src;
  });
}

export { loadImageAsync };