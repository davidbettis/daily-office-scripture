# NOTICE

In light of Anglican House Publishing sponsoring https://www.dailyoffice2019.com/, effective May 28, 2022, this project is no longer maintained.
I commend the new project to you! This contents are here for posterity only.

# About

This is a web service that supports the Daily Office (https://github.com/davidbettis/daily-office). The Daily Office is Christian devotional that guides the reader through various readings over the course of a year; this web sevice returns this text.

There are two sources for these readings: the Bible and the Apocrypha. What is the Apocrphya? It's a set of books that are not part of the more widely agreed canon of the Bible. The Anglican tradition considers the Apocrphya a source of wisdom, not authoritative for doctine.

The source of the Bible readings comes from the ESV (English Standard Version) API. To use it, you must register with ESV and obtain an API key (https://api.esv.org/). For non-commercial sites (such as mine), an API key is free. It is defined in ``credentials.py``

The source for the Apocrphya readings comes from a set of JSON files copied from the NRSV. The Daily Office only has select readings from the Apocrphya, and we only maintain data as necessary for that purpose.

This web service is implemented in Python and executed in AWS Lambda. A web service endpoint is hooked up to it via AWS API Gateway. It exposes a REST endpoint as follows:

```
/scripture

Parameters:
* date: date in YYYY-MM-dd format
* office: 'morning' or 'evening'
```

# TODO

* Cache the ESV API's response on disk, so warm Lambda containers don't have to hit api.esv.org again
* Cache the ESV API's response in Elasticache to prevent the ESV service from being overloaded; key will be the day of the year
* Add support for different lectionaries
* Is there a secure way to store API keys? credentials.py seems awful. AWS KMS works, but is there a way to not be so coupled to AWS?

# Setup

Please install the following:

* npm i @aws-cdk/aws-lambda @aws-cdk/aws-apigateway @aws-cdk/aws-cloudfront @aws-cdk/aws-certificatemanager @aws-cdk/aws-route53 @aws-cdk/aws-route53-targets

# Configuration

Please define these environment variables:

```
export CDK_DEFAULT_ACCOUNT=<AWS account ID>
export CDK_DEFAULT_REGION=us-east-1
```

# Anatomy of the project.

* cdk.json - instructions on how to execute the app
* lib - where the AWS stack is defined
* bin - where the AWS stack is instantitaed
* src - home for the Lambda's Python source code

# Makefile targets

* build: transforms typescript into js
* diff: display a preview of changes to deploy
* deploy: deploys the changes to the account

