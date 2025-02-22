import fs from 'fs';
import path from 'path';
import { DataIndexer } from './indexer';

export class DefragmentMinedData {
  private dataIndexer: DataIndexer;

  constructor(_dataIndexer: DataIndexer) {
    this.dataIndexer = _dataIndexer;
  }

  async defragmentAndIndex(directory: string): Promise<void> {
    const files = await fs.promises.readdir(directory);

    fs.mkdirSync(path.join(directory, 'test'));
    fs.writeFileSync(path.join(directory, 'test', 'test-file.ts'), 'test');
    console.log('done writing test file');
    for (const file of files) {
      const filePath = path.join(directory, file);
      const fileStat = await fs.promises.stat(filePath);

      if (fileStat.isFile()) {
        const timestamp = this.extractTimestamp(file);
        const dateSegment = new Date(parseInt(timestamp))
          .toISOString()
          .split('T')[0];
        const newFileName = this.generateNewFileName(file, timestamp);
        const newFilePath = path.join(directory, dateSegment, newFileName);

        await fs.promises.mkdir(path.dirname(newFilePath), { recursive: true });
        await fs.promises.rename(filePath, newFilePath);

        const exists = await this.dataIndexer.checkIfIndexed(timestamp);
        if (!exists) {
          const fileContent = await fs.promises.readFile(newFilePath, 'utf-8');
          const data = JSON.parse(fileContent);
          await this.dataIndexer.indexData(
            data,
            new Date(parseInt(timestamp)),
            this.extractKey(file),
          );
        }
      }
    }
  }

  private extractTimestamp(fileName: string): string {
    const match = fileName.match(/(\d+)_historical_data/);
    if (!match) {
      throw new Error(`Invalid file name format: ${fileName}`);
    }
    return match[1];
  }

  private generateNewFileName(fileName: string, timestamp: string): string {
    const date = new Date(parseInt(timestamp)).toISOString();
    const key = this.extractKey(fileName);
    return `${date}_historical_data_${key}.json`;
  }

  private extractKey(fileName: string): string {
    const match = fileName.match(/historical_data_(.+)\.json/);
    if (!match) {
      throw new Error(`Invalid file name format: ${fileName}`);
    }
    return match[1];
  }
}
