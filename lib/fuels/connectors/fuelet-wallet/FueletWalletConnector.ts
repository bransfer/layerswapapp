import type { ConnectorMetadata } from 'fuels';
import { APP_IMAGE_DARK, APP_IMAGE_LIGHT } from './constants';
import { FuelWalletConnector } from '../fuel-wallet';

export class FueletWalletConnector extends FuelWalletConnector {
    name = 'Fuelet Wallet';
    metadata: ConnectorMetadata = {
        image: {
            light: APP_IMAGE_LIGHT,
            dark: APP_IMAGE_DARK,
        },
        install: {
            action: 'Install',
            description: 'Install Fuelet Wallet in order to connect it.',
            link: 'https://fuelet.app/download/',
        },
    };

    constructor() {
        super('Fuelet Wallet');
    }
}