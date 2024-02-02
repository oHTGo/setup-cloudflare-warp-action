export type ConfigurationParams = {
  organization: string;
  authClientID: string;
  authClientSecret: string;
};

export interface WARPClient {
  writeConfigurations(configuration: ConfigurationParams): Promise<void>;
  install: (version?: string) => Promise<void>;
  checkRegistration(organization: string, isRegistered: boolean): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  checkConnection(): Promise<void>;
  cleanup(): Promise<void>;
}
