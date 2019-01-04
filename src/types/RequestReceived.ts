import Settings from './Settings';
import Transaction from './Transaction';

type RequestReceived = {
    settings: Settings,
    transaction: Transaction,
}

export default RequestReceived;