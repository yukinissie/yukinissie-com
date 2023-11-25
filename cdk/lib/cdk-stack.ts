import { Construct } from "constructs";
import {
  Stack,
  StackProps,
  aws_s3,
  aws_cloudfront,
  aws_cloudfront_origins,
  aws_s3_deployment,
  aws_iam,
  RemovalPolicy,
  Duration,
} from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

export class AwsCdkV2AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const websiteBucket = new aws_s3.Bucket(this, "WebsiteBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const originAccessIdentity = new aws_cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity",
      {
        comment: "website-distribution-originAccessIdentity",
      }
    );

    const webSiteBucketPolicyStatement = new aws_iam.PolicyStatement({
      actions: ["s3:GetObject"],
      effect: aws_iam.Effect.ALLOW,
      principals: [
        new aws_iam.CanonicalUserPrincipal(
          originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
        ),
      ],
      resources: [`${websiteBucket.bucketArn}/*`],
    });

    websiteBucket.addToResourcePolicy(webSiteBucketPolicyStatement);

    const redirectFunction = new aws_cloudfront.Function(
      this,
      "redirectFunction",
      {
        code: aws_cloudfront.FunctionCode.fromFile({
          filePath: "lambda/redirect/index.js",
        }),
      }
    );

    const distribution = new aws_cloudfront.Distribution(this, "distribution", {
      comment: "website-distribution",
      defaultRootObject: "index.html",
      errorResponses: [
        {
          ttl: Duration.seconds(300),
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: "/403.html",
        },
        {
          ttl: Duration.seconds(300),
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
        },
      ],
      defaultBehavior: {
        allowedMethods: aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: aws_cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: aws_cloudfront.CachePolicy.CACHING_OPTIMIZED,
        viewerProtocolPolicy:
          aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        origin: new aws_cloudfront_origins.S3Origin(websiteBucket, {
          originAccessIdentity,
        }),
        functionAssociations: [
          {
            function: redirectFunction,
            eventType: aws_cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      priceClass: aws_cloudfront.PriceClass.PRICE_CLASS_ALL,
      domainNames: ["www.yukinissie.com", "yukinissie.com"],
      certificate: Certificate.fromCertificateArn(
        this,
        "Certificate",
        process.env.CERT_ARN!
      ),
    });

    new aws_s3_deployment.BucketDeployment(this, "WebsiteDeploy", {
      sources: [aws_s3_deployment.Source.asset("../src/")],
      destinationBucket: websiteBucket,
      distribution: distribution,
      distributionPaths: ["/*"],
    });
  }
}
