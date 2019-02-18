const configs:any = {
    testing: {
        relayURL: 'https://docker.dev:3002',
        ipnURL: 'https://docker.dev:3002/paypal-ipn',
        wsURL: 'wss://docker.dev:3004',
        returnURL: 'http://localhost:8080/purchase.html',
        cdnBasePath: '',
        purchaseURL: 'http://localhost:8080/purchase.html'
    },
    hosted_test: {
        relayURL: 'https://api-sl.stream-requests.com:8043',
        ipnURL: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
        wsURL: 'wss://api-sl.stream-requests.com:9004',
        returnURL: 'https://purchase-staging.stream-requests.com',
        cdnBasePath: 'https://purchase-staging.stream-requests.com',
        purchaseURL: 'https://purchase-staging.stream-requests.com'
    },
    released: {
        relayURL: 'https://api-sl.stream-requests.com',
        ipnURL: 'https://www.paypal.com/cgi-bin/webscr',
        wsURL: 'wss://api-sl.stream-requests.com:3004',
        returnURL: 'https://purchase.stream-requests.com',
        cdnBasePath: 'https://purchase.stream-requests.com',
        purchaseURL: 'https://purchase.stream-requests.com'
    }
};

export default configs;