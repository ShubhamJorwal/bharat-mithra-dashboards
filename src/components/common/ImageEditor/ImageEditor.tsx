import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  HiOutlineX,
  HiOutlineRefresh,
  HiOutlineCheck,
  HiOutlineZoomIn,
  HiOutlineZoomOut,
  HiOutlineSun,
  HiOutlineAdjustments,
  HiOutlinePhotograph,
  HiOutlineDownload,
  HiOutlineSwitchHorizontal,
  HiOutlineSwitchVertical
} from 'react-icons/hi';
import {
  MdRotateLeft,
  MdRotateRight,
  MdCrop,
  MdAspectRatio
} from 'react-icons/md';
import './ImageEditor.scss';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImageData: string) => void;
  imageSource: string;
  aspectRatios?: { label: string; value: number | null }[];
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Tool = 'crop' | 'adjust' | 'transform';

const DEFAULT_ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 }
];

const ImageEditor = ({
  isOpen,
  onClose,
  onSave,
  imageSource,
  aspectRatios = DEFAULT_ASPECT_RATIOS
}: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Tool states
  const [activeTool, setActiveTool] = useState<Tool>('crop');
  const [loading, setLoading] = useState(true);

  // Image adjustments
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  // Crop states
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(null);

  // Image dimensions
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });

  // History for undo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load image when source changes
  useEffect(() => {
    if (!isOpen || !imageSource) return;

    setLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      imageRef.current = img;
      setImageDimensions({ width: img.width, height: img.height });

      // Calculate display dimensions to fit in container
      const maxWidth = 700;
      const maxHeight = 500;
      let displayWidth = img.width;
      let displayHeight = img.height;

      if (displayWidth > maxWidth) {
        displayHeight = (maxWidth / displayWidth) * displayHeight;
        displayWidth = maxWidth;
      }
      if (displayHeight > maxHeight) {
        displayWidth = (maxHeight / displayHeight) * displayWidth;
        displayHeight = maxHeight;
      }

      setDisplayDimensions({ width: displayWidth, height: displayHeight });
      setHistory([imageSource]);
      setHistoryIndex(0);
      setLoading(false);

      // Reset all adjustments
      resetAdjustments();
    };

    img.onerror = () => {
      console.error('Failed to load image');
      setLoading(false);
    };

    img.src = imageSource;
  }, [isOpen, imageSource]);

  // Draw image on canvas with all adjustments
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = displayDimensions.width;
    canvas.height = displayDimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -zoom : zoom, flipV ? -zoom : zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    // Draw image centered
    const x = (canvas.width - displayDimensions.width) / 2;
    const y = (canvas.height - displayDimensions.height) / 2;
    ctx.drawImage(img, x, y, displayDimensions.width, displayDimensions.height);

    // Restore context
    ctx.restore();

    // Draw crop overlay if cropping
    if (cropArea && activeTool === 'crop') {
      drawCropOverlay(ctx);
    }
  }, [displayDimensions, zoom, rotation, flipH, flipV, brightness, contrast, saturation, cropArea, activeTool]);

  // Draw crop overlay
  const drawCropOverlay = (ctx: CanvasRenderingContext2D) => {
    if (!cropArea || !canvasRef.current) return;

    const canvas = canvasRef.current;

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

    // Top
    ctx.fillRect(0, 0, canvas.width, cropArea.y);
    // Bottom
    ctx.fillRect(0, cropArea.y + cropArea.height, canvas.width, canvas.height - cropArea.y - cropArea.height);
    // Left
    ctx.fillRect(0, cropArea.y, cropArea.x, cropArea.height);
    // Right
    ctx.fillRect(cropArea.x + cropArea.width, cropArea.y, canvas.width - cropArea.x - cropArea.width, cropArea.height);

    // Crop border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;

    // Vertical lines
    const thirdW = cropArea.width / 3;
    ctx.beginPath();
    ctx.moveTo(cropArea.x + thirdW, cropArea.y);
    ctx.lineTo(cropArea.x + thirdW, cropArea.y + cropArea.height);
    ctx.moveTo(cropArea.x + thirdW * 2, cropArea.y);
    ctx.lineTo(cropArea.x + thirdW * 2, cropArea.y + cropArea.height);
    ctx.stroke();

    // Horizontal lines
    const thirdH = cropArea.height / 3;
    ctx.beginPath();
    ctx.moveTo(cropArea.x, cropArea.y + thirdH);
    ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + thirdH);
    ctx.moveTo(cropArea.x, cropArea.y + thirdH * 2);
    ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + thirdH * 2);
    ctx.stroke();

    // Corner handles
    const handleSize = 10;
    ctx.fillStyle = '#fff';

    // Top-left
    ctx.fillRect(cropArea.x - handleSize / 2, cropArea.y - handleSize / 2, handleSize, handleSize);
    // Top-right
    ctx.fillRect(cropArea.x + cropArea.width - handleSize / 2, cropArea.y - handleSize / 2, handleSize, handleSize);
    // Bottom-left
    ctx.fillRect(cropArea.x - handleSize / 2, cropArea.y + cropArea.height - handleSize / 2, handleSize, handleSize);
    // Bottom-right
    ctx.fillRect(cropArea.x + cropArea.width - handleSize / 2, cropArea.y + cropArea.height - handleSize / 2, handleSize, handleSize);
  };

  // Update canvas when adjustments change
  useEffect(() => {
    drawImage();
  }, [drawImage]);

  // Handle crop mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'crop') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsCropping(true);
    setCropStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !cropStart || activeTool !== 'crop') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let currentX = Math.max(0, Math.min(e.clientX - rect.left, canvas.width));
    let currentY = Math.max(0, Math.min(e.clientY - rect.top, canvas.height));

    let width = currentX - cropStart.x;
    let height = currentY - cropStart.y;

    // Handle aspect ratio constraint
    if (selectedAspectRatio !== null) {
      const aspectHeight = Math.abs(width) / selectedAspectRatio;
      height = height >= 0 ? aspectHeight : -aspectHeight;
    }

    let x = cropStart.x;
    let y = cropStart.y;

    if (width < 0) {
      x = cropStart.x + width;
      width = Math.abs(width);
    }
    if (height < 0) {
      y = cropStart.y + height;
      height = Math.abs(height);
    }

    // Clamp to canvas bounds
    x = Math.max(0, x);
    y = Math.max(0, y);
    width = Math.min(width, canvas.width - x);
    height = Math.min(height, canvas.height - y);

    setCropArea({ x, y, width, height });
  };

  const handleMouseUp = () => {
    setIsCropping(false);
  };

  // Apply crop
  const applyCrop = () => {
    if (!cropArea || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Set temp canvas to crop size
    tempCanvas.width = cropArea.width;
    tempCanvas.height = cropArea.height;

    // Draw cropped portion
    tempCtx.drawImage(
      canvas,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );

    // Create new image from cropped canvas
    const croppedDataUrl = tempCanvas.toDataURL('image/png');

    const newImg = new Image();
    newImg.onload = () => {
      imageRef.current = newImg;
      setImageDimensions({ width: newImg.width, height: newImg.height });

      // Calculate new display dimensions
      const maxWidth = 700;
      const maxHeight = 500;
      let displayWidth = newImg.width;
      let displayHeight = newImg.height;

      if (displayWidth > maxWidth) {
        displayHeight = (maxWidth / displayWidth) * displayHeight;
        displayWidth = maxWidth;
      }
      if (displayHeight > maxHeight) {
        displayWidth = (maxHeight / displayHeight) * displayWidth;
        displayHeight = maxHeight;
      }

      setDisplayDimensions({ width: displayWidth, height: displayHeight });
      setCropArea(null);

      // Add to history
      setHistory(prev => [...prev.slice(0, historyIndex + 1), croppedDataUrl]);
      setHistoryIndex(prev => prev + 1);
    };
    newImg.src = croppedDataUrl;
  };

  // Reset adjustments
  const resetAdjustments = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setCropArea(null);
  };

  // Rotate image
  const rotateLeft = () => setRotation(prev => (prev - 90) % 360);
  const rotateRight = () => setRotation(prev => (prev + 90) % 360);

  // Flip image
  const toggleFlipH = () => setFlipH(prev => !prev);
  const toggleFlipV = () => setFlipV(prev => !prev);

  // Zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevImage = history[prevIndex];

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImageDimensions({ width: img.width, height: img.height });

        const maxWidth = 700;
        const maxHeight = 500;
        let displayWidth = img.width;
        let displayHeight = img.height;

        if (displayWidth > maxWidth) {
          displayHeight = (maxWidth / displayWidth) * displayHeight;
          displayWidth = maxWidth;
        }
        if (displayHeight > maxHeight) {
          displayWidth = (maxHeight / displayHeight) * displayWidth;
          displayHeight = maxHeight;
        }

        setDisplayDimensions({ width: displayWidth, height: displayHeight });
      };
      img.src = prevImage;
    }
  };

  // Save edited image
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create final canvas with all transformations baked in
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx || !imageRef.current) return;

    // If there's a crop area, use that; otherwise use full image
    if (cropArea) {
      finalCanvas.width = cropArea.width;
      finalCanvas.height = cropArea.height;
      finalCtx.drawImage(
        canvas,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      );
    } else {
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      finalCtx.drawImage(canvas, 0, 0);
    }

    const dataUrl = finalCanvas.toDataURL('image/png', 0.9);
    onSave(dataUrl);
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="bm-image-editor-backdrop" onClick={handleBackdropClick}>
      <div className="bm-image-editor" ref={containerRef}>
        {/* Header */}
        <div className="bm-image-editor__header">
          <div className="bm-image-editor__title">
            <HiOutlinePhotograph />
            <span>Image Editor</span>
          </div>
          <div className="bm-image-editor__header-actions">
            <button
              className="bm-image-editor__btn bm-image-editor__btn--icon"
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo"
            >
              <HiOutlineRefresh style={{ transform: 'scaleX(-1)' }} />
            </button>
            <button
              className="bm-image-editor__btn bm-image-editor__btn--icon"
              onClick={resetAdjustments}
              title="Reset All"
            >
              <HiOutlineRefresh />
            </button>
            <button
              className="bm-image-editor__btn bm-image-editor__btn--icon bm-image-editor__btn--close"
              onClick={onClose}
              title="Close"
            >
              <HiOutlineX />
            </button>
          </div>
        </div>

        <div className="bm-image-editor__body">
          {/* Toolbar */}
          <div className="bm-image-editor__toolbar">
            <div className="bm-image-editor__tool-group">
              <button
                className={`bm-image-editor__tool ${activeTool === 'crop' ? 'active' : ''}`}
                onClick={() => setActiveTool('crop')}
                title="Crop"
              >
                <MdCrop />
                <span>Crop</span>
              </button>
              <button
                className={`bm-image-editor__tool ${activeTool === 'transform' ? 'active' : ''}`}
                onClick={() => setActiveTool('transform')}
                title="Transform"
              >
                <MdRotateRight />
                <span>Transform</span>
              </button>
              <button
                className={`bm-image-editor__tool ${activeTool === 'adjust' ? 'active' : ''}`}
                onClick={() => setActiveTool('adjust')}
                title="Adjust"
              >
                <HiOutlineAdjustments />
                <span>Adjust</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="bm-image-editor__content">
            {/* Left Panel - Tool Options */}
            <div className="bm-image-editor__panel">
              {activeTool === 'crop' && (
                <div className="bm-image-editor__panel-section">
                  <h4>Aspect Ratio</h4>
                  <div className="bm-image-editor__aspect-ratios">
                    {aspectRatios.map(ratio => (
                      <button
                        key={ratio.label}
                        className={`bm-image-editor__aspect-btn ${selectedAspectRatio === ratio.value ? 'active' : ''}`}
                        onClick={() => setSelectedAspectRatio(ratio.value)}
                      >
                        <MdAspectRatio />
                        <span>{ratio.label}</span>
                      </button>
                    ))}
                  </div>
                  {cropArea && cropArea.width > 0 && (
                    <button
                      className="bm-image-editor__btn bm-image-editor__btn--primary"
                      onClick={applyCrop}
                    >
                      <HiOutlineCheck />
                      <span>Apply Crop</span>
                    </button>
                  )}
                  <p className="bm-image-editor__hint">
                    Click and drag on the image to select crop area
                  </p>
                </div>
              )}

              {activeTool === 'transform' && (
                <div className="bm-image-editor__panel-section">
                  <h4>Rotate</h4>
                  <div className="bm-image-editor__btn-row">
                    <button
                      className="bm-image-editor__btn"
                      onClick={rotateLeft}
                      title="Rotate Left 90°"
                    >
                      <MdRotateLeft />
                      <span>Left</span>
                    </button>
                    <button
                      className="bm-image-editor__btn"
                      onClick={rotateRight}
                      title="Rotate Right 90°"
                    >
                      <MdRotateRight />
                      <span>Right</span>
                    </button>
                  </div>

                  <h4>Flip</h4>
                  <div className="bm-image-editor__btn-row">
                    <button
                      className={`bm-image-editor__btn ${flipH ? 'active' : ''}`}
                      onClick={toggleFlipH}
                      title="Flip Horizontal"
                    >
                      <HiOutlineSwitchHorizontal />
                      <span>Horizontal</span>
                    </button>
                    <button
                      className={`bm-image-editor__btn ${flipV ? 'active' : ''}`}
                      onClick={toggleFlipV}
                      title="Flip Vertical"
                    >
                      <HiOutlineSwitchVertical />
                      <span>Vertical</span>
                    </button>
                  </div>

                  <h4>Zoom</h4>
                  <div className="bm-image-editor__zoom-control">
                    <button
                      className="bm-image-editor__btn bm-image-editor__btn--icon"
                      onClick={zoomOut}
                      disabled={zoom <= 0.5}
                    >
                      <HiOutlineZoomOut />
                    </button>
                    <span className="bm-image-editor__zoom-value">{Math.round(zoom * 100)}%</span>
                    <button
                      className="bm-image-editor__btn bm-image-editor__btn--icon"
                      onClick={zoomIn}
                      disabled={zoom >= 3}
                    >
                      <HiOutlineZoomIn />
                    </button>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={zoom * 100}
                    onChange={(e) => setZoom(Number(e.target.value) / 100)}
                    className="bm-image-editor__slider"
                  />
                </div>
              )}

              {activeTool === 'adjust' && (
                <div className="bm-image-editor__panel-section">
                  <h4>
                    <HiOutlineSun />
                    Brightness
                  </h4>
                  <div className="bm-image-editor__slider-row">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="bm-image-editor__slider"
                    />
                    <span className="bm-image-editor__slider-value">{brightness}%</span>
                  </div>

                  <h4>
                    <HiOutlineAdjustments />
                    Contrast
                  </h4>
                  <div className="bm-image-editor__slider-row">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="bm-image-editor__slider"
                    />
                    <span className="bm-image-editor__slider-value">{contrast}%</span>
                  </div>

                  <h4>Saturation</h4>
                  <div className="bm-image-editor__slider-row">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="bm-image-editor__slider"
                    />
                    <span className="bm-image-editor__slider-value">{saturation}%</span>
                  </div>

                  <button
                    className="bm-image-editor__btn"
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                      setSaturation(100);
                    }}
                  >
                    <HiOutlineRefresh />
                    <span>Reset Adjustments</span>
                  </button>
                </div>
              )}
            </div>

            {/* Canvas Area */}
            <div className="bm-image-editor__canvas-container">
              {loading ? (
                <div className="bm-image-editor__loading">
                  <div className="bm-image-editor__spinner"></div>
                  <span>Loading image...</span>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="bm-image-editor__canvas"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{
                    cursor: activeTool === 'crop' ? 'crosshair' : 'default'
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bm-image-editor__footer">
          <div className="bm-image-editor__dimensions">
            {imageDimensions.width > 0 && (
              <span>
                Original: {imageDimensions.width} x {imageDimensions.height}px
              </span>
            )}
          </div>
          <div className="bm-image-editor__footer-actions">
            <button
              className="bm-image-editor__btn bm-image-editor__btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="bm-image-editor__btn bm-image-editor__btn--primary"
              onClick={handleSave}
              disabled={loading}
            >
              <HiOutlineDownload />
              <span>Save & Use</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageEditor;
