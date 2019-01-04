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
        relayURL: 'http://142.93.117.63',
        ipnURL: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
        wsURL: 'wss://142.93.117.63:9004',
        returnURL: 'http://localhost:8080/purchase.html',
        cdnBasePath: 'http://stream-requests-purchase.s3-website-us-west-2.amazonaws.com',
        purchaseURL: 'http://localhost:8080/purchase.html'
    },
    released: {
        relayURL: 'http://142.93.117.63',
        ipnURL: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
        wsURL: 'wss://142.93.117.63:3004',
        returnURL: 'http://stream-requests-purchase.s3-website-us-west-2.amazonaws.com',
        cdnBasePath: 'http://stream-requests-purchase.s3-website-us-west-2.amazonaws.com',
        purchaseURL: 'http://stream-requests-purchase.s3-website-us-west-2.amazonaws.com'
    }
};

export default configs;