interface TimingServer {
  start(date: Date, track: string): void;
  stop(date: Date, track: string): void;
  
}