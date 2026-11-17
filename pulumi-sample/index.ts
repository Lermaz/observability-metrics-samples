import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Get the id for the latest Amazon Linux AMI
const ami = aws.ec2.getAmi({
    filters: [
        { name: "name", values: ["al2023-ami-2023.*-x86_64"] },
    ],
    owners: ["137112412989"], // Amazon
    mostRecent: true,
}).then(result => result.id);

// create a new security group for port 80
const group = new aws.ec2.SecurityGroup("web-secgrp", {
    ingress: [
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
    ],
});

const server = new aws.ec2.Instance("web-server-www", {
    tags: { "Name": "web-server-www" },
    instanceType: aws.ec2.InstanceType.T2_Micro, // t2.micro is available in the AWS free tier
    vpcSecurityGroupIds: [ group.id ], // reference the group object above
    ami: ami,
});

export const publicIp = server.publicIp;
export const publicHostName = server.publicDns;