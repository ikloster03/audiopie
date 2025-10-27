declare module 'fluent-ffmpeg' {
  export interface FfmpegCommand {
    input(source: string): FfmpegCommand;
    inputOptions(options: string[]): FfmpegCommand;
    output(target: string): FfmpegCommand;
    outputOptions(options: string[]): FfmpegCommand;
    audioCodec(codec: string): FfmpegCommand;
    audioBitrate(bitrate: string): FfmpegCommand;
    audioQuality(quality: number): FfmpegCommand;
    noVideo(): FfmpegCommand;
    on(event: string, handler: (...args: any[]) => void): FfmpegCommand;
    run(): void;
    kill(signal?: string): void;
    getAvailableCodecs(callback: (err: Error | null, codecs: Record<string, any>) => void): FfmpegCommand;
  }

  export interface FfprobeData {
    format?: {
      duration?: number;
    };
  }

  export interface CodecData {
    [key: string]: any;
  }

  interface Ffmpeg {
    (): FfmpegCommand;
    setFfmpegPath(path: string): void;
    setFfprobePath(path: string): void;
    ffprobe(file: string, callback: (err: Error | null, data: FfprobeData) => void): void;
  }

  const ffmpeg: Ffmpeg;
  export default ffmpeg;
}

