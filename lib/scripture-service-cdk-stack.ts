import * as cdk from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from "path";
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';

export class ScriptureServiceCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda function to get the scripture text
    const fn = new lambda.Function(this, "daily-office-get-scripture-v2", {
      runtime: lambda.Runtime.PYTHON_3_7,
      handler: "lambda_function.lambda_handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../src/build"))
    });

    // TODO bring the certificate under management of CDK?
    // TODO move this out into an environment variable
    // cert for davidbettis.com, *.api.davidbettis.com
    const certificate: acm.ICertificate = acm.Certificate.fromCertificateArn(this,
      'daily-office-api-cert',
      'arn:aws:acm:us-east-1:934587002178:certificate/7734d6b5-96b3-4e68-8b4c-88bdd5ceba80'
    );

    // TODO move the domain name out into config
    // TODO infer zone from hostname
    // the zone for davidbettis.com
    const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: "davidbettis.com" });

    ['test', 'prod'].map(stage => {
      // TODO move out into config

      const hostname = 'daily-office-v2-' + stage + '.api.davidbettis.com'

      // Custom domain to use
      const domain: apigateway.DomainNameOptions = {
        certificate: certificate,
        domainName: hostname,
        securityPolicy: apigateway.SecurityPolicy.TLS_1_2
      };

      // the endpoint
      const apigw = new apigateway.LambdaRestApi(this, 'daily-office-get-scripture-v2-API-' + stage, {
        domainName: domain,
        handler: fn,
        proxy: false,
        deployOptions: {
          stageName: stage
        }
      });

      // add REST endpoints
      const scripture = apigw.root.addResource('scripture');
      scripture.addMethod('GET');

      // map a DNS record to the endpoint
      const dns = new route53.ARecord(this, 'daily-office-api-record-' + stage, {
        zone: zone,
        target: route53.RecordTarget.fromAlias(new targets.ApiGateway(apigw)),
        recordName: hostname
      });
    });

  }
}
