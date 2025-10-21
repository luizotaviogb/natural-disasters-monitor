import React, { useState } from 'react';

interface Image3DViewerProps {
  earthquakeId: string;
  images: any[];
  onProcessImage?: (type: string) => void;
}

export const Image3DViewer: React.FC<Image3DViewerProps> = ({
  images,
  onProcessImage,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ORIGINAL');
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  const imageTypes = [
    { key: 'ORIGINAL', label: 'Original', description: 'Original earthquake image' },
    { key: 'EDGE_DETECTED', label: 'Edge Detection', description: 'Canny + Sobel edge detection' },
    { key: 'FFT_TRANSFORMED', label: 'FFT Transform', description: 'Frequency domain analysis' },
    { key: 'PROCESSED_3D', label: '3D Heightmap', description: '3D visualization data' },
  ];

  const getImageForType = (type: string) => {
    return images.find((img) => img.imageType === type);
  };

  const currentImage = getImageForType(selectedType);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Completed' },
      PROCESSING: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Processing...' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending' },
      FAILED: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleProcess = (type: string) => {
    if (onProcessImage) {
      setProcessing((prev) => ({ ...prev, [type]: true }));
      onProcessImage(type);
      setTimeout(() => {
        setProcessing((prev) => ({ ...prev, [type]: false }));
      }, 2000);
    }
  };

  const getImageUrl = (image: any) => {
    if (image.processingStatus === 'COMPLETED') {
      return image.processedUrl || image.originalUrl;
    }
    return image.originalUrl;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Image Processing & 3D Visualization</h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {imageTypes.map((type) => {
            const image = getImageForType(type.key);
            const isSelected = selectedType === type.key;

            return (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{type.label}</span>
                  {image && getStatusBadge(image.processingStatus)}
                </div>
                <p className="text-xs text-gray-600">{type.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {currentImage ? (
          <div>
            {currentImage.processingStatus === 'COMPLETED' && (
              <div className="relative bg-gray-900">
                <img
                  src={getImageUrl(currentImage)}
                  alt={`${selectedType} visualization`}
                  className="w-full h-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                  }}
                />
                {currentImage.processingTime && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-xs">
                    Processed in {currentImage.processingTime}s
                  </div>
                )}
              </div>
            )}

            {currentImage.processingStatus === 'PROCESSING' && (
              <div className="bg-gray-100 h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Processing image...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take up to 15 seconds</p>
                </div>
              </div>
            )}

            {currentImage.processingStatus === 'PENDING' && (
              <div className="bg-gray-100 h-64 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Image ready to process</p>
                  <button
                    onClick={() => handleProcess(selectedType)}
                    disabled={processing[selectedType]}
                    className="btn-primary"
                  >
                    {processing[selectedType] ? 'Starting...' : 'Start Processing'}
                  </button>
                </div>
              </div>
            )}

            {currentImage.processingStatus === 'FAILED' && (
              <div className="bg-red-50 h-64 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-red-600 mb-4">Processing failed</p>
                  <button
                    onClick={() => handleProcess(selectedType)}
                    disabled={processing[selectedType]}
                    className="btn-primary"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {currentImage.metadata && (
              <div className="p-4 bg-gray-50 border-t">
                <h3 className="font-medium text-sm text-gray-700 mb-2">Metadata</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {currentImage.metadata.width && (
                    <>
                      <dt className="text-gray-600">Dimensions:</dt>
                      <dd className="text-gray-900">
                        {currentImage.metadata.width} x {currentImage.metadata.height}
                      </dd>
                    </>
                  )}
                  {currentImage.metadata.mean_value !== undefined && (
                    <>
                      <dt className="text-gray-600">Mean Value:</dt>
                      <dd className="text-gray-900">{currentImage.metadata.mean_value.toFixed(3)}</dd>
                    </>
                  )}
                  <dt className="text-gray-600">Created:</dt>
                  <dd className="text-gray-900">
                    {new Date(currentImage.createdAt).toLocaleString()}
                  </dd>
                </dl>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 h-64 flex items-center justify-center">
            <p className="text-gray-500 text-sm text-center px-4">
              No image available for {selectedType}
              <br />
              <button
                onClick={() => handleProcess(selectedType)}
                disabled={processing[selectedType]}
                className="mt-4 btn-primary text-sm"
              >
                Generate Image
              </button>
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-sm text-blue-900 mb-2">About the Processing</h4>
        <p className="text-xs text-blue-800">
          Each processing type takes approximately 10-15 seconds and runs through a specialized CLI tool
          that applies various image transformations for enhanced visualization and analysis.
        </p>
      </div>
    </div>
  );
};
