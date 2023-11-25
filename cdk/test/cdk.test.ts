import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as Cdk from "../lib/cdk-stack";

test("S3 Bucket Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Cdk.AwsCdkV2AppStack(app, "AwsCdkV2AppStack");
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::S3::Bucket", {});
});

test("OriginAccessIdentity Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Cdk.AwsCdkV2AppStack(app, "AwsCdkV2AppStack");
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties(
    "AWS::CloudFront::CloudFrontOriginAccessIdentity",
    {
      CloudFrontOriginAccessIdentityConfig: {
        Comment: "website-distribution-originAccessIdentity",
      },
    }
  );
});

test("webSiteBucketPolicyStatement Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Cdk.AwsCdkV2AppStack(app, "AwsCdkV2AppStack");
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::IAM::Policy", {
    PolicyDocument: {
      Statement: [
        {
          Action: ["s3:GetObject*", "s3:GetBucket*", "s3:List*"],
          Effect: "Allow",
        },
        {
          Action: [
            "s3:GetObject*",
            "s3:GetBucket*",
            "s3:List*",
            "s3:DeleteObject*",
            "s3:PutObject",
            "s3:PutObjectLegalHold",
            "s3:PutObjectRetention",
            "s3:PutObjectTagging",
            "s3:PutObjectVersionTagging",
            "s3:Abort*",
          ],
          Effect: "Allow",
        },
        {
          Action: [
            "cloudfront:GetInvalidation",
            "cloudfront:CreateInvalidation",
          ],
          Effect: "Allow",
        },
      ],
      Version: "2012-10-17",
    },
  });
});

test("Cloudfront Distribution Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Cdk.AwsCdkV2AppStack(app, "AwsCdkV2AppStack");
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::CloudFront::Distribution", {
    DistributionConfig: {
      DefaultCacheBehavior: {
        AllowedMethods: ["GET", "HEAD"],
        CachedMethods: ["GET", "HEAD"],
        Compress: true,
        ViewerProtocolPolicy: "redirect-to-https",
      },
      DefaultRootObject: "index.html",
      Enabled: true,
      HttpVersion: "http2",
      IPV6Enabled: true,
      PriceClass: "PriceClass_All",
    },
  });
});

test("Cloudfront Function Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Cdk.AwsCdkV2AppStack(app, "AwsCdkV2AppStack");
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::CloudFront::Function", {});
});
