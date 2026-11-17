import { createInstaller } from '@/services/update-install/createInstaller';

// The native module is the boundary: a File that records what the installer asks of it.
const mockFiles: { uri: string; exists: boolean; delete: jest.Mock; preview: jest.Mock }[] = [];
const mockTask = { downloadAsync: jest.fn() };
const mockCreateTask = jest.fn();
let mockDeleteError: Error | null = null;

jest.mock('expo-file-system', () => {
  class File {
    uri: string;
    exists = true;
    delete = jest.fn(() => {
      if (mockDeleteError) throw mockDeleteError;
    });
    preview = jest.fn(async () => undefined);
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
      mockFiles.push(this);
    }
    static createDownloadTask = (...args: unknown[]) => {
      mockCreateTask(...args);
      return mockTask;
    };
  }
  return { File, Paths: { cache: { uri: 'file:///cache' } } };
});

beforeEach(() => {
  mockFiles.length = 0;
  mockDeleteError = null;
  jest.clearAllMocks();
});

describe('real installer', () => {
  it('downloads to one fixed cache file and reports whole percentages', async () => {
    const downloaded = { uri: 'file:///cache/update.apk' };
    mockTask.downloadAsync.mockResolvedValue(downloaded);
    const percents: number[] = [];

    await expect(createInstaller().download('https://x/y.apk', (p) => percents.push(p))).resolves.toBe(downloaded);

    const [url, destination, options] = mockCreateTask.mock.calls[0];
    expect([url, destination.uri]).toEqual(['https://x/y.apk', 'file:///cache/update.apk']);
    options.onProgress({ bytesWritten: 423, totalBytes: 1000 });
    options.onProgress({ bytesWritten: 5, totalBytes: -1 });
    expect(percents).toEqual([42, 0]);
  });

  it('fails when the download fails or stops half way', async () => {
    mockTask.downloadAsync.mockRejectedValueOnce(new Error('HTTP 404'));
    await expect(createInstaller().download('https://x/y.apk', () => undefined)).rejects.toThrow('HTTP 404');
    mockTask.downloadAsync.mockResolvedValueOnce(null);
    await expect(createInstaller().download('https://x/y.apk', () => undefined)).rejects.toThrow();
  });

  it('hands the APK to Android as an APK, not as a generic file', async () => {
    await createInstaller().open({ uri: 'file:///cache/update.apk' });

    expect(mockFiles[0].preview).toHaveBeenCalledWith({ mimeType: 'application/vnd.android.package-archive' });
  });

  it('discard deletes the file if it exists and never throws', async () => {
    await createInstaller().discard();
    expect(mockFiles[0].delete).toHaveBeenCalledTimes(1);

    mockDeleteError = new Error('EACCES');
    await expect(createInstaller().discard()).resolves.toBeUndefined();
  });
});
