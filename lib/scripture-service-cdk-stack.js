"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptureServiceCdkStack = void 0;
const cdk = require("@aws-cdk/core");
const acm = require("@aws-cdk/aws-certificatemanager");
const apigateway = require("@aws-cdk/aws-apigateway");
const lambda = require("@aws-cdk/aws-lambda");
const path = require("path");
const route53 = require("@aws-cdk/aws-route53");
const targets = require("@aws-cdk/aws-route53-targets");
class ScriptureServiceCdkStack extends cdk.Stack {
    constructor(scope, id, props) {
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
        const certificate = acm.Certificate.fromCertificateArn(this, 'daily-office-api-cert', 'arn:aws:acm:us-east-1:934587002178:certificate/7734d6b5-96b3-4e68-8b4c-88bdd5ceba80');
        // TODO move the domain name out into config
        // TODO infer zone from hostname
        // the zone for davidbettis.com
        const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: "davidbettis.com" });
        ['test', 'prod'].map(stage => {
            // TODO move out into config
            const hostname = 'daily-office-v2-' + stage + '.api.davidbettis.com';
            // Custom domain to use
            const domain = {
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
exports.ScriptureServiceCdkStack = ScriptureServiceCdkStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0dXJlLXNlcnZpY2UtY2RrLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2NyaXB0dXJlLXNlcnZpY2UtY2RrLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFxQztBQUNyQyx1REFBdUQ7QUFDdkQsc0RBQXNEO0FBRXRELDhDQUE4QztBQUM5Qyw2QkFBNkI7QUFDN0IsZ0RBQWdEO0FBQ2hELHdEQUF3RDtBQUV4RCxNQUFhLHdCQUF5QixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3JELFlBQVksS0FBb0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDbEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsNENBQTRDO1FBQzVDLE1BQU0sRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsK0JBQStCLEVBQUU7WUFDcEUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVTtZQUNsQyxPQUFPLEVBQUUsZ0NBQWdDO1lBQ3pDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztTQUNsRSxDQUFDLENBQUM7UUFFSCxzREFBc0Q7UUFDdEQsa0RBQWtEO1FBQ2xELGtEQUFrRDtRQUNsRCxNQUFNLFdBQVcsR0FBcUIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQzNFLHVCQUF1QixFQUN2QixxRkFBcUYsQ0FDdEYsQ0FBQztRQUVGLDRDQUE0QztRQUM1QyxnQ0FBZ0M7UUFDaEMsK0JBQStCO1FBQy9CLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO1FBRTVGLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMzQiw0QkFBNEI7WUFFNUIsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLEdBQUcsS0FBSyxHQUFHLHNCQUFzQixDQUFBO1lBRXBFLHVCQUF1QjtZQUN2QixNQUFNLE1BQU0sR0FBaUM7Z0JBQzNDLFdBQVcsRUFBRSxXQUFXO2dCQUN4QixVQUFVLEVBQUUsUUFBUTtnQkFDcEIsY0FBYyxFQUFFLFVBQVUsQ0FBQyxjQUFjLENBQUMsT0FBTzthQUNsRCxDQUFDO1lBRUYsZUFBZTtZQUNmLE1BQU0sS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsb0NBQW9DLEdBQUcsS0FBSyxFQUFFO2dCQUM3RixVQUFVLEVBQUUsTUFBTTtnQkFDbEIsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osYUFBYSxFQUFFO29CQUNiLFNBQVMsRUFBRSxLQUFLO2lCQUNqQjthQUNGLENBQUMsQ0FBQztZQUVILHFCQUFxQjtZQUNyQixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN0RCxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTNCLG1DQUFtQztZQUNuQyxNQUFNLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLDBCQUEwQixHQUFHLEtBQUssRUFBRTtnQkFDeEUsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDckUsVUFBVSxFQUFFLFFBQVE7YUFDckIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFTCxDQUFDO0NBQ0Y7QUEzREQsNERBMkRDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ0Bhd3MtY2RrL2NvcmUnO1xuaW1wb3J0ICogYXMgYWNtIGZyb20gJ0Bhd3MtY2RrL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXInO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdAYXdzLWNkay9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBjbG91ZGZyb250IGZyb20gJ0Bhd3MtY2RrL2F3cy1jbG91ZGZyb250JztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdAYXdzLWNkay9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIHJvdXRlNTMgZnJvbSAnQGF3cy1jZGsvYXdzLXJvdXRlNTMnO1xuaW1wb3J0ICogYXMgdGFyZ2V0cyBmcm9tICdAYXdzLWNkay9hd3Mtcm91dGU1My10YXJnZXRzJztcblxuZXhwb3J0IGNsYXNzIFNjcmlwdHVyZVNlcnZpY2VDZGtTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLyBMYW1iZGEgZnVuY3Rpb24gdG8gZ2V0IHRoZSBzY3JpcHR1cmUgdGV4dFxuICAgIGNvbnN0IGZuID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcImRhaWx5LW9mZmljZS1nZXQtc2NyaXB0dXJlLXYyXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzcsXG4gICAgICBoYW5kbGVyOiBcImxhbWJkYV9mdW5jdGlvbi5sYW1iZGFfaGFuZGxlclwiLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsIFwiLi4vc3JjL2J1aWxkXCIpKVxuICAgIH0pO1xuXG4gICAgLy8gVE9ETyBicmluZyB0aGUgY2VydGlmaWNhdGUgdW5kZXIgbWFuYWdlbWVudCBvZiBDREs/XG4gICAgLy8gVE9ETyBtb3ZlIHRoaXMgb3V0IGludG8gYW4gZW52aXJvbm1lbnQgdmFyaWFibGVcbiAgICAvLyBjZXJ0IGZvciBkYXZpZGJldHRpcy5jb20sICouYXBpLmRhdmlkYmV0dGlzLmNvbVxuICAgIGNvbnN0IGNlcnRpZmljYXRlOiBhY20uSUNlcnRpZmljYXRlID0gYWNtLkNlcnRpZmljYXRlLmZyb21DZXJ0aWZpY2F0ZUFybih0aGlzLFxuICAgICAgJ2RhaWx5LW9mZmljZS1hcGktY2VydCcsXG4gICAgICAnYXJuOmF3czphY206dXMtZWFzdC0xOjkzNDU4NzAwMjE3ODpjZXJ0aWZpY2F0ZS83NzM0ZDZiNS05NmIzLTRlNjgtOGI0Yy04OGJkZDVjZWJhODAnXG4gICAgKTtcblxuICAgIC8vIFRPRE8gbW92ZSB0aGUgZG9tYWluIG5hbWUgb3V0IGludG8gY29uZmlnXG4gICAgLy8gVE9ETyBpbmZlciB6b25lIGZyb20gaG9zdG5hbWVcbiAgICAvLyB0aGUgem9uZSBmb3IgZGF2aWRiZXR0aXMuY29tXG4gICAgY29uc3Qgem9uZSA9IHJvdXRlNTMuSG9zdGVkWm9uZS5mcm9tTG9va3VwKHRoaXMsICdab25lJywgeyBkb21haW5OYW1lOiBcImRhdmlkYmV0dGlzLmNvbVwiIH0pO1xuXG4gICAgWyd0ZXN0JywgJ3Byb2QnXS5tYXAoc3RhZ2UgPT4ge1xuICAgICAgLy8gVE9ETyBtb3ZlIG91dCBpbnRvIGNvbmZpZ1xuXG4gICAgICBjb25zdCBob3N0bmFtZSA9ICdkYWlseS1vZmZpY2UtdjItJyArIHN0YWdlICsgJy5hcGkuZGF2aWRiZXR0aXMuY29tJ1xuXG4gICAgICAvLyBDdXN0b20gZG9tYWluIHRvIHVzZVxuICAgICAgY29uc3QgZG9tYWluOiBhcGlnYXRld2F5LkRvbWFpbk5hbWVPcHRpb25zID0ge1xuICAgICAgICBjZXJ0aWZpY2F0ZTogY2VydGlmaWNhdGUsXG4gICAgICAgIGRvbWFpbk5hbWU6IGhvc3RuYW1lLFxuICAgICAgICBzZWN1cml0eVBvbGljeTogYXBpZ2F0ZXdheS5TZWN1cml0eVBvbGljeS5UTFNfMV8yXG4gICAgICB9O1xuXG4gICAgICAvLyB0aGUgZW5kcG9pbnRcbiAgICAgIGNvbnN0IGFwaWd3ID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhUmVzdEFwaSh0aGlzLCAnZGFpbHktb2ZmaWNlLWdldC1zY3JpcHR1cmUtdjItQVBJLScgKyBzdGFnZSwge1xuICAgICAgICBkb21haW5OYW1lOiBkb21haW4sXG4gICAgICAgIGhhbmRsZXI6IGZuLFxuICAgICAgICBwcm94eTogZmFsc2UsXG4gICAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgICBzdGFnZU5hbWU6IHN0YWdlXG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBhZGQgUkVTVCBlbmRwb2ludHNcbiAgICAgIGNvbnN0IHNjcmlwdHVyZSA9IGFwaWd3LnJvb3QuYWRkUmVzb3VyY2UoJ3NjcmlwdHVyZScpO1xuICAgICAgc2NyaXB0dXJlLmFkZE1ldGhvZCgnR0VUJyk7XG5cbiAgICAgIC8vIG1hcCBhIEROUyByZWNvcmQgdG8gdGhlIGVuZHBvaW50XG4gICAgICBjb25zdCBkbnMgPSBuZXcgcm91dGU1My5BUmVjb3JkKHRoaXMsICdkYWlseS1vZmZpY2UtYXBpLXJlY29yZC0nICsgc3RhZ2UsIHtcbiAgICAgICAgem9uZTogem9uZSxcbiAgICAgICAgdGFyZ2V0OiByb3V0ZTUzLlJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IHRhcmdldHMuQXBpR2F0ZXdheShhcGlndykpLFxuICAgICAgICByZWNvcmROYW1lOiBob3N0bmFtZVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgfVxufVxuIl19