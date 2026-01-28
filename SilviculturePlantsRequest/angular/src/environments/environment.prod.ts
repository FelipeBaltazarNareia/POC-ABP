import { Environment } from '@abp/ng.core';

const baseUrl = 'http://localhost:4200';

const oAuthConfig = {
  issuer: 'https://localhost:44396/',
  redirectUri: baseUrl,
  clientId: 'SilviculturePlantsRequest_App',
  responseType: 'code',
  scope: 'offline_access SilviculturePlantsRequest',
  requireHttps: true,
};

export const environment = {
  production: true,
  application: {
    baseUrl,
    name: 'SilviculturePlantsRequest',
  },
  oAuthConfig,
  apis: {
    default: {
      url: 'https://localhost:44396',
      rootNamespace: 'SilviculturePlantsRequest',
    },
    AbpAccountPublic: {
      url: oAuthConfig.issuer,
      rootNamespace: 'AbpAccountPublic',
    },
  },
  remoteEnv: {
    url: '/getEnvConfig',
    mergeStrategy: 'deepmerge'
  }
} as Environment;
