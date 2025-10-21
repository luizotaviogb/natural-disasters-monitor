import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execPromise = promisify(exec);

export type ProcessingType = 'edge' | 'fft' | '3d';

export interface ProcessingResult {
  success: boolean;
  outputPath: string;
  metadataPath?: string;
  metadata?: any;
  processingTime: number;
  error?: string;
}

export class CLIExecutor {
  private cliPath: string;
  private dataPath: string;

  constructor() {
    this.cliPath = process.env.CLI_PATH || '/app/cli';
    this.dataPath = process.env.CLI_DATA_PATH || '/data';
  }

  async processImage(
    inputUrl: string,
    outputFilename: string,
    processingType: ProcessingType,
    minTime: number = 10
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      const outputPath = path.join(this.dataPath, 'output', outputFilename);
      const metadataPath = outputPath.replace(/\.(jpg|png)$/, '_metadata.json');

      await fs.mkdir(path.join(this.dataPath, 'output'), { recursive: true });

      const command = `python ${path.join(this.cliPath, 'process_image.py')} ` +
        `--input "${inputUrl}" ` +
        `--output "${outputPath}" ` +
        `--type ${processingType} ` +
        `--min-time ${minTime} ` +
        `--metadata "${metadataPath}"`;

      console.log(`Executing CLI command: ${command}`);

      const { stdout, stderr } = await execPromise(command, {
        timeout: 120000,
      });

      if (stdout) console.log('CLI stdout:', stdout);
      if (stderr) console.error('CLI stderr:', stderr);

      let metadata = null;
      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        metadata = JSON.parse(metadataContent);
      } catch (e) {
        console.warn('Could not read metadata file:', e);
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        outputPath,
        metadataPath,
        metadata,
        processingTime: Math.round(processingTime / 1000),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error('CLI execution failed:', errorMessage);

      return {
        success: false,
        outputPath: '',
        processingTime: Math.round(processingTime / 1000),
        error: errorMessage,
      };
    }
  }

  async processImageInBackground(
    inputUrl: string,
    outputFilename: string,
    processingType: ProcessingType,
    onComplete: (result: ProcessingResult) => Promise<void>
  ): Promise<void> {
    this.processImage(inputUrl, outputFilename, processingType)
      .then(onComplete)
      .catch((error) => {
        console.error('Background processing error:', error);
        onComplete({
          success: false,
          outputPath: '',
          processingTime: 0,
          error: error.message,
        });
      });
  }
}

export const cliExecutor = new CLIExecutor();
