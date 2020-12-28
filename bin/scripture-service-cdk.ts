#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ScriptureServiceCdkStack } from '../lib/scripture-service-cdk-stack';

const app = new cdk.App();
new ScriptureServiceCdkStack(app, 'ScriptureServiceCdkStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});
