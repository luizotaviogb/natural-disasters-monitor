#!/usr/bin/env python3

import argparse
import time
import sys
import json
from pathlib import Path
from typing import Tuple
import urllib.request
import numpy as np
from PIL import Image
import cv2

class ImageProcessor:
    def __init__(self, min_processing_time: int = 10):
        self.min_processing_time = min_processing_time
        self.start_time = None

    def download_image(self, url: str, output_path: Path, max_retries: int = 3) -> Path:
        import urllib.error
        import http.client

        for attempt in range(max_retries):
            try:
                print(f"Downloading image from {url} (attempt {attempt + 1}/{max_retries})...")
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

                with urllib.request.urlopen(req, timeout=30) as response:
                    with open(output_path, 'wb') as out_file:
                        while True:
                            chunk = response.read(8192)
                            if not chunk:
                                break
                            out_file.write(chunk)

                print(f"Image downloaded to {output_path}")
                return output_path

            except (urllib.error.URLError, http.client.IncompleteRead, TimeoutError, Exception) as e:
                if attempt < max_retries - 1:
                    print(f"Download failed: {e}. Retrying...")
                    time.sleep(2)
                else:
                    raise Exception(f"Failed to download image after {max_retries} attempts: {str(e)}")

        raise Exception("Max retries exceeded")

    def load_image(self, input_path: str) -> Tuple[np.ndarray, Image.Image]:
        if input_path.startswith(('http://', 'https://')):
            temp_path = Path('/tmp/temp_download.jpg')
            self.download_image(input_path, temp_path)
            input_path = str(temp_path)

        print(f"Loading image from {input_path}...")
        img_pil = Image.open(input_path)
        img_cv = cv2.imread(input_path)

        if img_cv is None:
            img_cv = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

        return img_cv, img_pil

    def edge_detection(self, img: np.ndarray) -> np.ndarray:
        print("Applying edge detection (Canny + Sobel)...")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        canny = cv2.Canny(gray, 50, 150)

        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=5)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=5)
        sobel = np.sqrt(sobelx**2 + sobely**2)
        sobel = np.uint8(sobel / sobel.max() * 255)

        combined = cv2.addWeighted(canny, 0.5, sobel, 0.5, 0)

        return combined

    def fft_transform(self, img: np.ndarray) -> np.ndarray:
        print("Applying FFT transformation...")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        f = np.fft.fft2(gray)
        fshift = np.fft.fftshift(f)

        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)

        magnitude_spectrum = np.uint8(magnitude_spectrum / magnitude_spectrum.max() * 255)

        return magnitude_spectrum

    def generate_3d_heightmap(self, img: np.ndarray) -> Tuple[np.ndarray, dict]:
        print("Generating 3D heightmap visualization...")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        height, width = blurred.shape

        scale = 2
        new_height, new_width = height // scale, width // scale
        resized = cv2.resize(blurred, (new_width, new_height))

        normalized = resized.astype(float) / 255.0

        colormap = cv2.applyColorMap(resized, cv2.COLORMAP_JET)

        heightmap_data = normalized.tolist()

        metadata = {
            'width': new_width,
            'height': new_height,
            'min_value': float(normalized.min()),
            'max_value': float(normalized.max()),
            'mean_value': float(normalized.mean()),
            'original_size': {'width': width, 'height': height}
        }

        return colormap, metadata

    def process(self, input_path: str, output_path: str, process_type: str) -> dict:
        self.start_time = time.time()

        img_cv, img_pil = self.load_image(input_path)

        metadata = {
            'input': input_path,
            'output': output_path,
            'type': process_type,
            'original_size': {
                'width': img_pil.width,
                'height': img_pil.height
            }
        }

        if process_type == 'edge':
            result = self.edge_detection(img_cv)
            cv2.imwrite(output_path, result)

        elif process_type == 'fft':
            result = self.fft_transform(img_cv)
            cv2.imwrite(output_path, result)

        elif process_type == '3d':
            result, heightmap_metadata = self.generate_3d_heightmap(img_cv)
            cv2.imwrite(output_path, result)
            metadata.update(heightmap_metadata)

            heightmap_json = output_path.replace('.jpg', '_heightmap.json').replace('.png', '_heightmap.json')
            with open(heightmap_json, 'w') as f:
                json.dump(heightmap_metadata, f, indent=2)
            metadata['heightmap_data_file'] = heightmap_json

        else:
            raise ValueError(f"Unknown process type: {process_type}")

        self._ensure_min_processing_time()

        processing_time = time.time() - self.start_time
        metadata['processing_time_seconds'] = round(processing_time, 2)

        print(f"\nProcessing complete!")
        print(f"Output saved to: {output_path}")
        print(f"Processing time: {processing_time:.2f} seconds")

        return metadata

    def _ensure_min_processing_time(self):
        elapsed = time.time() - self.start_time
        if elapsed < self.min_processing_time:
            remaining = self.min_processing_time - elapsed
            print(f"Simulating additional processing time ({remaining:.1f}s)...")
            time.sleep(remaining)


def main():
    parser = argparse.ArgumentParser(
        description='Process earthquake images for 3D visualization',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python process_image.py --input image.jpg --output edge.jpg --type edge
  python process_image.py --input https://example.com/img.jpg --output fft.jpg --type fft
  python process_image.py --input image.jpg --output 3d.jpg --type 3d
        '''
    )

    parser.add_argument('--input', '-i', required=True,
                        help='Input image path or URL')
    parser.add_argument('--output', '-o', required=True,
                        help='Output image path')
    parser.add_argument('--type', '-t', required=True,
                        choices=['edge', 'fft', '3d'],
                        help='Processing type: edge (edge detection), fft (FFT transform), 3d (3D heightmap)')
    parser.add_argument('--min-time', type=int, default=10,
                        help='Minimum processing time in seconds (default: 10)')
    parser.add_argument('--metadata', '-m',
                        help='Output metadata JSON file path')

    args = parser.parse_args()

    try:
        processor = ImageProcessor(min_processing_time=args.min_time)
        metadata = processor.process(args.input, args.output, args.type)

        if args.metadata:
            with open(args.metadata, 'w') as f:
                json.dump(metadata, f, indent=2)
            print(f"Metadata saved to: {args.metadata}")

        print("\n" + "="*50)
        print("SUCCESS")
        print("="*50)

        sys.exit(0)

    except Exception as e:
        print(f"\nERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
