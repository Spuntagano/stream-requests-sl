const configs:any = {
    testing: {
        relayURL: 'https://docker.dev:3002',
        ipnURL: 'https://docker.dev:3002/paypal-ipn',
        wsURL: 'wss://docker.dev:3004',
        returnURL: 'http://localhost:8080/purchase.html',
        cdnBasePath: 'http://stream-requests-purchase.s3-website-us-west-2.amazonaws.com',
        purchaseURL: 'http://localhost:8080/purchase.html'
    },
    hosted_test: {
        relayURL: 'https://api-sl.stream-requests.com:8043',
        ipnURL: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
        wsURL: 'wss://api-sl.stream-requests.com:9004',
        returnURL: 'http://stream-requests-purchase-staging.s3-website-us-west-2.amazonaws.com',
        cdnBasePath: 'http://stream-requests-purchase-staging.s3-website-us-west-2.amazonaws.com',
        purchaseURL: 'http://stream-requests-purchase-staging.s3-website-us-west-2.amazonaws.com'
    },
    released: {
        relayURL: 'https://api-sl.stream-requests.com',
        ipnURL: 'https://www.paypal.com/cgi-bin/webscr',
        wsURL: 'wss://api-sl.stream-requests.com:3004',
        returnURL: 'http://stream-requests-purchase.s3-website-us-west-2.amazonaws.com',
        cdnBasePath: 'http://stream-requests-purchase.s3-website-us-west-2.amazonaws.com',
        purchaseURL: 'http://stream-requests-purchase.s3-website-us-west-2.amazonaws.com'
    }
};

export default configs;