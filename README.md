# About

This is a web service that supports the Daily OFfice. It vends scripture and readings according to different days of the year.

# Setup

Please install the following:
* npm i @aws-cdk/aws-lambda @aws-cdk/aws-apigateway @aws-cdk/aws-cloudfront @aws-cdk/aws-certificatemanager @aws-cdk/aws-route53 @aws-cdk/aws-route53-targets

# Configuration

Please define these environment variables:
```
export CDK_DEFAULT_ACCOUNT=<AWS account ID>
export CDK_DEFAULT_REGION=us-east-1
```

# 

# Anatomy of the project.

cdk.json - instructions on how to execute the app

lib
`- where the stack is defined
bin
`- where the stack is instantiated
src
`- for the lambda's source code

# Makefile targets

* build: transforms typescript into js
* diff: display a preview of changes to deploy
* deploy: deploys the changes to the account

