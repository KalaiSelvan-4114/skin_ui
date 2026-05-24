/**
 * Image Validation Utility
 * Checks for: skin detection, blur, motion blur/shakiness
 */

// Detect blur using Laplacian variance method
export const detectBlur = (canvas, threshold = 100) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert to grayscale
  const gray = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    gray.push(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // Apply Laplacian kernel
  const width = canvas.width;
  const height = canvas.height;
  let laplacian = [];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const value =
        -gray[idx - width - 1] - gray[idx - width] - gray[idx - width + 1] +
        -gray[idx - 1] + 8 * gray[idx] - gray[idx + 1] +
        -gray[idx + width - 1] - gray[idx + width] - gray[idx + width + 1];
      laplacian.push(value);
    }
  }

  // Calculate variance
  const mean = laplacian.reduce((a, b) => a + b, 0) / laplacian.length;
  const variance = laplacian.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / laplacian.length;

  const isBlurry = variance < threshold;
  const blurScore = Math.min(100, Math.round((variance / threshold) * 100));

  return {
    isBlurry,
    blurScore,
    variance
  };
};

// Detect skin presence using skin color distribution
export const detectSkin = (canvas) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let skinPixels = 0;
  let totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Skin tone detection using HSV color space
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    // Calculate hue
    let hue = 0;
    if (delta !== 0) {
      if (max === r) {
        hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
      } else if (max === g) {
        hue = ((b - r) / delta + 2) / 6;
      } else {
        hue = ((r - g) / delta + 4) / 6;
      }
    }

    // Calculate saturation and value
    const saturation = max === 0 ? 0 : delta / max;
    const value = max / 255;

    // Skin tone criteria (hue between 0-50 degrees = orange/red range)
    const hueDegrees = hue * 360;
    const isSkinTone =
      hueDegrees >= 0 &&
      hueDegrees <= 50 &&
      saturation >= 0.1 &&
      saturation <= 0.6 &&
      value >= 0.3 &&
      value <= 0.95 &&
      r > 95 &&
      g > 40 &&
      b > 20 &&
      r > g &&
      r > b &&
      Math.abs(r - g) > 15;

    if (isSkinTone) {
      skinPixels++;
    }
  }

  const skinPercentage = (skinPixels / totalPixels) * 100;
  const hasSkin = skinPercentage > 15; // At least 15% skin pixels

  return {
    hasSkin,
    skinPercentage: Math.round(skinPercentage * 10) / 10,
  };
};

// Detect motion blur/shakiness using edge detection
export const detectMotionBlur = (canvas, threshold = 5000) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert to grayscale
  const gray = [];
  const width = canvas.width;
  const height = canvas.height;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    gray.push(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // Horizontal edge detection
  let horizontalEdges = 0;
  let verticalEdges = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Sobel horizontal
      const gx =
        -gray[idx - width - 1] - 2 * gray[idx - 1] - gray[idx + width - 1] +
        gray[idx - width + 1] + 2 * gray[idx + 1] + gray[idx + width + 1];

      // Sobel vertical
      const gy =
        -gray[idx - width - 1] - 2 * gray[idx - width] - gray[idx - width + 1] +
        gray[idx + width - 1] + 2 * gray[idx + width] + gray[idx + width + 1];

      const magnitude = Math.sqrt(gx * gx + gy * gy);

      if (Math.abs(gx) > Math.abs(gy)) {
        horizontalEdges += magnitude;
      } else {
        verticalEdges += magnitude;
      }
    }
  }

  const edgeRatio = Math.abs(horizontalEdges - verticalEdges) / (horizontalEdges + verticalEdges + 1);
  const isShaky = edgeRatio > 0.3;
  const motionScore = Math.round(edgeRatio * 100);

  return {
    isShaky,
    motionScore,
    edgeRatio
  };
};

// Comprehensive image validation
export const validateImage = async (file, t = (value) => value) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Create canvas for analysis
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Run all validations
        const blurAnalysis = detectBlur(canvas);
        const skinAnalysis = detectSkin(canvas);
        const motionAnalysis = detectMotionBlur(canvas);

        const validation = {
          isValid: true,
          warnings: [],
          errors: [],
          details: {
            blur: blurAnalysis,
            skin: skinAnalysis,
            motion: motionAnalysis,
            dimensions: {
              width: img.width,
              height: img.height,
              megapixels: (img.width * img.height) / 1000000
            }
          }
        };

        // Check for issues
        if (blurAnalysis.isBlurry) {
          validation.warnings.push({
            type: 'blur',
            message: t('imageAppearsBlurry', { score: blurAnalysis.blurScore }),
            severity: 'warning'
          });
        }

        if (!skinAnalysis.hasSkin) {
          validation.errors.push({
            type: 'no_skin',
            message: t('noSkinDetected', { percent: skinAnalysis.skinPercentage }),
            severity: 'error'
          });
          validation.isValid = false;
        }

        if (motionAnalysis.isShaky) {
          validation.warnings.push({
            type: 'motion_blur',
            message: t('imageAppearsShaky'),
            severity: 'warning'
          });
        }

        if (img.width < 300 || img.height < 300) {
          validation.warnings.push({
            type: 'low_resolution',
            message: t('imageResolutionLow', { width: img.width, height: img.height }),
            severity: 'warning'
          });
        }

        resolve(validation);
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error(t('failedToReadImageFile')));
    };

    reader.readAsDataURL(file);
  });
};

export default {
  validateImage,
  detectBlur,
  detectSkin,
  detectMotionBlur
};
